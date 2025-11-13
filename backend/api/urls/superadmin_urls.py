"""
URL configuration for superadmin routes
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.superadmin.user_management import SuperAdminUserManagementViewSet
from api.views.superadmin import tenant_views

router = DefaultRouter()
router.register(r'users', SuperAdminUserManagementViewSet, basename='superadmin-users')

urlpatterns = [
    path('', include(router.urls)),

    # Tenant management endpoints
    path('tenants/stats/', tenant_views.get_tenant_stats, name='superadmin-tenant-stats'),
    path('tenants/', tenant_views.list_tenants, name='superadmin-list-tenants'),
    path('tenants/<int:tenant_id>/', tenant_views.get_tenant_detail, name='superadmin-tenant-detail'),
]
