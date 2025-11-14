"""
Management command to create demo users for testing
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile, Organization

class Command(BaseCommand):
    help = 'Creates demo users with all roles for testing'

    def handle(self, *args, **options):
        """Create demo users with common password"""

        self.stdout.write("🔄 Creating demo users...")

        # Create organization
        org, created = Organization.objects.get_or_create(
            name="Pulse of People",
            slug="pulse-of-people",
            defaults={
                'subscription_status': 'active',
                'subscription_tier': 'premium',
                'max_users': 100,
                'settings': {'demo': True}
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Created organization: {org.name}'))

        # All demo users use the same password
        DEMO_PASSWORD = 'password'

        # Demo users to create: (username, email, role, is_staff, is_superuser)
        demo_users = [
            ('superadmin', 'superadmin@pulse.com', 'superadmin', True, True),
            ('admin', 'admin@pulse.com', 'admin', False, False),
            ('editor', 'editor@pulse.com', 'editor', False, False),
            ('viewer', 'viewer@pulse.com', 'viewer', False, False),
            ('moderator', 'moderator@pulse.com', 'moderator', False, False),
            ('analyst', 'analyst@pulse.com', 'analyst', False, False),
            ('user', 'user@pulse.com', 'user', False, False),
        ]

        created_count = 0
        updated_count = 0

        for username, email, role, is_staff, is_superuser in demo_users:
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': username.capitalize(),
                    'last_name': 'Demo',
                    'is_staff': is_staff,
                    'is_superuser': is_superuser,
                }
            )

            # Always set/update password
            user.set_password(DEMO_PASSWORD)
            user.save()

            # Create or update profile
            profile, profile_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'role': role,
                    'organization': org,
                    'bio': f'Demo {role} user',
                }
            )

            if not profile_created:
                # Update existing profile
                profile.role = role
                profile.organization = org
                profile.save()

            if user_created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✅ Created {username} ({role})'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'⚠️  Updated {username} ({role}) - password reset'))

        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS('🎉 Demo users setup complete!'))
        self.stdout.write("="*60)
        self.stdout.write(f"\n📊 Summary:")
        self.stdout.write(f"   Created: {created_count} users")
        self.stdout.write(f"   Updated: {updated_count} users")
        self.stdout.write(f"\n📋 All users use password: '{DEMO_PASSWORD}'")
        self.stdout.write("\n💡 Available roles:")
        for username, _, role, _, _ in demo_users:
            self.stdout.write(f"   - {username} ({role})")
        self.stdout.write("="*60 + "\n")
