from django.core.management.base import BaseCommand
from apps.accounts.models import Role, FactoryMember
from django.db import transaction

class Command(BaseCommand):
    help = 'Migrate legacy roles to new standard roles'

    def handle(self, *args, **options):
        # Mapping: Old Code -> New Code
        MAPPING = {
            'OWNER': 'FACTORY_MANAGER',      # Assume Owner ~ Factory Manager
            'MANAGER': 'FACTORY_MANAGER',    # Manager -> Factory Manager
            'SUPERVISOR': 'ILLUSTRATION_ADMIN', # Supervisor -> Illus Admin
            'WORKER': 'ILLUSTRATION_EDITOR',    # Worker -> Editor
            'VIEWER': 'ILLUSTRATION_VIEWER',    # Viewer -> Viewer
            'ADMIN': 'SUPER_ADMIN',             # Admin -> Super Admin
        }

        with transaction.atomic():
            for old_code, new_code in MAPPING.items():
                try:
                    old_role = Role.objects.get(code=old_code)
                except Role.DoesNotExist:
                    self.stdout.write(f'Legacy role {old_code} not found. Skipping.')
                    continue

                try:
                    new_role = Role.objects.get(code=new_code)
                except Role.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f'Target role {new_code} not found! Run seed_roles first.'))
                    continue

                # Find memberships with old role
                memberships = FactoryMember.objects.filter(role=old_role)
                count = memberships.count()
                
                if count > 0:
                    self.stdout.write(f'Migrating {count} memberships from {old_code} to {new_code}...')
                    memberships.update(role=new_role)
                else:
                    self.stdout.write(f'No memberships found for {old_code}.')

                # Delete old role
                self.stdout.write(f'Deleting legacy role {old_code}...')
                old_role.delete()
                
            self.stdout.write(self.style.SUCCESS('\nMigration complete!'))
