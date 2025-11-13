from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

# Try to import GIS models, fall back to regular models if GDAL not available
try:
    from django.contrib.gis.db import models as gis_models
    GIS_ENABLED = True
except (ImportError, Exception):
    gis_models = models  # Fallback to regular Django models
    GIS_ENABLED = False


class Organization(models.Model):
    """Organization model for multi-party support (Political CRM)"""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    # Party Information
    party_name = models.CharField(max_length=200, blank=True, null=True, help_text="Political Party Name (e.g., BJP, Congress)")
    party_symbol = models.CharField(max_length=100, blank=True, null=True, help_text="Party Symbol")
    party_color = models.CharField(max_length=7, blank=True, null=True, help_text="Party Color (Hex code)")

    # Subscription
    subscription_status = models.CharField(max_length=20, default='active')
    subscription_tier = models.CharField(max_length=20, default='basic')
    max_users = models.IntegerField(default=10)

    # Settings
    settings = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.party_name or self.name}"

    class Meta:
        ordering = ['name']
        verbose_name = "Organization/Party"
        verbose_name_plural = "Organizations/Parties"


class Permission(models.Model):
    """Granular permissions for RBAC"""
    CATEGORIES = [
        ('users', 'User Management'),
        ('data', 'Data Access'),
        ('analytics', 'Analytics'),
        ('settings', 'Settings'),
        ('system', 'System'),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category}: {self.name}"

    class Meta:
        ordering = ['category', 'name']
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"


# ============================================================================
# GEOGRAPHIC HIERARCHY MODELS (for Political CRM)
# ============================================================================

