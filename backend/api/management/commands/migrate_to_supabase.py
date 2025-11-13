"""
Management command to migrate data from SQLite to Supabase PostgreSQL.
"""
import os
import sqlite3
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import connection
from django.contrib.auth import get_user_model
from api.models import (
    Organization, UserProfile, Permission, RolePermission, UserPermission,
    Notification, Task, UploadedFile, Constituency, PollingBooth,
    Campaign, CampaignActivity, Issue, Voter, VoterInteraction, SentimentAnalysis
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Migrate data from SQLite to Supabase PostgreSQL'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sqlite-db',
            type=str,
            default='db.sqlite3',
            help='Path to SQLite database file (default: db.sqlite3)'
        )

    def handle(self, *args, **options):
        sqlite_db_path = os.path.join(settings.BASE_DIR, options['sqlite_db'])

        if not os.path.exists(sqlite_db_path):
            self.stdout.write(self.style.ERROR(f'SQLite database not found at: {sqlite_db_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Starting migration from {sqlite_db_path}'))
        self.stdout.write(self.style.WARNING('Ensure PostgreSQL database is empty or this will create duplicates!'))

        # Connect to SQLite
        sqlite_conn = sqlite3.connect(sqlite_db_path)
        sqlite_conn.row_factory = sqlite3.Row
        cursor = sqlite_conn.cursor()

        try:
            # 1. Migrate Organizations
            self.migrate_organizations(cursor)

            # 2. Migrate Users
            self.migrate_users(cursor)

            # 3. Migrate User Profiles
            self.migrate_user_profiles(cursor)

            # 4. Migrate Permissions
            self.migrate_permissions(cursor)

            # 5. Migrate Role Permissions
            self.migrate_role_permissions(cursor)

            # 6. Migrate User Permissions
            self.migrate_user_permissions(cursor)

            # 7. Migrate Constituencies
            self.migrate_constituencies(cursor)

            # 8. Migrate Polling Booths
            self.migrate_polling_booths(cursor)

            # 9. Migrate Campaigns
            self.migrate_campaigns(cursor)

            # 10. Migrate Issues
            self.migrate_issues(cursor)

            # 11. Migrate Campaign Activities
            self.migrate_campaign_activities(cursor)

            # 12. Migrate Voters
            self.migrate_voters(cursor)

            # 13. Migrate Voter Interactions
            self.migrate_voter_interactions(cursor)

            # 14. Migrate Sentiment Analysis
            self.migrate_sentiment_analysis(cursor)

            # 15. Migrate Notifications
            self.migrate_notifications(cursor)

            # 16. Migrate Tasks
            self.migrate_tasks(cursor)

            # 17. Migrate Uploaded Files
            self.migrate_uploaded_files(cursor)

            self.stdout.write(self.style.SUCCESS('\n=== Migration Summary ==='))
            self.print_summary()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Migration failed: {str(e)}'))
            import traceback
            traceback.print_exc()
        finally:
            sqlite_conn.close()

    def migrate_organizations(self, cursor):
        self.stdout.write('\nMigrating Organizations...')
        cursor.execute('SELECT * FROM api_organization')
        count = 0
        for row in cursor.fetchall():
            Organization.objects.create(
                id=row['id'],
                name=row['name'],
                slug=row['slug'],
                is_active=row['is_active'],
                subscription_tier=row['subscription_tier'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} organizations'))

    def migrate_users(self, cursor):
        self.stdout.write('\nMigrating Users...')
        cursor.execute('SELECT * FROM auth_user')
        count = 0
        for row in cursor.fetchall():
            User.objects.create(
                id=row['id'],
                username=row['username'],
                email=row['email'],
                password=row['password'],  # Already hashed
                first_name=row['first_name'],
                last_name=row['last_name'],
                is_staff=row['is_staff'],
                is_active=row['is_active'],
                is_superuser=row['is_superuser'],
                date_joined=row['date_joined'],
                last_login=row['last_login']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} users'))

    def migrate_user_profiles(self, cursor):
        self.stdout.write('\nMigrating User Profiles...')
        cursor.execute('SELECT * FROM api_userprofile')
        count = 0
        for row in cursor.fetchall():
            UserProfile.objects.create(
                id=row['id'],
                user_id=row['user_id'],
                organization_id=row['organization_id'],
                role=row['role'],
                avatar_url=row['avatar_url'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} user profiles'))

    def migrate_permissions(self, cursor):
        self.stdout.write('\nMigrating Permissions...')
        cursor.execute('SELECT * FROM api_permission')
        count = 0
        for row in cursor.fetchall():
            Permission.objects.create(
                id=row['id'],
                resource=row['resource'],
                action=row['action'],
                description=row['description'],
                created_at=row['created_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} permissions'))

    def migrate_role_permissions(self, cursor):
        self.stdout.write('\nMigrating Role Permissions...')
        cursor.execute('SELECT * FROM api_rolepermission')
        count = 0
        for row in cursor.fetchall():
            RolePermission.objects.create(
                id=row['id'],
                role=row['role'],
                permission_id=row['permission_id'],
                created_at=row['created_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} role permissions'))

    def migrate_user_permissions(self, cursor):
        self.stdout.write('\nMigrating User Permissions...')
        cursor.execute('SELECT * FROM api_userpermission')
        count = 0
        for row in cursor.fetchall():
            UserPermission.objects.create(
                id=row['id'],
                user_id=row['user_id'],
                permission_id=row['permission_id'],
                granted=row['granted'],
                created_at=row['created_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} user permissions'))

    def migrate_constituencies(self, cursor):
        self.stdout.write('\nMigrating Constituencies...')
        cursor.execute('SELECT * FROM api_constituency')
        count = 0
        for row in cursor.fetchall():
            Constituency.objects.create(
                id=row['id'],
                name=row['name'],
                code=row['code'],
                constituency_type=row['type'],
                state=row['state'],
                district=row['district'],
                total_voters=row['total_voters'],
                area_sq_km=row['area_sq_km'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} constituencies'))

    def migrate_polling_booths(self, cursor):
        self.stdout.write('\nMigrating Polling Booths...')
        cursor.execute('SELECT * FROM api_pollingbooth')
        count = 0
        for row in cursor.fetchall():
            PollingBooth.objects.create(
                id=row['id'],
                constituency_id=row['constituency_id'],
                booth_number=row['booth_number'],
                booth_name=row['booth_name'],
                address=row['address'],
                latitude=row['latitude'],
                longitude=row['longitude'],
                total_voters=row['total_voters'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} polling booths'))

    def migrate_campaigns(self, cursor):
        self.stdout.write('\nMigrating Campaigns...')
        cursor.execute('SELECT * FROM api_campaign')
        count = 0
        for row in cursor.fetchall():
            Campaign.objects.create(
                id=row['id'],
                organization_id=row['organization_id'],
                constituency_id=row['constituency_id'],
                name=row['name'],
                description=row['description'],
                campaign_type=row['campaign_type'],
                start_date=row['start_date'],
                end_date=row['end_date'],
                target_voters=row['target_voters'],
                status=row['status'],
                created_by_id=row['created_by_id'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} campaigns'))

    def migrate_issues(self, cursor):
        self.stdout.write('\nMigrating Issues...')
        cursor.execute('SELECT * FROM api_issue')
        count = 0
        for row in cursor.fetchall():
            Issue.objects.create(
                id=row['id'],
                constituency_id=row['constituency_id'],
                title=row['title'],
                description=row['description'],
                category=row['category'],
                priority=row['priority'],
                status=row['status'],
                reported_by_id=row['reported_by_id'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} issues'))

    def migrate_campaign_activities(self, cursor):
        self.stdout.write('\nMigrating Campaign Activities...')
        cursor.execute('SELECT * FROM api_campaignactivity')
        count = 0
        for row in cursor.fetchall():
            CampaignActivity.objects.create(
                id=row['id'],
                campaign_id=row['campaign_id'],
                activity_type=row['activity_type'],
                title=row['title'],
                description=row['description'],
                scheduled_at=row['scheduled_at'],
                location=row['location'],
                status=row['status'],
                created_by_id=row['created_by_id'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} campaign activities'))

    def migrate_voters(self, cursor):
        self.stdout.write('\nMigrating Voters...')
        cursor.execute('SELECT * FROM api_voter')
        count = 0
        for row in cursor.fetchall():
            Voter.objects.create(
                id=row['id'],
                constituency_id=row['constituency_id'],
                polling_booth_id=row['polling_booth_id'],
                voter_id_number=row['voter_id_number'],
                first_name=row['first_name'],
                last_name=row['last_name'],
                age=row['age'],
                gender=row['gender'],
                phone=row['phone'],
                email=row['email'],
                address=row['address'],
                category=row['category'],
                sentiment_score=row['sentiment_score'],
                last_contacted=row['last_contacted'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} voters'))

    def migrate_voter_interactions(self, cursor):
        self.stdout.write('\nMigrating Voter Interactions...')
        cursor.execute('SELECT * FROM api_voterinteraction')
        count = 0
        for row in cursor.fetchall():
            VoterInteraction.objects.create(
                id=row['id'],
                voter_id=row['voter_id'],
                campaign_id=row['campaign_id'],
                interaction_type=row['interaction_type'],
                notes=row['notes'],
                sentiment=row['sentiment'],
                contacted_by_id=row['contacted_by_id'],
                created_at=row['created_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} voter interactions'))

    def migrate_sentiment_analysis(self, cursor):
        self.stdout.write('\nMigrating Sentiment Analysis...')
        cursor.execute('SELECT * FROM api_sentimentanalysis')
        count = 0
        for row in cursor.fetchall():
            SentimentAnalysis.objects.create(
                id=row['id'],
                voter_id=row['voter_id'],
                text_content=row['text_content'],
                sentiment_score=row['sentiment_score'],
                sentiment_label=row['sentiment_label'],
                confidence=row['confidence'],
                analyzed_at=row['analyzed_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} sentiment analyses'))

    def migrate_notifications(self, cursor):
        self.stdout.write('\nMigrating Notifications...')
        cursor.execute('SELECT * FROM api_notification')
        count = 0
        for row in cursor.fetchall():
            Notification.objects.create(
                id=row['id'],
                user_id=row['user_id'],
                title=row['title'],
                message=row['message'],
                notification_type=row['type'],
                is_read=row['is_read'],
                supabase_id=row['supabase_id'],
                synced_to_supabase=row['synced_to_supabase'],
                created_at=row['created_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} notifications'))

    def migrate_tasks(self, cursor):
        self.stdout.write('\nMigrating Tasks...')
        cursor.execute('SELECT * FROM api_task')
        count = 0
        for row in cursor.fetchall():
            Task.objects.create(
                id=row['id'],
                user_id=row['user_id'],
                title=row['title'],
                description=row['description'],
                status=row['status'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} tasks'))

    def migrate_uploaded_files(self, cursor):
        self.stdout.write('\nMigrating Uploaded Files...')
        cursor.execute('SELECT * FROM api_uploadedfile')
        count = 0
        for row in cursor.fetchall():
            UploadedFile.objects.create(
                id=row['id'],
                user_id=row['user_id'],
                file_name=row['file_name'],
                file_path=row['file_path'],
                file_size=row['file_size'],
                mime_type=row['mime_type'],
                uploaded_at=row['uploaded_at']
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Migrated {count} uploaded files'))

    def print_summary(self):
        """Print summary of migrated data"""
        self.stdout.write(f'Organizations: {Organization.objects.count()}')
        self.stdout.write(f'Users: {User.objects.count()}')
        self.stdout.write(f'User Profiles: {UserProfile.objects.count()}')
        self.stdout.write(f'Permissions: {Permission.objects.count()}')
        self.stdout.write(f'Role Permissions: {RolePermission.objects.count()}')
        self.stdout.write(f'User Permissions: {UserPermission.objects.count()}')
        self.stdout.write(f'Constituencies: {Constituency.objects.count()}')
        self.stdout.write(f'Polling Booths: {PollingBooth.objects.count()}')
        self.stdout.write(f'Campaigns: {Campaign.objects.count()}')
        self.stdout.write(f'Issues: {Issue.objects.count()}')
        self.stdout.write(f'Campaign Activities: {CampaignActivity.objects.count()}')
        self.stdout.write(f'Voters: {Voter.objects.count()}')
        self.stdout.write(f'Voter Interactions: {VoterInteraction.objects.count()}')
        self.stdout.write(f'Sentiment Analysis: {SentimentAnalysis.objects.count()}')
        self.stdout.write(f'Notifications: {Notification.objects.count()}')
        self.stdout.write(f'Tasks: {Task.objects.count()}')
        self.stdout.write(f'Uploaded Files: {UploadedFile.objects.count()}')
        self.stdout.write(self.style.SUCCESS('\n✓ Migration completed successfully!'))
