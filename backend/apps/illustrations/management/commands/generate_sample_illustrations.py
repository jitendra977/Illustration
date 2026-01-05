from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from apps.illustrations.models import (
    Illustration, IllustrationFile, PartCategory, PartSubCategory, 
    EngineModel, CarModel
)
from apps.accounts.models import User, Factory
from io import BytesIO
import time


class Command(BaseCommand):
    help = 'Generate sample illustrations for all category/subcategory/engine/car combinations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=5,
            help='Number of illustrations to create per combination (default: 5)'
        )

    def create_minimal_pdf(self):
        """Create a minimal valid PDF file"""
        # Minimal PDF - no Japanese characters
        pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 80
>>
stream
BT
/F1 12 Tf
50 750 Td
(Sample Illustration) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
448
%%EOF"""
        
        return BytesIO(pdf_content)

    def handle(self, *args, **options):
        limit = options['limit']
        
        self.stdout.write(self.style.SUCCESS('Starting sample illustration generation...'))
        
        # Get or create a default user and factory
        factory, _ = Factory.objects.get_or_create(
            name='Sample Factory',
            defaults={'address': 'Tokyo'}
        )
        
        user, _ = User.objects.get_or_create(
            email='system@example.com',
            defaults={
                'username': 'system',
                'first_name': 'System',
                'last_name': 'User'
            }
        )
        
        # Get all combinations
        categories = PartCategory.objects.all()
        engines = EngineModel.objects.all()
        
        self.stdout.write(f'Categories: {categories.count()}')
        self.stdout.write(f'Engines: {engines.count()}')
        
        total_created = 0
        total_skipped = 0
        
        for category in categories:
            subcategories = category.subcategories.all()
            
            if not subcategories.exists():
                continue
            
            for subcategory in subcategories:
                for engine in engines:
                    # Get cars compatible with this engine
                    compatible_cars = engine.car_models.all()
                    
                    if not compatible_cars.exists():
                        continue
                    
                    for car in compatible_cars:
                        # Check if illustrations already exist
                        existing_count = Illustration.objects.filter(
                            part_category=category,
                            part_subcategory=subcategory,
                            engine_model=engine,
                            applicable_car_models=car
                        ).count()
                        
                        if existing_count >= limit:
                            total_skipped += 1
                            continue
                        
                        # Create illustrations
                        for i in range(limit - existing_count):
                            # Add timestamp to make title unique
                            timestamp = int(time.time() * 1000)
                            title = f"{car.name} - {engine.name} - {subcategory.name} #{timestamp}"
                            description = f"Sample illustration for {category.name} > {subcategory.name}"
                            
                            # Create PDF
                            pdf_buffer = self.create_minimal_pdf()
                            
                            # Create illustration
                            illustration = Illustration.objects.create(
                                title=title,
                                description=description,
                                part_category=category,
                                part_subcategory=subcategory,
                                engine_model=engine,
                                user=user,
                                factory=factory
                            )
                            
                            # Save PDF file as IllustrationFile
                            filename = f"sample_{illustration.id}.pdf"
                            ill_file = IllustrationFile.objects.create(
                                illustration=illustration,
                                file_type='pdf'
                            )
                            ill_file.file.save(filename, ContentFile(pdf_buffer.read()), save=True)
                            
                            # Add applicable car model
                            illustration.applicable_car_models.add(car)
                            illustration.save()
                            
                            total_created += 1
                            
                            if total_created % 100 == 0:
                                self.stdout.write(f'  Created: {total_created} illustrations...')
        
        self.stdout.write(self.style.SUCCESS(f'\nComplete!'))
        self.stdout.write(self.style.SUCCESS(f'Created illustrations: {total_created}'))
        self.stdout.write(f'Skipped combinations: {total_skipped}')
        self.stdout.write(self.style.SUCCESS(f'Total illustrations: {Illustration.objects.count()}'))