class State(models.Model):
    """Indian States/Union Territories"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True, help_text="State code (e.g., DL, MH, UP)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = "State"
        verbose_name_plural = "States"


class Zone(models.Model):
    """Zone/Region within a State (e.g., North Delhi, South Delhi)"""
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='zones')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.state.name})"

    class Meta:
        ordering = ['state', 'name']
        unique_together = ['state', 'name']
        verbose_name = "Zone/Region"
        verbose_name_plural = "Zones/Regions"


class District(models.Model):
    """District within a Zone"""
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.zone.name})"

    class Meta:
        ordering = ['zone', 'name']
        unique_together = ['zone', 'name']
        verbose_name = "District"
        verbose_name_plural = "Districts"


class UserProfile(models.Model):
    """Extended user profile with additional fields"""
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),          # Level 1: Platform owner
        ('state_admin', 'State Admin'),          # Level 2: State/Party head
        ('zone_admin', 'Zone/Region Admin'),     # Level 3: Zonal incharge
        ('district_admin', 'District Admin'),    # Level 4: District president
        ('constituency_admin', 'Constituency Admin'),  # Level 5: Constituency incharge
        ('booth_admin', 'Booth/Field Admin'),    # Level 6: Booth agent
        ('analyst', 'War Room Analyst'),         # Level 7: Read-only observer
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=25, choices=ROLE_CHOICES, default='analyst')

    # Organization/Party support
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='members',
        null=True,
        blank=True,
        help_text="Political party this user belongs to"
    )

    # Geographic Assignment (Hierarchical)
    assigned_state = models.ForeignKey(
        'State',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_users',
        help_text="State assigned to this user"
    )
    assigned_zone = models.ForeignKey(
        'Zone',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_users',
        help_text="Zone assigned to this user"
    )
    assigned_district = models.ForeignKey(
        'District',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_users',
        help_text="District assigned to this user"
    )
    assigned_constituency = models.ForeignKey(
        'Constituency',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_users',
        help_text="Constituency assigned to this user"
    )
    assigned_booth = models.ForeignKey(
        'PollingBooth',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_users',
        help_text="Polling booth assigned to this user"
    )

    # User hierarchy tracking
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_users',
        help_text="User who created this account"
    )

    # Profile fields
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)  # Supabase storage URL
    phone = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)

    # Custom permissions
    custom_permissions = models.ManyToManyField(
        Permission,
        through='UserPermission',
        related_name='users',
        blank=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_superadmin(self):
        return self.role == 'superadmin'

    def is_state_admin(self):
        return self.role == 'state_admin'

    def is_zone_admin(self):
        return self.role == 'zone_admin'

    def is_district_admin(self):
        return self.role == 'district_admin'

    def is_constituency_admin(self):
        return self.role == 'constituency_admin'

    def is_booth_admin(self):
        return self.role == 'booth_admin'

    def is_analyst(self):
        return self.role == 'analyst'

    def is_admin_level(self):
        """Check if user is any admin level"""
        return self.role in ['superadmin', 'state_admin', 'zone_admin', 'district_admin', 'constituency_admin']

    def can_create_users(self):
        """Check if user can create next level users"""
        return self.role in ['superadmin', 'state_admin', 'zone_admin', 'district_admin', 'constituency_admin', 'booth_admin']

    def get_creatable_role(self):
        """Get the role this user can create"""
        role_hierarchy = {
            'superadmin': 'state_admin',
            'state_admin': 'zone_admin',
            'zone_admin': 'district_admin',
            'district_admin': 'constituency_admin',
            'constituency_admin': 'booth_admin',
            'booth_admin': 'analyst',
        }
        return role_hierarchy.get(self.role)

    def has_permission(self, permission_name):
        """Check if user has a specific permission"""
        # Superadmin has all permissions
        if self.is_superadmin():
            return True

        # Check role-based permissions
        role_has_perm = RolePermission.objects.filter(
            role=self.role,
            permission__name=permission_name
        ).exists()

        if role_has_perm:
            return True

        # Check user-specific permissions
        user_perm = UserPermission.objects.filter(
            user_profile=self,
            permission__name=permission_name,
            granted=True
        ).exists()

        return user_perm

    def get_permissions(self):
        """Get all permissions for this user"""
        if self.is_superadmin():
            return list(Permission.objects.all().values_list('name', flat=True))

        # Get role permissions
        role_perms = Permission.objects.filter(
            role_permissions__role=self.role
        ).values_list('name', flat=True)

        # Get user-specific permissions
        user_perms = Permission.objects.filter(
            user_permissions__user_profile=self,
            user_permissions__granted=True
        ).values_list('name', flat=True)

        # Combine and remove duplicates
        all_perms = set(list(role_perms) + list(user_perms))
        return list(all_perms)

    def __str__(self):
        return f"{self.user.username}'s profile"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


class RolePermission(models.Model):
    """Maps roles to permissions"""
    role = models.CharField(max_length=20, choices=UserProfile.ROLE_CHOICES)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='role_permissions')

    class Meta:
        unique_together = ['role', 'permission']
        verbose_name = "Role Permission"
        verbose_name_plural = "Role Permissions"

    def __str__(self):
        return f"{self.role} -> {self.permission.name}"


class UserPermission(models.Model):
    """User-specific permission overrides"""
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='user_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='user_permissions')
    granted = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user_profile', 'permission']
        verbose_name = "User Permission"
        verbose_name_plural = "User Permissions"

    def __str__(self):
        status = "Granted" if self.granted else "Revoked"
        return f"{self.user_profile.user.username} - {self.permission.name} ({status})"


class AuditLog(models.Model):
    """Audit log for tracking all user actions"""
    ACTION_TYPES = [
        ('create', 'Create'),
        ('read', 'Read'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('permission_change', 'Permission Change'),
        ('role_change', 'Role Change'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    target_model = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=100, blank=True)
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action']),
            models.Index(fields=['target_model', 'target_id']),
        ]
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        user_str = self.user.username if self.user else "Anonymous"
        return f"{user_str} - {self.action} - {self.timestamp}"


class Notification(models.Model):
    """
    Notification model for real-time user notifications
    Syncs with Supabase for real-time delivery
    """
    TYPE_CHOICES = [
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('task', 'Task'),
        ('user', 'User'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Link to related object (optional)
    related_model = models.CharField(max_length=100, blank=True)
    related_id = models.CharField(max_length=100, blank=True)

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Supabase sync
    supabase_id = models.UUIDField(null=True, blank=True, unique=True)
    synced_to_supabase = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_read']),
            models.Index(fields=['notification_type']),
        ]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    def mark_as_read(self):
        """Mark notification as read"""
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save()


class Task(models.Model):
    """Sample Task model for demonstration"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    due_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Task"
        verbose_name_plural = "Tasks"
        ordering = ['-created_at']


