"""
Tenant/Organization management views for SuperAdmin
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models import Organization, UserProfile
from api.permissions.role_permissions import IsSuperAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def get_tenant_stats(request):
    """
    Get tenant/organization statistics for SuperAdmin dashboard
    """
    total_tenants = Organization.objects.count()
    active_tenants = Organization.objects.filter(subscription_status='active').count()
    trial_tenants = Organization.objects.filter(subscription_tier='trial').count()

    return Response({
        'total_tenants': total_tenants,
        'active_tenants': active_tenants,
        'trial_tenants': trial_tenants
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def list_tenants(request):
    """
    List all tenants/organizations with details
    """
    tenants = Organization.objects.all().order_by('-created_at')

    tenants_data = []
    for org in tenants:
        # Count users in this org
        user_count = UserProfile.objects.filter(organization=org).count()

        # Get admin users
        admins = UserProfile.objects.filter(
            organization=org,
            role__in=['state_admin', 'admin']
        )

        tenants_data.append({
            'id': org.id,
            'name': org.name,
            'slug': org.slug,
            'party_name': org.party_name,
            'party_symbol': org.party_symbol,
            'party_color': org.party_color,
            'subscription_status': org.subscription_status,
            'subscription_tier': org.subscription_tier,
            'max_users': org.max_users,
            'current_users': user_count,
            'admins': [
                {
                    'username': admin.user.username,
                    'email': admin.user.email,
                    'role': admin.role
                } for admin in admins[:3]  # Show max 3 admins
            ],
            'created_at': org.created_at,
            'updated_at': org.updated_at
        })

    return Response({
        'success': True,
        'count': len(tenants_data),
        'tenants': tenants_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def get_tenant_detail(request, tenant_id):
    """
    Get detailed information about a specific tenant
    """
    try:
        org = Organization.objects.get(id=tenant_id)

        # Get all users in this org
        users = UserProfile.objects.filter(organization=org)
        total_users = users.count()
        active_users = users.filter(user__is_active=True).count()

        # Get users by role
        role_distribution = {}
        for role_choice in UserProfile.ROLE_CHOICES:
            role_code = role_choice[0]
            role_count = users.filter(role=role_code).count()
            if role_count > 0:
                role_distribution[role_code] = role_count

        return Response({
            'success': True,
            'tenant': {
                'id': org.id,
                'name': org.name,
                'party_name': org.party_name,
                'party_symbol': org.party_symbol,
                'party_color': org.party_color,
                'subscription_status': org.subscription_status,
                'subscription_tier': org.subscription_tier,
                'max_users': org.max_users,
                'stats': {
                    'total_users': total_users,
                    'active_users': active_users,
                    'role_distribution': role_distribution
                },
                'created_at': org.created_at,
                'updated_at': org.updated_at
            }
        })

    except Organization.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Tenant not found'
        }, status=404)
