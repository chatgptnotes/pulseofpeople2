"""
URL Configuration for Phase 2: Campaign Management APIs
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from ..views.campaign_views import (
    ConstituencyViewSet,
    PollingBoothViewSet,
    VoterViewSet,
    CampaignViewSet,
    CampaignActivityViewSet,
    IssueViewSet,
    VoterInteractionViewSet,
    SentimentAnalysisViewSet,
    DashboardViewSet
)

# Create router and register viewsets
router = DefaultRouter()

router.register(r'constituencies', ConstituencyViewSet, basename='constituency')
router.register(r'polling-booths', PollingBoothViewSet, basename='pollingbooth')
router.register(r'voters', VoterViewSet, basename='voter')
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'campaign-activities', CampaignActivityViewSet, basename='campaignactivity')
router.register(r'issues', IssueViewSet, basename='issue')
router.register(r'voter-interactions', VoterInteractionViewSet, basename='voterinteraction')
router.register(r'sentiment-analyses', SentimentAnalysisViewSet, basename='sentimentanalysis')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = router.urls
