"""
Hierarchical User Creation Views for Multi-Party Political CRM
SuperAdmin → State Admin → Zone Admin → District Admin → Constituency Admin → Booth Admin → Analyst
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction
from api.models import UserProfile, Organization, State, Zone, District, Constituency, PollingBooth
from api.serializers import UserSerializer
from api.permissions.role_permissions import IsSuperAdmin

User = get_user_model()


# ============================================================================
# SUPERADMIN APIs - Create Party & State Admin
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_parties(request):
    """
    List all political parties (organizations)
    """
    parties = Organization.objects.all()

    parties_data = []
    for party in parties:
        parties_data.append({
            'id': party.id,
            'name': party.name,
            'slug': party.slug,
            'party_name': party.party_name,
            'party_symbol': party.party_symbol,
            'party_color': party.party_color,
            'subscription_tier': party.subscription_tier,
            'max_users': party.max_users,
            'created_at': party.created_at
        })

    return Response(parties_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_states(request):
    """
    List all states
    """
    states = State.objects.all()

    states_data = []
    for state in states:
        states_data.append({
            'id': state.id,
            'name': state.name,
            'code': state.code,
            'created_at': state.created_at
        })

    return Response(states_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_zones(request):
    """
    List zones (optionally filtered by state)
    """
    state_id = request.query_params.get('state')

    if state_id:
        zones = Zone.objects.filter(state_id=state_id)
    else:
        zones = Zone.objects.all()

    zones_data = []
    for zone in zones:
        zones_data.append({
            'id': zone.id,
            'name': zone.name,
            'code': zone.code,
            'state': zone.state.name,
            'state_id': zone.state.id
        })

    return Response(zones_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_districts(request):
    """
    List districts (optionally filtered by zone)
    """
    zone_id = request.query_params.get('zone')

    if zone_id:
        districts = District.objects.filter(zone_id=zone_id)
    else:
        districts = District.objects.all()

    districts_data = []
    for district in districts:
        districts_data.append({
            'id': district.id,
            'name': district.name,
            'code': district.code,
            'zone': district.zone.name,
            'zone_id': district.zone.id
        })

    return Response(districts_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def create_party(request):
    """
    SuperAdmin creates a new political party (Organization)
    """
    data = request.data

    try:
        party = Organization.objects.create(
            name=data.get('name'),
            slug=data.get('slug'),
            party_name=data.get('party_name'),
            party_symbol=data.get('party_symbol', ''),
            party_color=data.get('party_color', ''),
            subscription_tier=data.get('subscription_tier', 'basic'),
            max_users=data.get('max_users', 100)
        )

        return Response({
            'success': True,
            'message': f'Party "{party.party_name}" created successfully',
            'party': {
                'id': party.id,
                'name': party.name,
                'party_name': party.party_name,
                'party_symbol': party.party_symbol,
                'party_color': party.party_color
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def create_state_admin(request):
    """
    SuperAdmin creates State Admin for a party
    """
    data = request.data

    try:
        with transaction.atomic():
            # Create user
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )

            # Get party and state
            party = Organization.objects.get(id=data.get('party_id'))
            state = State.objects.get(id=data.get('state_id'))

            # Create/update profile
            profile, created = UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    'role': 'state_admin',
                    'organization': party,
                    'assigned_state': state,
                    'created_by': request.user
                }
            )

            return Response({
                'success': True,
                'message': f'State Admin "{user.username}" created for {party.party_name} - {state.name}',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': profile.role,
                    'party': party.party_name,
                    'state': state.name
                }
            }, status=status.HTTP_201_CREATED)

    except Organization.DoesNotExist:
        return Response({'error': 'Party not found'}, status=status.HTTP_404_NOT_FOUND)
    except State.DoesNotExist:
        return Response({'error': 'State not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# STATE ADMIN APIs - Create Zone Admin
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_zone_admin(request):
    """
    State Admin creates Zone Admin
    """
    profile = request.user.profile

    if profile.role != 'state_admin':
        return Response({'error': 'Only State Admins can create Zone Admins'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )

            zone = Zone.objects.get(id=data.get('zone_id'))

            # Verify zone belongs to state admin's state
            if zone.state != profile.assigned_state:
                user.delete()
                return Response({'error': 'Zone does not belong to your state'}, status=status.HTTP_403_FORBIDDEN)

            new_profile = UserProfile.objects.create(
                user=user,
                role='zone_admin',
                organization=profile.organization,
                assigned_state=profile.assigned_state,
                assigned_zone=zone,
                created_by=request.user
            )

            return Response({
                'success': True,
                'message': f'Zone Admin "{user.username}" created for {zone.name}',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': new_profile.role,
                    'zone': zone.name
                }
            }, status=status.HTTP_201_CREATED)

    except Zone.DoesNotExist:
        return Response({'error': 'Zone not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# ZONE ADMIN APIs - Create District Admin
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_district_admin(request):
    """
    Zone Admin creates District Admin
    """
    profile = request.user.profile

    if profile.role != 'zone_admin':
        return Response({'error': 'Only Zone Admins can create District Admins'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )

            district = District.objects.get(id=data.get('district_id'))

            # Verify district belongs to zone admin's zone
            if district.zone != profile.assigned_zone:
                user.delete()
                return Response({'error': 'District does not belong to your zone'}, status=status.HTTP_403_FORBIDDEN)

            new_profile = UserProfile.objects.create(
                user=user,
                role='district_admin',
                organization=profile.organization,
                assigned_state=profile.assigned_state,
                assigned_zone=profile.assigned_zone,
                assigned_district=district,
                created_by=request.user
            )

            return Response({
                'success': True,
                'message': f'District Admin "{user.username}" created for {district.name}',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': new_profile.role,
                    'district': district.name
                }
            }, status=status.HTTP_201_CREATED)

    except District.DoesNotExist:
        return Response({'error': 'District not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# DISTRICT ADMIN APIs - Create Constituency Admin
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_constituency_admin(request):
    """
    District Admin creates Constituency Admin
    """
    profile = request.user.profile

    if profile.role != 'district_admin':
        return Response({'error': 'Only District Admins can create Constituency Admins'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )

            constituency = Constituency.objects.get(id=data.get('constituency_id'))

            # Verify constituency belongs to district admin's district
            if constituency.district != profile.assigned_district:
                user.delete()
                return Response({'error': 'Constituency does not belong to your district'}, status=status.HTTP_403_FORBIDDEN)

            new_profile = UserProfile.objects.create(
                user=user,
                role='constituency_admin',
                organization=profile.organization,
                assigned_state=profile.assigned_state,
                assigned_zone=profile.assigned_zone,
                assigned_district=profile.assigned_district,
                assigned_constituency=constituency,
                created_by=request.user
            )

            return Response({
                'success': True,
                'message': f'Constituency Admin "{user.username}" created for {constituency.name}',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': new_profile.role,
                    'constituency': constituency.name
                }
            }, status=status.HTTP_201_CREATED)

    except Constituency.DoesNotExist:
        return Response({'error': 'Constituency not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# CONSTITUENCY ADMIN APIs - Create Booth Admin
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booth_admin(request):
    """
    Constituency Admin creates Booth Admin
    """
    profile = request.user.profile

    if profile.role != 'constituency_admin':
        return Response({'error': 'Only Constituency Admins can create Booth Admins'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )

            booth = PollingBooth.objects.get(id=data.get('booth_id'))

            # Verify booth belongs to constituency admin's constituency
            if booth.constituency != profile.assigned_constituency:
                user.delete()
                return Response({'error': 'Booth does not belong to your constituency'}, status=status.HTTP_403_FORBIDDEN)

            new_profile = UserProfile.objects.create(
                user=user,
                role='booth_admin',
                organization=profile.organization,
                assigned_state=profile.assigned_state,
                assigned_zone=profile.assigned_zone,
                assigned_district=profile.assigned_district,
                assigned_constituency=profile.assigned_constituency,
                assigned_booth=booth,
                created_by=request.user
            )

            return Response({
                'success': True,
                'message': f'Booth Admin "{user.username}" created for Booth #{booth.booth_number}',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': new_profile.role,
                    'booth': f'Booth {booth.booth_number}'
                }
            }, status=status.HTTP_201_CREATED)

    except PollingBooth.DoesNotExist:
        return Response({'error': 'Booth not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# BOOTH ADMIN APIs - Create Analyst
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_analyst(request):
    """
    Booth Admin creates Analyst (Read-only user)
    """
    profile = request.user.profile

    if profile.role != 'booth_admin':
        return Response({'error': 'Only Booth Admins can create Analysts'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )

            new_profile = UserProfile.objects.create(
                user=user,
                role='analyst',
                organization=profile.organization,
                assigned_state=profile.assigned_state,
                assigned_zone=profile.assigned_zone,
                assigned_district=profile.assigned_district,
                assigned_constituency=profile.assigned_constituency,
                assigned_booth=profile.assigned_booth,
                created_by=request.user
            )

            return Response({
                'success': True,
                'message': f'Analyst "{user.username}" created',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': new_profile.role
                }
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# LIST USERS (Hierarchical)
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_my_users(request):
    """
    List users created by current user (hierarchical)
    """
    profile = request.user.profile

    # Get users created by current user
    created_users = User.objects.filter(created_users__isnull=False, profile__created_by=request.user)

    users_data = []
    for user in created_users:
        user_profile = user.profile
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user_profile.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'assigned_location': get_user_location(user_profile),
            'created_at': user.date_joined
        })

    return Response({
        'success': True,
        'count': len(users_data),
        'users': users_data
    })


def get_user_location(profile):
    """Helper to get user's assigned location"""
    if profile.assigned_booth:
        return f"Booth {profile.assigned_booth.booth_number}"
    elif profile.assigned_constituency:
        return profile.assigned_constituency.name
    elif profile.assigned_district:
        return profile.assigned_district.name
    elif profile.assigned_zone:
        return profile.assigned_zone.name
    elif profile.assigned_state:
        return profile.assigned_state.name
    return "Not assigned"
