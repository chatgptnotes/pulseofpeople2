from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Task, Permission, Notification, UploadedFile,
    Constituency, PollingBooth, Voter, Campaign, CampaignActivity,
    Issue, VoterInteraction, SentimentAnalysis
)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'role', 'bio', 'avatar', 'avatar_url', 'phone', 'date_of_birth', 'permissions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'permissions']

    def get_permissions(self, obj):
        """Get all permissions for this user"""
        return obj.get_permissions()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    profile = UserProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'profile']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """Create user with profile"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user)
        return user


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'priority', 'owner', 'owner_username', 'due_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Auto-assign owner from request user"""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class UserRoleSerializer(serializers.ModelSerializer):
    """Serializer for updating user roles (superadmin only)"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['id', 'username', 'email']


class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer for user management (admin/superadmin)"""
    profile = UserProfileSerializer(read_only=True)
    role = serializers.CharField(source='profile.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile', 'date_joined', 'last_login', 'is_active']
        read_only_fields = ['id', 'date_joined', 'last_login']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'username', 'title', 'message', 'notification_type',
            'is_read', 'read_at', 'related_model', 'related_id', 'metadata',
            'supabase_id', 'synced_to_supabase', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'supabase_id', 'synced_to_supabase', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Auto-assign user from request"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class UploadedFileSerializer(serializers.ModelSerializer):
    """Serializer for uploaded files"""
    username = serializers.CharField(source='user.username', read_only=True)
    file_extension = serializers.SerializerMethodField()
    human_readable_size = serializers.SerializerMethodField()
    is_image = serializers.SerializerMethodField()
    is_video = serializers.SerializerMethodField()
    is_audio = serializers.SerializerMethodField()
    is_document = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = [
            'id', 'user', 'username', 'filename', 'original_filename',
            'file_size', 'mime_type', 'storage_path', 'storage_url',
            'bucket_id', 'file_category', 'metadata',
            'file_extension', 'human_readable_size',
            'is_image', 'is_video', 'is_audio', 'is_document',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_file_extension(self, obj):
        return obj.get_file_extension()

    def get_human_readable_size(self, obj):
        return obj.get_human_readable_size()

    def get_is_image(self, obj):
        return obj.is_image()

    def get_is_video(self, obj):
        return obj.is_video()

    def get_is_audio(self, obj):
        return obj.is_audio()

    def get_is_document(self, obj):
        return obj.is_document()


# ============================================================================
# PHASE 2: POLITICAL CAMPAIGN SERIALIZERS
# ============================================================================

class ConstituencySerializer(serializers.ModelSerializer):
    """Serializer for Constituency model"""
    booth_count = serializers.SerializerMethodField()

    class Meta:
        model = Constituency
        fields = [
            'id', 'organization', 'name', 'code', 'type', 'state', 'district',
            'boundaries', 'population', 'voter_count', 'total_booths', 'area_sq_km',
            'reserved_category', 'last_election_year', 'current_representative',
            'current_party', 'metadata', 'booth_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'booth_count']

    def get_booth_count(self, obj):
        """Get actual polling booth count"""
        return obj.polling_booths.count()


class ConstituencyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for constituency lists"""

    class Meta:
        model = Constituency
        fields = ['id', 'name', 'code', 'type', 'state', 'district', 'voter_count', 'total_booths']
        read_only_fields = ['id']


class PollingBoothSerializer(serializers.ModelSerializer):
    """Serializer for PollingBooth model"""
    constituency_name = serializers.CharField(source='constituency.name', read_only=True)
    voter_count_actual = serializers.SerializerMethodField()

    class Meta:
        model = PollingBooth
        fields = [
            'id', 'constituency', 'constituency_name', 'organization', 'name',
            'code', 'booth_number', 'location', 'address', 'total_voters',
            'status', 'supervisor_id', 'last_updated_by', 'metadata',
            'voter_count_actual', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'voter_count_actual']

    def get_voter_count_actual(self, obj):
        """Get actual voter count"""
        return obj.voters.count()


class PollingBoothListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for polling booth lists"""
    constituency_name = serializers.CharField(source='constituency.name', read_only=True)

    class Meta:
        model = PollingBooth
        fields = ['id', 'name', 'code', 'booth_number', 'constituency_name', 'total_voters', 'status']
        read_only_fields = ['id']


class VoterSerializer(serializers.ModelSerializer):
    """Full serializer for Voter model"""
    polling_booth_name = serializers.CharField(source='polling_booth.name', read_only=True)
    constituency_name = serializers.CharField(source='polling_booth.constituency.name', read_only=True)
    verified_by_username = serializers.CharField(source='verified_by.username', read_only=True)

    class Meta:
        model = Voter
        fields = [
            'id', 'polling_booth', 'polling_booth_name', 'constituency_name',
            'organization', 'full_name', 'voter_id_number', 'epic_number',
            'phone', 'address', 'age', 'gender', 'caste_category', 'religion',
            'occupation', 'education', 'family_size', 'voter_category',
            'sentiment', 'sentiment_score', 'sentiment_last_updated',
            'influencer_score', 'first_time_voter', 'verified', 'verified_by',
            'verified_by_username', 'verified_at', 'consent_given',
            'contacted_by_party', 'last_contact_date', 'contact_method',
            'notes', 'tags', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verified_at']


class VoterListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for voter lists"""
    polling_booth_name = serializers.CharField(source='polling_booth.name', read_only=True)

    class Meta:
        model = Voter
        fields = [
            'id', 'full_name', 'voter_id_number', 'phone', 'age', 'gender',
            'polling_booth_name', 'voter_category', 'sentiment', 'sentiment_score',
            'first_time_voter'
        ]
        read_only_fields = ['id']


class VoterSentimentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating voter sentiment"""

    class Meta:
        model = Voter
        fields = ['sentiment', 'sentiment_score', 'sentiment_last_updated']


class CampaignSerializer(serializers.ModelSerializer):
    """Serializer for Campaign model"""
    constituency_name = serializers.CharField(source='constituency.name', read_only=True)
    manager_username = serializers.CharField(source='manager.username', read_only=True)
    activity_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id', 'organization', 'constituency', 'constituency_name', 'name',
            'description', 'status', 'start_date', 'end_date', 'manager',
            'manager_username', 'target_voters', 'reached_voters', 'budget',
            'spent', 'metadata', 'activity_count', 'completion_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'activity_count', 'completion_percentage']

    def get_activity_count(self, obj):
        """Get total activity count"""
        return obj.activities.count()

    def get_completion_percentage(self, obj):
        """Calculate campaign completion percentage"""
        if obj.target_voters == 0:
            return 0
        return round((obj.reached_voters / obj.target_voters) * 100, 2)


class CampaignListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for campaign lists"""
    constituency_name = serializers.CharField(source='constituency.name', read_only=True)
    manager_username = serializers.CharField(source='manager.username', read_only=True)

    class Meta:
        model = Campaign
        fields = [
            'id', 'name', 'status', 'constituency_name', 'manager_username',
            'start_date', 'end_date', 'target_voters', 'reached_voters'
        ]
        read_only_fields = ['id']


class CampaignActivitySerializer(serializers.ModelSerializer):
    """Serializer for CampaignActivity model"""
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    polling_booth_name = serializers.CharField(source='polling_booth.name', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = CampaignActivity
        fields = [
            'id', 'campaign', 'campaign_name', 'polling_booth', 'polling_booth_name',
            'title', 'description', 'activity_type', 'scheduled_at', 'completed_at',
            'assigned_to', 'assigned_to_username', 'completed', 'voters_reached',
            'feedback', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IssueSerializer(serializers.ModelSerializer):
    """Serializer for Issue model"""
    constituency_name = serializers.CharField(source='constituency.name', read_only=True)
    reported_by_username = serializers.CharField(source='reported_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'organization', 'constituency', 'constituency_name', 'title',
            'description', 'category', 'priority', 'reported_by', 'reported_by_username',
            'assigned_to', 'assigned_to_username', 'status', 'affected_voters',
            'sentiment_impact', 'resolution', 'resolved_at', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'resolved_at']


class IssueListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for issue lists"""
    constituency_name = serializers.CharField(source='constituency.name', read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'category', 'priority', 'status', 'constituency_name',
            'affected_voters', 'created_at'
        ]
        read_only_fields = ['id']


class VoterInteractionSerializer(serializers.ModelSerializer):
    """Serializer for VoterInteraction model"""
    voter_name = serializers.CharField(source='voter.full_name', read_only=True)
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    conducted_by_username = serializers.CharField(source='conducted_by.username', read_only=True)

    class Meta:
        model = VoterInteraction
        fields = [
            'id', 'voter', 'voter_name', 'campaign', 'campaign_name',
            'conducted_by', 'conducted_by_username', 'interaction_type',
            'interaction_date', 'duration_minutes', 'subject', 'notes',
            'sentiment_before', 'sentiment_after', 'successful',
            'follow_up_required', 'follow_up_date', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'interaction_date', 'created_at', 'updated_at']


class SentimentAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for SentimentAnalysis model"""
    voter_name = serializers.CharField(source='voter.full_name', read_only=True)
    constituency_name = serializers.CharField(source='constituency.name', read_only=True)
    analyzed_by_username = serializers.CharField(source='analyzed_by.username', read_only=True)

    class Meta:
        model = SentimentAnalysis
        fields = [
            'id', 'voter', 'voter_name', 'constituency', 'constituency_name',
            'organization', 'source', 'sentiment_score', 'confidence',
            'text_analyzed', 'keywords', 'emotions', 'analyzed_by',
            'analyzed_by_username', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# Dashboard Statistics Serializers
class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_voters = serializers.IntegerField()
    total_constituencies = serializers.IntegerField()
    total_polling_booths = serializers.IntegerField()
    total_campaigns = serializers.IntegerField()
    active_campaigns = serializers.IntegerField()
    sentiment_distribution = serializers.DictField()
    voter_category_distribution = serializers.DictField()
    recent_interactions = serializers.IntegerField()


class SentimentTrendSerializer(serializers.Serializer):
    """Serializer for sentiment trend data"""
    date = serializers.DateField()
    positive_count = serializers.IntegerField()
    negative_count = serializers.IntegerField()
    neutral_count = serializers.IntegerField()
    average_score = serializers.FloatField()