class UploadedFile(models.Model):
    """
    Uploaded File model for tracking files stored in Supabase Storage
    Stores metadata while actual files are in Supabase Storage buckets
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')

    # File information
    filename = models.CharField(max_length=255, help_text="Stored filename")
    original_filename = models.CharField(max_length=255, help_text="Original uploaded filename")
    file_size = models.BigIntegerField(help_text="File size in bytes")
    mime_type = models.CharField(max_length=100)

    # Storage information
    storage_path = models.CharField(max_length=500, help_text="Path in Supabase Storage")
    storage_url = models.URLField(max_length=500, help_text="Public URL from Supabase")
    bucket_id = models.CharField(max_length=100, default='user-files')

    # File categorization
    file_category = models.CharField(
        max_length=50,
        choices=[
            ('document', 'Document'),
            ('image', 'Image'),
            ('video', 'Video'),
            ('audio', 'Audio'),
            ('archive', 'Archive'),
            ('other', 'Other'),
        ],
        default='document'
    )

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional file metadata")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['file_category']),
            models.Index(fields=['mime_type']),
        ]
        verbose_name = "Uploaded File"
        verbose_name_plural = "Uploaded Files"

    def __str__(self):
        return f"{self.user.username} - {self.original_filename}"

    def get_file_extension(self):
        """Get file extension from original filename"""
        import os
        return os.path.splitext(self.original_filename)[1].lower()

    def is_image(self):
        """Check if file is an image"""
        return self.mime_type.startswith('image/')

    def is_video(self):
        """Check if file is a video"""
        return self.mime_type.startswith('video/')

    def is_audio(self):
        """Check if file is audio"""
        return self.mime_type.startswith('audio/')

    def is_document(self):
        """Check if file is a document"""
        doc_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument']
        return any(self.mime_type.startswith(dtype) for dtype in doc_types)

    def get_human_readable_size(self):
        """Convert file size to human readable format"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} PB"


# ============================================================================
# PHASE 2: POLITICAL CAMPAIGN DOMAIN MODELS
# ============================================================================

class Constituency(models.Model):
    """
    Constituency model for electoral boundaries
    Supports parliamentary, assembly, municipal constituencies
    """
    TYPE_CHOICES = [
        ('parliamentary', 'Parliamentary'),
        ('assembly', 'Assembly'),
        ('municipal', 'Municipal'),
        ('other', 'Other'),
    ]

    RESERVED_CATEGORY_CHOICES = [
        ('general', 'General'),
        ('sc', 'Scheduled Caste'),
        ('st', 'Scheduled Tribe'),
        ('obc', 'Other Backward Class'),
    ]

    # Organization for multi-tenancy
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='constituencies',
        null=True,
        blank=True
    )

    # Basic Info
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='assembly')

    # Location
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    boundaries = models.JSONField(default=dict, blank=True, help_text="GeoJSON boundaries")
    # geom = gis_models.PolygonField(null=True, blank=True, help_text="Geographic polygon")  # Disabled for SQLite dev

    # Demographics
    population = models.IntegerField(null=True, blank=True)
    voter_count = models.IntegerField(default=0)
    total_booths = models.IntegerField(default=0)
    area_sq_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Electoral Info
    reserved_category = models.CharField(
        max_length=20,
        choices=RESERVED_CATEGORY_CHOICES,
        default='general'
    )
    last_election_year = models.IntegerField(null=True, blank=True)
    current_representative = models.CharField(max_length=200, blank=True)
    current_party = models.CharField(max_length=100, blank=True)

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['state', 'name']
        verbose_name = "Constituency"
        verbose_name_plural = "Constituencies"
        indexes = [
            models.Index(fields=['organization', 'state']),
            models.Index(fields=['type']),
            models.Index(fields=['code']),
        ]

    def __str__(self):
        return f"{self.name} ({self.state})"


