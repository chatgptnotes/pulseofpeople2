"""
Management command to seed political CRM data (States, Zones, Districts, Parties)
Usage: python manage.py seed_political_data
"""
from django.core.management.base import BaseCommand
from api.models import State, Zone, District, Organization


class Command(BaseCommand):
    help = 'Seed initial data for Political CRM (States, Zones, Districts, Test Parties)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting political data seeding...'))

        # Create States
        self.create_states()

        # Create Test Parties
        self.create_test_parties()

        self.stdout.write(self.style.SUCCESS('\n✓ Political data seeding completed successfully!'))

    def create_states(self):
        self.stdout.write('\n1. Creating States...')

        states_data = [
            {'name': 'Delhi', 'code': 'DL'},
            {'name': 'Maharashtra', 'code': 'MH'},
            {'name': 'Punjab', 'code': 'PB'},
            {'name': 'Uttar Pradesh', 'code': 'UP'},
            {'name': 'Karnataka', 'code': 'KA'},
            {'name': 'Gujarat', 'code': 'GJ'},
            {'name': 'West Bengal', 'code': 'WB'},
            {'name': 'Tamil Nadu', 'code': 'TN'},
            {'name': 'Rajasthan', 'code': 'RJ'},
            {'name': 'Madhya Pradesh', 'code': 'MP'},
        ]

        for state_data in states_data:
            state, created = State.objects.get_or_create(
                code=state_data['code'],
                defaults={'name': state_data['name']}
            )
            if created:
                self.stdout.write(f'  ✓ Created state: {state.name}')

                # Create zones for this state
                self.create_zones_for_state(state)

    def create_zones_for_state(self, state):
        """Create sample zones for a state"""
        zones_map = {
            'Delhi': ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
            'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
            'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
            'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi'],
            'Karnataka': ['Bangalore Urban', 'Mysore', 'Hubli-Dharwad', 'Mangalore', 'Belgaum'],
        }

        zones = zones_map.get(state.name, [f'{state.name} Zone 1', f'{state.name} Zone 2'])

        for zone_name in zones:
            zone, created = Zone.objects.get_or_create(
                state=state,
                name=zone_name,
                defaults={'code': zone_name.replace(' ', '_').upper()}
            )
            if created:
                self.stdout.write(f'    ✓ Created zone: {zone_name}')

                # Create districts for this zone
                self.create_districts_for_zone(zone)

    def create_districts_for_zone(self, zone):
        """Create sample districts for a zone"""
        # Create 2-3 districts per zone
        district_names = [
            f'{zone.name} District 1',
            f'{zone.name} District 2',
        ]

        for district_name in district_names:
            district, created = District.objects.get_or_create(
                zone=zone,
                name=district_name,
                defaults={'code': district_name.replace(' ', '_').upper()}
            )
            if created:
                self.stdout.write(f'      ✓ Created district: {district_name}')

    def create_test_parties(self):
        self.stdout.write('\n2. Creating Test Political Parties...')

        parties_data = [
            {
                'name': 'BJP - Bharatiya Janata Party',
                'slug': 'bjp',
                'party_name': 'Bharatiya Janata Party',
                'party_symbol': 'Lotus',
                'party_color': '#FF9933',
                'subscription_tier': 'pro',
                'max_users': 500
            },
            {
                'name': 'INC - Indian National Congress',
                'slug': 'inc',
                'party_name': 'Indian National Congress',
                'party_symbol': 'Hand',
                'party_color': '#00ADEF',
                'subscription_tier': 'pro',
                'max_users': 500
            },
            {
                'name': 'AAP - Aam Aadmi Party',
                'slug': 'aap',
                'party_name': 'Aam Aadmi Party',
                'party_symbol': 'Broom',
                'party_color': '#0066B3',
                'subscription_tier': 'basic',
                'max_users': 200
            },
            {
                'name': 'TMC - Trinamool Congress',
                'slug': 'tmc',
                'party_name': 'All India Trinamool Congress',
                'party_symbol': 'Flowers',
                'party_color': '#20C646',
                'subscription_tier': 'basic',
                'max_users': 200
            },
            {
                'name': 'SP - Samajwadi Party',
                'slug': 'sp',
                'party_name': 'Samajwadi Party',
                'party_symbol': 'Bicycle',
                'party_color': '#FF2222',
                'subscription_tier': 'basic',
                'max_users': 200
            }
        ]

        for party_data in parties_data:
            party, created = Organization.objects.get_or_create(
                slug=party_data['slug'],
                defaults=party_data
            )
            if created:
                self.stdout.write(f'  ✓ Created party: {party.party_name} ({party.slug})')
            else:
                self.stdout.write(f'  - Party already exists: {party.party_name}')
