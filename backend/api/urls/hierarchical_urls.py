"""
URLs for Hierarchical User Management
"""
from django.urls import path
from api.views import hierarchical_users

urlpatterns = [
    # List endpoints (for dropdowns/selection)
    path('organizations/', hierarchical_users.list_parties, name='list_parties'),
    path('states/', hierarchical_users.list_states, name='list_states'),
    path('zones/', hierarchical_users.list_zones, name='list_zones'),
    path('districts/', hierarchical_users.list_districts, name='list_districts'),

    # SuperAdmin - Create Party & State Admin
    path('superadmin/parties/create/', hierarchical_users.create_party, name='create_party'),
    path('superadmin/users/create-state-admin/', hierarchical_users.create_state_admin, name='create_state_admin'),

    # State Admin - Create Zone Admin
    path('state-admin/users/create-zone-admin/', hierarchical_users.create_zone_admin, name='create_zone_admin'),

    # Zone Admin - Create District Admin
    path('zone-admin/users/create-district-admin/', hierarchical_users.create_district_admin, name='create_district_admin'),

    # District Admin - Create Constituency Admin
    path('district-admin/users/create-constituency-admin/', hierarchical_users.create_constituency_admin, name='create_constituency_admin'),

    # Constituency Admin - Create Booth Admin
    path('constituency-admin/users/create-booth-admin/', hierarchical_users.create_booth_admin, name='create_booth_admin'),

    # Booth Admin - Create Analyst
    path('booth-admin/users/create-analyst/', hierarchical_users.create_analyst, name='create_analyst'),

    # List Users (All levels)
    path('users/my-team/', hierarchical_users.list_my_users, name='list_my_users'),
]