class PollingBooth(models.Model):
    """
    Polling Booth model for voting locations
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('needs_attention', 'Needs Attention'),
    ]

    # Relationships
    constituency = models.ForeignKey(
        Constituency,
        on_delete=models.CASCADE,
        related_name='polling_booths'
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='polling_booths',
        null=True,
        blank=True
    )

    # Basic Info
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, db_index=True)
    booth_number = models.CharField(max_length=50)

    # Location
    location = models.CharField(max_length=300, blank=True)
    # geom = gis_models.PointField(null=True, blank=True, help_text="Geographic point")  # Disabled for SQLite dev
    address = models.TextField(blank=True)

    # Stats
    total_voters = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Management
    supervisor_id = models.IntegerField(null=True, blank=True, help_text="User ID of supervisor")
    last_updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_booths'
    )

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['constituency', 'booth_number']
        verbose_name = "Polling Booth"
        verbose_name_plural = "Polling Booths"
        indexes = [
            models.Index(fields=['constituency', 'status']),
            models.Index(fields=['code']),
            models.Index(fields=['organization']),
        ]
        unique_together = ['constituency', 'code']

    def __str__(self):
        return f"{self.name} - Booth #{self.booth_number}"


class Voter(models.Model):
    """
    Voter model for individual voter tracking
    """
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('undisclosed', 'Undisclosed'),
    ]

    CATEGORY_CHOICES = [
        ('core_supporter', 'Core Supporter'),
        ('swing_voter', 'Swing Voter'),
        ('opposition', 'Opposition'),
        ('undecided', 'Undecided'),
        ('first_time', 'First Time Voter'),
    ]

    SENTIMENT_CHOICES = [
        ('strongly_positive', 'Strongly Positive'),
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
        ('strongly_negative', 'Strongly Negative'),
        ('undecided', 'Undecided'),
    ]

    CASTE_CATEGORY_CHOICES = [
        ('general', 'General'),
        ('obc', 'OBC'),
        ('sc', 'SC'),
        ('st', 'ST'),
        ('other', 'Other'),
    ]

    # Relationships
    polling_booth = models.ForeignKey(
        PollingBooth,
        on_delete=models.CASCADE,
        related_name='voters'
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='voters',
        null=True,
        blank=True
    )

    # Personal Information
    full_name = models.CharField(max_length=200)
    voter_id_number = models.CharField(max_length=50, unique=True, db_index=True)
    epic_number = models.CharField(max_length=50, blank=True, help_text="Electoral Photo ID Card Number")
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    # Demographics
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='undisclosed')
    caste_category = models.CharField(max_length=20, choices=CASTE_CATEGORY_CHOICES, blank=True)
    religion = models.CharField(max_length=50, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    education = models.CharField(max_length=100, blank=True)
    family_size = models.IntegerField(null=True, blank=True)

    # Political Categorization
    voter_category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='undecided'
    )
    sentiment = models.CharField(
        max_length=20,
        choices=SENTIMENT_CHOICES,
        default='neutral'
    )
    sentiment_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('-1.00')), MaxValueValidator(Decimal('1.00'))],
        help_text="Score from -1.00 (negative) to +1.00 (positive)"
    )
    sentiment_last_updated = models.DateTimeField(null=True, blank=True)
    influencer_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Influence score 0-100"
    )
    first_time_voter = models.BooleanField(default=False)

    # Verification
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_voters'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    # Outreach
    consent_given = models.BooleanField(default=False)
    contacted_by_party = models.BooleanField(default=False)
    last_contact_date = models.DateField(null=True, blank=True)
    contact_method = models.CharField(max_length=50, blank=True)

    # Notes and Tags
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True, help_text="Array of tags")

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['polling_booth', 'full_name']
        verbose_name = "Voter"
        verbose_name_plural = "Voters"
        indexes = [
            models.Index(fields=['polling_booth', 'voter_category']),
            models.Index(fields=['organization', 'sentiment']),
            models.Index(fields=['voter_id_number']),
            models.Index(fields=['sentiment', 'sentiment_score']),
            models.Index(fields=['first_time_voter']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.voter_id_number})"


class Campaign(models.Model):
    """
    Campaign model for political campaigns
    """
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    # Relationships
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='campaigns'
    )
    constituency = models.ForeignKey(
        Constituency,
        on_delete=models.CASCADE,
        related_name='campaigns',
        null=True,
        blank=True
    )

    # Basic Info
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')

    # Timeline
    start_date = models.DateField()
    end_date = models.DateField()

    # Management
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='managed_campaigns'
    )

    # Metrics
    target_voters = models.IntegerField(default=0)
    reached_voters = models.IntegerField(default=0)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    spent = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = "Campaign"
        verbose_name_plural = "Campaigns"
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['constituency']),
            models.Index(fields=['-start_date']),
        ]

    def __str__(self):
        return f"{self.name} ({self.status})"


class CampaignActivity(models.Model):
    """
    Campaign Activity model for tracking campaign events
    """
    ACTIVITY_TYPE_CHOICES = [
        ('rally', 'Rally'),
        ('door_to_door', 'Door to Door'),
        ('phone_call', 'Phone Call'),
        ('social_media', 'Social Media'),
        ('meeting', 'Meeting'),
        ('event', 'Event'),
        ('other', 'Other'),
    ]

    # Relationships
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    polling_booth = models.ForeignKey(
        PollingBooth,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaign_activities'
    )

    # Basic Info
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPE_CHOICES, default='other')

    # Timeline
    scheduled_at = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)

    # Execution
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_activities'
    )
    completed = models.BooleanField(default=False)

    # Impact
    voters_reached = models.IntegerField(default=0)
    feedback = models.TextField(blank=True)

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']
        verbose_name = "Campaign Activity"
        verbose_name_plural = "Campaign Activities"
        indexes = [
            models.Index(fields=['campaign', 'completed']),
            models.Index(fields=['-scheduled_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.campaign.name}"


class Issue(models.Model):
    """
    Political Issues model for tracking voter concerns
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    CATEGORY_CHOICES = [
        ('infrastructure', 'Infrastructure'),
        ('education', 'Education'),
        ('healthcare', 'Healthcare'),
        ('employment', 'Employment'),
        ('law_order', 'Law & Order'),
        ('agriculture', 'Agriculture'),
        ('environment', 'Environment'),
        ('corruption', 'Corruption'),
        ('other', 'Other'),
    ]

    # Relationships
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='issues'
    )
    constituency = models.ForeignKey(
        Constituency,
        on_delete=models.CASCADE,
        related_name='issues',
        null=True,
        blank=True
    )

    # Basic Info
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='other')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')

    # Tracking
    reported_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reported_issues'
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_issues'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('open', 'Open'),
            ('in_progress', 'In Progress'),
            ('resolved', 'Resolved'),
            ('closed', 'Closed'),
        ],
        default='open'
    )

    # Impact
    affected_voters = models.IntegerField(default=0)
    sentiment_impact = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('-1.00')), MaxValueValidator(Decimal('1.00'))]
    )

    # Resolution
    resolution = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = "Issue"
        verbose_name_plural = "Issues"
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['constituency', 'category']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f"{self.title} ({self.priority})"


