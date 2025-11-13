#!/usr/bin/env python3
"""
Create test users for all roles
Run this script to populate the database with test data
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile, Organization, Constituency, PollingBooth, Voter, Campaign
from datetime import date, timedelta

def create_test_users():
    """Create test users with different roles"""

    print("🔄 Creating test users...")

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
    print(f"{'✅ Created' if created else '✅ Found'} organization: {org.name}")

    # 1. Create Superadmin
    superadmin_user, created = User.objects.get_or_create(
        username='superadmin',
        defaults={
            'email': 'superadmin@gmail.com',
            'first_name': 'Super',
            'last_name': 'Admin',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        superadmin_user.set_password('bhupendra')
        superadmin_user.save()
        print(f"✅ Created superadmin user: {superadmin_user.username}")
    else:
        print(f"✅ Found superadmin user: {superadmin_user.username}")

    # Create superadmin profile
    superadmin_profile, created = UserProfile.objects.get_or_create(
        user=superadmin_user,
        defaults={
            'role': 'superadmin',
            'organization': org,
            'bio': 'System Administrator with full access',
        }
    )
    print(f"  → Profile: {superadmin_profile.role}")

    # 2. Create Admin
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@gmail.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': False,
            'is_superuser': False,
        }
    )
    if created:
        admin_user.set_password('bhupendra')
        admin_user.save()
        print(f"✅ Created admin user: {admin_user.username}")
    else:
        # Update password if exists
        admin_user.set_password('bhupendra')
        admin_user.save()
        print(f"✅ Found admin user (password updated): {admin_user.username}")

    # Create admin profile
    admin_profile, created = UserProfile.objects.get_or_create(
        user=admin_user,
        defaults={
            'role': 'admin',
            'organization': org,
            'bio': 'Admin user who can manage regular users',
        }
    )
    if not created:
        admin_profile.role = 'admin'
        admin_profile.organization = org
        admin_profile.save()
    print(f"  → Profile: {admin_profile.role}")

    # 3. Create Regular User
    user, created = User.objects.get_or_create(
        username='user',
        defaults={
            'email': 'user@gmail.com',
            'first_name': 'Regular',
            'last_name': 'User',
            'is_staff': False,
            'is_superuser': False,
        }
    )
    if created:
        user.set_password('bhupendra')
        user.save()
        print(f"✅ Created regular user: {user.username}")
    else:
        # Update password if exists
        user.set_password('bhupendra')
        user.save()
        print(f"✅ Found regular user (password updated): {user.username}")

    # Create user profile
    user_profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'role': 'user',
            'organization': org,
            'bio': 'Regular user with limited access',
        }
    )
    if not created:
        user_profile.role = 'user'
        user_profile.organization = org
        user_profile.save()
    print(f"  → Profile: {user_profile.role}")

    print("\n" + "="*60)
    print("🎉 Test users created successfully!")
    print("="*60)
    print("\n📋 LOGIN CREDENTIALS:\n")
    print("1️⃣  SUPERADMIN:")
    print("   Username: superadmin")
    print("   Password: bhupendra")
    print("   Email: superadmin@pulseofpeople.com")
    print("   Access: Full system access\n")

    print("2️⃣  ADMIN:")
    print("   Username: admin")
    print("   Password: bhupendra")
    print("   Email: admin@pulseofpeople.com")
    print("   Access: Manage regular users\n")

    print("3️⃣  USER:")
    print("   Username: user")
    print("   Password: 
    ")
    print("   Email: user@pulseofpeople.com")
    print("   Access: Regular user access\n")

    print("="*60)
    print("🚀 You can now login at: http://localhost:5173/login")
    print("="*60)


def create_sample_data():
    """Create sample constituencies, booths, and voters"""

    print("\n🔄 Creating sample data...")

    org = Organization.objects.first()
    if not org:
        print("❌ No organization found!")
        return

    # Create sample constituencies
    constituencies_data = [
        {
            'name': 'Mumbai North',
            'code': 'MH-01',
            'type': 'parliamentary',
            'state': 'Maharashtra',
            'district': 'Mumbai',
            'voter_count': 1500000,
            'total_booths': 1200,
            'population': 2000000,
        },
        {
            'name': 'Delhi Central',
            'code': 'DL-01',
            'type': 'assembly',
            'state': 'Delhi',
            'district': 'Central Delhi',
            'voter_count': 800000,
            'total_booths': 600,
            'population': 1000000,
        },
        {
            'name': 'Bangalore South',
            'code': 'KA-01',
            'type': 'parliamentary',
            'state': 'Karnataka',
            'district': 'Bangalore',
            'voter_count': 1200000,
            'total_booths': 900,
            'population': 1500000,
        },
    ]

    constituencies = []
    for data in constituencies_data:
        const, created = Constituency.objects.get_or_create(
            code=data['code'],
            defaults={**data, 'organization': org}
        )
        constituencies.append(const)
        if created:
            print(f"✅ Created constituency: {const.name}")

    # Create sample polling booths
    booth_count = 0
    for const in constituencies:
        for i in range(1, 6):  # 5 booths per constituency
            booth, created = PollingBooth.objects.get_or_create(
                constituency=const,
                code=f"{const.code}-B{i:03d}",
                defaults={
                    'name': f"{const.name} - Booth {i}",
                    'booth_number': f"B{i:03d}",
                    'location': f"Location {i}",
                    'address': f"Address {i}, {const.district}",
                    'total_voters': 1000 + (i * 100),
                    'status': 'active',
                    'organization': org,
                }
            )
            if created:
                booth_count += 1

    print(f"✅ Created {booth_count} polling booths")

    # Create sample voters
    voter_count = 0
    sentiments = ['positive', 'neutral', 'negative', 'strongly_positive']
    categories = ['core_supporter', 'swing_voter', 'undecided']

    for const in constituencies:
        booths = const.polling_booths.all()[:3]  # First 3 booths
        for booth in booths:
            for i in range(1, 11):  # 10 voters per booth
                voter, created = Voter.objects.get_or_create(
                    voter_id_number=f"{booth.code}-V{i:04d}",
                    defaults={
                        'polling_booth': booth,
                        'organization': org,
                        'full_name': f"Voter {i} {booth.booth_number}",
                        'phone': f"+91 98765{i:05d}",
                        'age': 25 + (i * 2),
                        'gender': 'male' if i % 2 == 0 else 'female',
                        'voter_category': categories[i % 3],
                        'sentiment': sentiments[i % 4],
                        'sentiment_score': (i % 10 - 5) / 10.0,
                        'influencer_score': i * 10,
                        'first_time_voter': i % 5 == 0,
                        'verified': i % 3 == 0,
                    }
                )
                if created:
                    voter_count += 1

    print(f"✅ Created {voter_count} voters")

    # Create sample campaigns
    campaign_count = 0
    for const in constituencies[:2]:  # First 2 constituencies
        campaign, created = Campaign.objects.get_or_create(
            name=f"Campaign {const.name} 2025",
            organization=org,
            defaults={
                'constituency': const,
                'description': f"Electoral campaign for {const.name}",
                'status': 'active',
                'start_date': date.today() - timedelta(days=30),
                'end_date': date.today() + timedelta(days=60),
                'manager': User.objects.get(username='admin'),
                'target_voters': 50000,
                'reached_voters': 15000,
                'budget': 1000000.00,
                'spent': 250000.00,
            }
        )
        if created:
            campaign_count += 1

    print(f"✅ Created {campaign_count} campaigns")

    print("\n" + "="*60)
    print("🎉 Sample data created successfully!")
    print("="*60)
    print(f"\n📊 SUMMARY:")
    print(f"   - Constituencies: {len(constituencies)}")
    print(f"   - Polling Booths: {booth_count}")
    print(f"   - Voters: {voter_count}")
    print(f"   - Campaigns: {campaign_count}")
    print("="*60)


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 PULSE OF PEOPLE - TEST DATA SETUP")
    print("="*60 + "\n")

    try:
        create_test_users()
        create_sample_data()

        print("\n✅ ALL DONE! You can now:")
        print("   1. Start Django: python3 manage.py runserver")
        print("   2. Start Frontend: cd ../pulseofprojectfrontendonly && npm run dev")
        print("   3. Login with any of the credentials above")
        print("   4. Test different dashboards!\n")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
