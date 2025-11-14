"""
Management command to create default superuser for deployment
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a default superuser if none exists'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@pulseofpeople.com',
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS('✅ Default superuser created: admin / admin123'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ Superuser "admin" already exists'))