class VoterInteraction(models.Model):
    """
    Voter Interaction model for tracking outreach history
    """
    INTERACTION_TYPE_CHOICES = [
        ('phone_call', 'Phone Call'),
        ('door_visit', 'Door Visit'),
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
        ('social_media', 'Social Media'),
        ('event', 'Event'),
        ('rally', 'Rally'),
        ('other', 'Other'),
    ]

    # Relationships
    voter = models.ForeignKey(
        Voter,
        on_delete=models.CASCADE,
        related_name='interactions'
    )
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='voter_interactions'
    )
    conducted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conducted_interactions'
    )

    # Interaction Details
    interaction_type = models.CharField(max_length=30, choices=INTERACTION_TYPE_CHOICES, default='other')
    interaction_date = models.DateTimeField(auto_now_add=True)
    duration_minutes = models.IntegerField(null=True, blank=True)

    # Content
    subject = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    sentiment_before = models.CharField(max_length=20, blank=True)
    sentiment_after = models.CharField(max_length=20, blank=True)

    # Outcome
    successful = models.BooleanField(default=False)
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-interaction_date']
        verbose_name = "Voter Interaction"
        verbose_name_plural = "Voter Interactions"
        indexes = [
            models.Index(fields=['voter', '-interaction_date']),
            models.Index(fields=['campaign']),
            models.Index(fields=['interaction_type']),
        ]

    def __str__(self):
        return f"{self.voter.full_name} - {self.interaction_type} ({self.interaction_date.date()})"


class SentimentAnalysis(models.Model):
    """
    Sentiment Analysis model for AI-based sentiment tracking
    """
    SOURCE_CHOICES = [
        ('manual', 'Manual Entry'),
        ('phone_call', 'Phone Call'),
        ('social_media', 'Social Media'),
        ('survey', 'Survey'),
        ('ai_analysis', 'AI Analysis'),
        ('field_report', 'Field Report'),
    ]

    # Relationships
    voter = models.ForeignKey(
        Voter,
        on_delete=models.CASCADE,
        related_name='sentiment_analyses',
        null=True,
        blank=True
    )
    constituency = models.ForeignKey(
        Constituency,
        on_delete=models.CASCADE,
        related_name='sentiment_analyses',
        null=True,
        blank=True
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='sentiment_analyses'
    )

    # Analysis Data
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default='manual')
    sentiment_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('-1.00')), MaxValueValidator(Decimal('1.00'))],
        help_text="Score from -1.00 (negative) to +1.00 (positive)"
    )
    confidence = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('1.00'))],
        help_text="Confidence level 0.00 to 1.00"
    )

    # Context
    text_analyzed = models.TextField(blank=True)
    keywords = models.JSONField(default=list, blank=True)
    emotions = models.JSONField(default=dict, blank=True)

    # Attribution
    analyzed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sentiment_analyses'
    )

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Sentiment Analysis"
        verbose_name_plural = "Sentiment Analyses"
        indexes = [
            models.Index(fields=['voter', '-created_at']),
            models.Index(fields=['constituency', '-created_at']),
            models.Index(fields=['organization', 'source']),
        ]

    def __str__(self):
        target = self.voter.full_name if self.voter else self.constituency.name
        return f"Sentiment for {target}: {self.sentiment_score}"
