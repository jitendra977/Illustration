from django.core.management.base import BaseCommand
from apps.accounts.models import Role


class Command(BaseCommand):
    help = 'Seed predefined roles for the illustration system'

    def handle(self, *args, **options):
        """
        Create 6 predefined roles:
        1. Super Admin - Full system access
        2. Factory Manager - Factory-level management
        3. Illustration Admin - Full illustration management
        4. Illustration Editor - Create and edit illustrations
        5. Illustration Contributor - Create and edit own illustrations
        6. Illustration Viewer - View-only access
        """
        
        roles_data = [
            {
                'code': 'SUPER_ADMIN',
                'name': 'Super Admin',
                'permissions': {
                    # System Permissions
                    'can_manage_all_systems': True,
                    # Factory Management
                    'can_manage_factory': True,
                    'can_manage_users': True,
                    'can_manage_jobs': True,
                    'can_view_finance': True,
                    'can_edit_finance': True,
                    # Catalog Management
                    'can_manage_catalog': True,
                    # Feedback/Comment Management
                    'can_manage_feedback': True,
                    # Illustration Permissions
                    'can_create_illustration': True,
                    'can_view_illustration': True,
                    'can_edit_illustration': True,
                    'can_delete_illustration': True,
                    'can_view_all_factory_illustrations': True,
                }
            },
            {
                'code': 'FACTORY_MANAGER',
                'name': 'Factory Manager',
                'permissions': {
                    # System Permissions
                    'can_manage_all_systems': False,
                    # Factory Management
                    'can_manage_factory': True,
                    'can_manage_users': True,
                    'can_manage_jobs': True,
                    'can_view_finance': True,
                    'can_edit_finance': True,
                    # Catalog Management
                    'can_manage_catalog': True,
                    # Feedback/Comment Management
                    'can_manage_feedback': True,
                    # Illustration Permissions
                    'can_create_illustration': True,
                    'can_view_illustration': True,
                    'can_edit_illustration': True,
                    'can_delete_illustration': True,
                    'can_view_all_factory_illustrations': True,
                }
            },
            {
                'code': 'ILLUSTRATION_ADMIN',
                'name': 'Illustration Admin',
                'permissions': {
                    # System Permissions
                    'can_manage_all_systems': False,
                    # Factory Management
                    'can_manage_factory': False,
                    'can_manage_users': False,
                    'can_manage_jobs': True,
                    'can_view_finance': False,
                    'can_edit_finance': False,
                    # Catalog Management
                    'can_manage_catalog': True,
                    # Feedback/Comment Management
                    'can_manage_feedback': False,
                    # Illustration Permissions
                    'can_create_illustration': True,
                    'can_view_illustration': True,
                    'can_edit_illustration': True,
                    'can_delete_illustration': True,
                    'can_view_all_factory_illustrations': True,
                }
            },
            {
                'code': 'ILLUSTRATION_EDITOR',
                'name': 'Illustration Editor',
                'permissions': {
                    # System Permissions
                    'can_manage_all_systems': False,
                    # Factory Management
                    'can_manage_factory': False,
                    'can_manage_users': False,
                    'can_manage_jobs': False,
                    'can_view_finance': False,
                    'can_edit_finance': False,
                    # Illustration Permissions
                    'can_create_illustration': True,
                    'can_view_illustration': True,
                    'can_edit_illustration': True,
                    'can_delete_illustration': True,  # Can delete as per request
                    'can_view_all_factory_illustrations': True,
                }
            },
            {
                'code': 'ILLUSTRATION_CONTRIBUTOR',
                'name': 'Illustration Contributor',
                'permissions': {
                    # System Permissions
                    'can_manage_all_systems': False,
                    # Factory Management
                    'can_manage_factory': False,
                    'can_manage_users': False,
                    'can_manage_jobs': False,
                    'can_view_finance': False,
                    'can_edit_finance': False,
                    # Illustration Permissions
                    'can_create_illustration': True,
                    'can_view_illustration': True,
                    'can_edit_illustration': False,  # Can only edit own (handled in User model)
                    'can_delete_illustration': False,  # Can only delete own (handled in User model)
                    'can_view_all_factory_illustrations': False,  # Can only view own
                }
            },
            {
                'code': 'ILLUSTRATION_VIEWER',
                'name': 'Illustration Viewer',
                'permissions': {
                    # System Permissions
                    'can_manage_all_systems': False,
                    # Factory Management
                    'can_manage_factory': False,
                    'can_manage_users': False,
                    'can_manage_jobs': False,
                    'can_view_finance': False,
                    'can_edit_finance': False,
                    # Illustration Permissions
                    'can_create_illustration': False,
                    'can_view_illustration': True,
                    'can_edit_illustration': False,
                    'can_delete_illustration': False,
                    'can_view_all_factory_illustrations': True,  # Can view all
                }
            },
            {
                'code': 'FEEDBACK_MANAGER',
                'name': 'Feedback Manager',
                'permissions': {
                    # System Permissions
                    'can_manage_all_systems': False,
                    # Factory Management
                    'can_manage_factory': False,
                    'can_manage_users': False,
                    'can_manage_jobs': False,
                    'can_view_finance': False,
                    'can_edit_finance': False,
                    # Catalog Management
                    'can_manage_catalog': False,
                    # Feedback/Comment Management
                    'can_manage_feedback': True,
                    # Illustration Permissions
                    'can_create_illustration': False,
                    'can_view_illustration': True,
                    'can_edit_illustration': False,
                    'can_delete_illustration': False,
                    'can_view_all_factory_illustrations': True,
                }
            },
        ]

        created_count = 0
        updated_count = 0

        for role_data in roles_data:
            code = role_data['code']
            name = role_data['name']
            permissions = role_data['permissions']

            role, created = Role.objects.update_or_create(
                code=code,
                defaults={
                    'name': name,
                    **permissions
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created role: {name} ({code})')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated role: {name} ({code})')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Seeding complete! Created: {created_count}, Updated: {updated_count}'
            )
        )
        
        # Display role summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('ROLE SUMMARY'))
        self.stdout.write('='*60)
        
        for role in Role.objects.filter(code__in=[r['code'] for r in roles_data]).order_by('code'):
            self.stdout.write(f'\n{role.name} ({role.code}):')
            self.stdout.write(f'  System: {"✅" if role.can_manage_all_systems else "❌"}')
            self.stdout.write(f'  Factory Mgmt: {"✅" if role.can_manage_factory else "❌"}')
            self.stdout.write(f'  Create: {"✅" if role.can_create_illustration else "❌"}')
            self.stdout.write(f'  View: {"✅" if role.can_view_illustration else "❌"}')
            self.stdout.write(f'  Edit: {"✅" if role.can_edit_illustration else "❌"}')
            self.stdout.write(f'  Delete: {"✅" if role.can_delete_illustration else "❌"}')
            self.stdout.write(f'  View All: {"✅" if role.can_view_all_factory_illustrations else "❌"}')
            self.stdout.write(f'  Catalog: {"✅" if role.can_manage_catalog else "❌"}')
            self.stdout.write(f'  Feedback: {"✅" if role.can_manage_feedback else "❌"}')
        
        self.stdout.write('\n' + '='*60)
