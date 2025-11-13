"""
Phase 2: Campaign Management ViewSets
Provides REST APIs for political campaign management
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta

from ..models import (
    Constituency, PollingBooth, Voter, Campaign, CampaignActivity,
    Issue, VoterInteraction, SentimentAnalysis
)
from ..serializers import (
    ConstituencySerializer, ConstituencyListSerializer,
    PollingBoothSerializer, PollingBoothListSerializer,
    VoterSerializer, VoterListSerializer, VoterSentimentUpdateSerializer,
    CampaignSerializer, CampaignListSerializer,
    CampaignActivitySerializer,
    IssueSerializer, IssueListSerializer,
    VoterInteractionSerializer,
    SentimentAnalysisSerializer,
    DashboardStatsSerializer
)
from ..permissions import IsAdminOrAbove, IsSuperAdmin


class ConstituencyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Constituency management

    Endpoints:
    - GET /api/constituencies/ - List all constituencies
    - POST /api/constituencies/ - Create new constituency
    - GET /api/constituencies/{id}/ - Get constituency details
    - PUT/PATCH /api/constituencies/{id}/ - Update constituency
    - DELETE /api/constituencies/{id}/ - Delete constituency
    - GET /api/constituencies/statistics/ - Get statistics
    """
    queryset = Constituency.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'state', 'district', 'reserved_category']
    search_fields = ['name', 'code', 'state', 'district']
    ordering_fields = ['name', 'voter_count', 'created_at']
    ordering = ['state', 'name']

    def get_serializer_class(self):
        if self.action == 'list':
            return ConstituencyListSerializer
        return ConstituencySerializer

    def get_queryset(self):
        """Filter by organization for multi-tenancy"""
        queryset = super().get_queryset()
        user = self.request.user

        # Superadmin sees all
        if user.profile.is_superadmin():
            return queryset

        # Others see only their organization's data
        if hasattr(user, 'profile') and user.profile.organization:
            return queryset.filter(organization=user.profile.organization)

        return queryset.none()

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get constituency statistics"""
        queryset = self.get_queryset()

        stats = {
            'total_constituencies': queryset.count(),
            'by_type': dict(queryset.values('type').annotate(count=Count('id')).values_list('type', 'count')),
            'by_state': dict(queryset.values('state').annotate(count=Count('id')).values_list('state', 'count')),
            'total_voters': queryset.aggregate(Sum('voter_count'))['voter_count__sum'] or 0,
            'total_booths': queryset.aggregate(Sum('total_booths'))['total_booths__sum'] or 0,
        }

        return Response(stats)

    @action(detail=True, methods=['get'])
    def polling_booths(self, request, pk=None):
        """Get all polling booths for a constituency"""
        constituency = self.get_object()
        booths = constituency.polling_booths.all()
        serializer = PollingBoothListSerializer(booths, many=True)
        return Response(serializer.data)


class PollingBoothViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Polling Booth management

    Endpoints:
    - GET /api/polling-booths/ - List all booths
    - POST /api/polling-booths/ - Create new booth
    - GET /api/polling-booths/{id}/ - Get booth details
    - PUT/PATCH /api/polling-booths/{id}/ - Update booth
    - DELETE /api/polling-booths/{id}/ - Delete booth
    - GET /api/polling-booths/by_constituency/?constituency_id={id} - Filter by constituency
    """
    queryset = PollingBooth.objects.select_related('constituency', 'organization')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['constituency', 'status', 'organization']
    search_fields = ['name', 'code', 'booth_number', 'location']
    ordering_fields = ['name', 'booth_number', 'total_voters', 'created_at']
    ordering = ['constituency', 'booth_number']

    def get_serializer_class(self):
        if self.action == 'list':
            return PollingBoothListSerializer
        return PollingBoothSerializer

    def get_queryset(self):
        """Filter by organization for multi-tenancy"""
        queryset = super().get_queryset()
        user = self.request.user

        if user.profile.is_superadmin():
            return queryset

        if hasattr(user, 'profile') and user.profile.organization:
            return queryset.filter(organization=user.profile.organization)

        return queryset.none()

    def perform_create(self, serializer):
        """Auto-assign organization and last_updated_by"""
        serializer.save(
            organization=self.request.user.profile.organization,
            last_updated_by=self.request.user
        )

    def perform_update(self, serializer):
        """Update last_updated_by"""
        serializer.save(last_updated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def by_constituency(self, request):
        """Get booths by constituency ID"""
        constituency_id = request.query_params.get('constituency_id')
        if not constituency_id:
            return Response({'error': 'constituency_id parameter required'}, status=400)

        booths = self.get_queryset().filter(constituency_id=constituency_id)
        serializer = self.get_serializer(booths, many=True)
        return Response(serializer.data)


class VoterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Voter management

    Endpoints:
    - GET /api/voters/ - List all voters (paginated)
    - POST /api/voters/ - Create new voter
    - GET /api/voters/{id}/ - Get voter details
    - PUT/PATCH /api/voters/{id}/ - Update voter
    - DELETE /api/voters/{id}/ - Delete voter
    - GET /api/voters/search/?q={query} - Search voters
    - PATCH /api/voters/{id}/update_sentiment/ - Update voter sentiment
    - POST /api/voters/bulk_update/ - Bulk update voters
    - GET /api/voters/statistics/ - Get voter statistics
    """
    queryset = Voter.objects.select_related('polling_booth', 'polling_booth__constituency', 'organization')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'polling_booth', 'gender', 'voter_category', 'sentiment',
        'first_time_voter', 'verified', 'caste_category'
    ]
    search_fields = ['full_name', 'voter_id_number', 'epic_number', 'phone']
    ordering_fields = ['full_name', 'age', 'sentiment_score', 'influencer_score', 'created_at']
    ordering = ['polling_booth', 'full_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return VoterListSerializer
        elif self.action == 'update_sentiment':
            return VoterSentimentUpdateSerializer
        return VoterSerializer

    def get_queryset(self):
        """Filter by organization for multi-tenancy"""
        queryset = super().get_queryset()
        user = self.request.user

        if user.profile.is_superadmin():
            return queryset

        if hasattr(user, 'profile') and user.profile.organization:
            return queryset.filter(organization=user.profile.organization)

        return queryset.none()

    def perform_create(self, serializer):
        """Auto-assign organization"""
        serializer.save(organization=self.request.user.profile.organization)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced voter search"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'q parameter required'}, status=400)

        voters = self.get_queryset().filter(
            Q(full_name__icontains=query) |
            Q(voter_id_number__icontains=query) |
            Q(epic_number__icontains=query) |
            Q(phone__icontains=query)
        )[:50]  # Limit to 50 results

        serializer = VoterListSerializer(voters, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_sentiment(self, request, pk=None):
        """Update voter sentiment"""
        voter = self.get_object()
        serializer = VoterSentimentUpdateSerializer(voter, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save(sentiment_last_updated=timezone.now())
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update voters"""
        voter_ids = request.data.get('voter_ids', [])
        update_data = request.data.get('data', {})

        if not voter_ids or not update_data:
            return Response({'error': 'voter_ids and data required'}, status=400)

        voters = self.get_queryset().filter(id__in=voter_ids)
        updated_count = voters.update(**update_data)

        return Response({
            'message': f'{updated_count} voters updated successfully',
            'updated_count': updated_count
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get voter statistics"""
        queryset = self.get_queryset()

        stats = {
            'total_voters': queryset.count(),
            'by_gender': dict(queryset.values('gender').annotate(count=Count('id')).values_list('gender', 'count')),
            'by_category': dict(queryset.values('voter_category').annotate(count=Count('id')).values_list('voter_category', 'count')),
            'by_sentiment': dict(queryset.values('sentiment').annotate(count=Count('id')).values_list('sentiment', 'count')),
            'first_time_voters': queryset.filter(first_time_voter=True).count(),
            'verified_voters': queryset.filter(verified=True).count(),
            'average_age': queryset.aggregate(Avg('age'))['age__avg'] or 0,
            'average_sentiment_score': queryset.aggregate(Avg('sentiment_score'))['sentiment_score__avg'] or 0,
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def by_sentiment(self, request):
        """Get voters filtered by sentiment"""
        sentiment = request.query_params.get('sentiment')
        if not sentiment:
            return Response({'error': 'sentiment parameter required'}, status=400)

        voters = self.get_queryset().filter(sentiment=sentiment)
        serializer = VoterListSerializer(voters, many=True)
        return Response(serializer.data)


class CampaignViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Campaign management

    Endpoints:
    - GET /api/campaigns/ - List all campaigns
    - POST /api/campaigns/ - Create new campaign
    - GET /api/campaigns/{id}/ - Get campaign details
    - PUT/PATCH /api/campaigns/{id}/ - Update campaign
    - DELETE /api/campaigns/{id}/ - Delete campaign
    - GET /api/campaigns/{id}/activities/ - Get campaign activities
    - GET /api/campaigns/active/ - Get active campaigns
    """
    queryset = Campaign.objects.select_related('organization', 'constituency', 'manager')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'constituency', 'manager']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return CampaignListSerializer
        return CampaignSerializer

    def get_queryset(self):
        """Filter by organization for multi-tenancy"""
        queryset = super().get_queryset()
        user = self.request.user

        if user.profile.is_superadmin():
            return queryset

        if hasattr(user, 'profile') and user.profile.organization:
            return queryset.filter(organization=user.profile.organization)

        return queryset.none()

    def perform_create(self, serializer):
        """Auto-assign organization"""
        serializer.save(organization=self.request.user.profile.organization)

    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get all activities for a campaign"""
        campaign = self.get_object()
        activities = campaign.activities.all()
        serializer = CampaignActivitySerializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active campaigns"""
        campaigns = self.get_queryset().filter(status='active')
        serializer = CampaignListSerializer(campaigns, many=True)
        return Response(serializer.data)


class CampaignActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Campaign Activity management
    """
    queryset = CampaignActivity.objects.select_related('campaign', 'polling_booth', 'assigned_to')
    serializer_class = CampaignActivitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campaign', 'activity_type', 'completed', 'polling_booth']
    search_fields = ['title', 'description']
    ordering_fields = ['scheduled_at', 'completed_at', 'created_at']
    ordering = ['-scheduled_at']

    def get_queryset(self):
        """Filter by organization through campaign"""
        queryset = super().get_queryset()
        user = self.request.user

        if user.profile.is_superadmin():
            return queryset

        if hasattr(user, 'profile') and user.profile.organization:
            return queryset.filter(campaign__organization=user.profile.organization)

        return queryset.none()


class IssueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Issue management
    """
    queryset = Issue.objects.select_related('organization', 'constituency', 'reported_by', 'assigned_to')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'priority', 'status', 'constituency']
    search_fields = ['title', 'description']
    ordering_fields = ['priority', 'created_at', 'affected_voters']
    ordering = ['-priority', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return IssueListSerializer
        return IssueSerializer

    def get_queryset(self):
        """Filter by organization for multi-tenancy"""
        queryset = super().get_queryset()
        user = self.request.user

        if user.profile.is_superadmin():
            return queryset

        if hasattr(user, 'profile') and user.profile.organization:
            return queryset.filter(organization=user.profile.organization)

        return queryset.none()

    def perform_create(self, serializer):
        """Auto-assign organization and reported_by"""
        serializer.save(
            organization=self.request.user.profile.organization,
            reported_by=self.request.user
        )


class VoterInteractionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Voter Interaction management
    """
    queryset = VoterInteraction.objects.select_related('voter', 'campaign', 'conducted_by')
    serializer_class = VoterInteractionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['voter', 'campaign', 'interaction_type', 'successful', 'follow_up_required']
    search_fields = ['subject', 'notes']
    ordering_fields = ['interaction_date', 'created_at']
    ordering = ['-interaction_date']

    def get_queryset(self):
        """Filter by organization through voter"""
        queryset = super().get_queryset()
        user = self.request.user

        if user.profile.is_superadmin():
            return queryset

        if hasattr(user, 'profile') and user.profile.organization:
            return queryset.filter(voter__organization=user.profile.organization)

        return queryset.none()

    def perform_create(self, serializer):
        """Auto-assign conducted_by"""
        serializer.save(conducted_by=self.request.user)


class SentimentAnalysisViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Sentiment Analysis management
    """
    queryset = SentimentAnalysis.objects.select_related('voter', 'constituency', 'organization', 'analyzed_by')
    serializer_class = SentimentAnalysisSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['voter', 'constituency', 'source', 'organization']
    search_fields = ['text_analyzed']
    ordering_fields = ['created_at', 'sentiment_score', 'confidence']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter by organization for multi-tenancy"""
        queryset = super().get_queryset()
        user = self.request.user

        if user.profile.is_superadmin():
            return queryset

        if hasattr(user, 'profile') and user.profile.organization:
            return queryset.filter(organization=user.profile.organization)

        return queryset.none()

    def perform_create(self, serializer):
        """Auto-assign organization and analyzed_by"""
        serializer.save(
            organization=self.request.user.profile.organization,
            analyzed_by=self.request.user
        )


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for Dashboard analytics and statistics

    Endpoints:
    - GET /api/dashboard/overview/ - Overall statistics
    - GET /api/dashboard/sentiment-trends/ - Sentiment trends over time
    - GET /api/dashboard/heatmap/ - Geographic heatmap data
    """
    permission_classes = [IsAuthenticated]

    def _get_organization(self, request):
        """Get user's organization or None for superadmin"""
        if request.user.profile.is_superadmin():
            return None
        return request.user.profile.organization

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get dashboard overview statistics"""
        org = self._get_organization(request)

        # Base querysets
        voters_qs = Voter.objects.filter(organization=org) if org else Voter.objects.all()
        constituencies_qs = Constituency.objects.filter(organization=org) if org else Constituency.objects.all()
        booths_qs = PollingBooth.objects.filter(organization=org) if org else PollingBooth.objects.all()
        campaigns_qs = Campaign.objects.filter(organization=org) if org else Campaign.objects.all()
        interactions_qs = VoterInteraction.objects.filter(voter__organization=org) if org else VoterInteraction.objects.all()

        # Calculate statistics
        stats = {
            'total_voters': voters_qs.count(),
            'total_constituencies': constituencies_qs.count(),
            'total_polling_booths': booths_qs.count(),
            'total_campaigns': campaigns_qs.count(),
            'active_campaigns': campaigns_qs.filter(status='active').count(),
            'sentiment_distribution': dict(
                voters_qs.values('sentiment').annotate(count=Count('id')).values_list('sentiment', 'count')
            ),
            'voter_category_distribution': dict(
                voters_qs.values('voter_category').annotate(count=Count('id')).values_list('voter_category', 'count')
            ),
            'recent_interactions': interactions_qs.filter(
                interaction_date__gte=timezone.now() - timedelta(days=7)
            ).count(),
        }

        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def sentiment_trends(self, request):
        """Get sentiment trends over time (last 30 days)"""
        org = self._get_organization(request)
        days = int(request.query_params.get('days', 30))

        start_date = timezone.now() - timedelta(days=days)
        analyses_qs = SentimentAnalysis.objects.filter(created_at__gte=start_date)

        if org:
            analyses_qs = analyses_qs.filter(organization=org)

        # Group by date
        trends = analyses_qs.extra(
            select={'date': 'DATE(created_at)'}
        ).values('date').annotate(
            positive_count=Count('id', filter=Q(sentiment_score__gte=0.3)),
            negative_count=Count('id', filter=Q(sentiment_score__lte=-0.3)),
            neutral_count=Count('id', filter=Q(sentiment_score__gt=-0.3, sentiment_score__lt=0.3)),
            average_score=Avg('sentiment_score')
        ).order_by('date')

        return Response(list(trends))

    @action(detail=False, methods=['get'])
    def heatmap(self, request):
        """Get geographic heatmap data"""
        org = self._get_organization(request)

        constituencies_qs = Constituency.objects.all()
        if org:
            constituencies_qs = constituencies_qs.filter(organization=org)

        # Aggregate sentiment by constituency
        heatmap_data = []
        for const in constituencies_qs:
            voters = Voter.objects.filter(polling_booth__constituency=const)
            avg_sentiment = voters.aggregate(Avg('sentiment_score'))['sentiment_score__avg'] or 0

            heatmap_data.append({
                'constituency_id': const.id,
                'constituency_name': const.name,
                'state': const.state,
                'district': const.district,
                'voter_count': voters.count(),
                'avg_sentiment_score': round(avg_sentiment, 2),
                'boundaries': const.boundaries
            })

        return Response(heatmap_data)
