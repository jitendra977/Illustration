from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import Factory, Role, FactoryMember
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed example users for every role in a test factory'

    def handle(self, *args, **options):
        # 1. Create or Get Test Factory
        factory, created = Factory.objects.get_or_create(
            name='Test Factory',
            defaults={'address': '123 Test St, Tokyo'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created factory: {factory.name}'))
        else:
            self.stdout.write(f'Using existing factory: {factory.name}')

        # 2. Define Users to Create
        # Format: (username, role_code, email_prefix)
        users_data = [
            ('user_super_admin', 'SUPER_ADMIN', 'superadmin'),
            ('user_factory_manager', 'FACTORY_MANAGER', 'manager'),
            ('user_illus_admin', 'ILLUSTRATION_ADMIN', 'illus_admin'),
            ('user_editor', 'ILLUSTRATION_EDITOR', 'editor'),
            ('user_contributor', 'ILLUSTRATION_CONTRIBUTOR', 'contributor'),
            ('user_viewer', 'ILLUSTRATION_VIEWER', 'viewer'),
        ]

        with transaction.atomic():
            for username, role_code, email_prefix in users_data:
                # Create User
                email = f'{email_prefix}@example.com'
                user, user_created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'email': email,
                        'is_active': True,
                        'is_verified': True, 
                        'is_staff': (role_code == 'SUPER_ADMIN'), # Only Super Admin is staff
                        'is_superuser': (role_code == 'SUPER_ADMIN')
                    }
                )
                
                if user_created:
                    user.set_password('password123')
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f'Created user: {username}'))
                else:
                    self.stdout.write(f'Using existing user: {username}')

                # Get Role
                try:
                    role = Role.objects.get(code=role_code)
                except Role.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f'Role {role_code} not found! Skipping assignment.'))
                    continue

                # Assign Membership
                member, member_created = FactoryMember.objects.get_or_create(
                    user=user,
                    factory=factory,
                    defaults={'role': role}
                )

                if member_created:
                    self.stdout.write(self.style.SUCCESS(f'  -> Assigned {role.name} to {username}'))
                elif member.role != role:
                    member.role = role
                    member.save()
                    self.stdout.write(self.style.WARNING(f'  -> Updated {username} to {role.name}'))
                else:
                    self.stdout.write(f'  -> {username} is already {role.name}')

        self.stdout.write(self.style.SUCCESS('\n✅ User seeding complete! Password is "password123" for all users.'))
