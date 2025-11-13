"""
Script to reset passwords for test users after migration
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Reset passwords for all users
test_passwords = {
    'superadmin': 'admin123',
    'admin': 'admin123',
    'user': 'user123',
    'Superadmins': 'admin123'
}

print('Resetting passwords for test users...\n')

for username, password in test_passwords.items():
    try:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f'✓ Password reset for user: {username} (password: {password})')
    except User.DoesNotExist:
        print(f'✗ User not found: {username}')

print('\n=== Test Credentials ===')
for username, password in test_passwords.items():
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        profile = hasattr(user, 'profile') and user.profile
        role = profile.role if profile else 'N/A'
        print(f'{username} / {password} (Role: {role})')

print('\nDone!')
