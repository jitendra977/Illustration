"""
Django Management Command: Generate Sample Data
Place this file in: your_app/management/commands/generate_sample_data.py

Usage: python manage.py generate_sample_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from illustrations.models import (
    Manufacturer, EngineModel, CarModel, 
    PartCategory, PartSubCategory, Illustration
)
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Generate sample data for all models with at least 10 illustrations'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting sample data generation...'))
        
        # Create test user
        user = self.create_user()
        
        # Create manufacturers
        manufacturers = self.create_manufacturers()
        
        # Create part categories and subcategories
        categories, subcategories = self.create_categories()
        
        # Create engines and car models
        engines, car_models = self.create_engines_and_cars(manufacturers)
        
        # Create illustrations (at least 10)
        self.create_illustrations(user, engines, car_models, categories, subcategories)
        
        self.stdout.write(self.style.SUCCESS('Sample data generation completed!'))

    def create_user(self):
        """Create or get test user"""
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {user.username}'))
        return user

    def create_manufacturers(self):
        """Create Japanese truck manufacturers"""
        manufacturers_data = [
            'Hino',
            'Isuzu',
            'Mitsubishi Fuso',
            'UD Trucks',
            'Toyota',
            'Nissan',
        ]
        
        manufacturers = []
        for name in manufacturers_data:
            manufacturer, created = Manufacturer.objects.get_or_create(
                name=name,
                defaults={'slug': slugify(name)}
            )
            manufacturers.append(manufacturer)
            if created:
                self.stdout.write(f'Created manufacturer: {name}')
        
        return manufacturers

    def create_categories(self):
        """Create part categories and subcategories"""
        categories_data = {
            'Engine Components': {
                'order': 1,
                'subcategories': ['Pistons', 'Cylinder Head', 'Crankshaft', 'Camshaft', 'Timing Belt']
            },
            'Fuel System': {
                'order': 2,
                'subcategories': ['Fuel Pump', 'Injectors', 'Fuel Filter', 'Fuel Tank', 'Fuel Lines']
            },
            'Cooling System': {
                'order': 3,
                'subcategories': ['Radiator', 'Water Pump', 'Thermostat', 'Coolant Hoses', 'Fan']
            },
            'Electrical System': {
                'order': 4,
                'subcategories': ['Alternator', 'Starter Motor', 'Battery', 'Wiring Harness', 'Sensors']
            },
            'Transmission': {
                'order': 5,
                'subcategories': ['Gearbox', 'Clutch', 'Driveshaft', 'Differential', 'Axle']
            },
            'Brake System': {
                'order': 6,
                'subcategories': ['Brake Pads', 'Brake Disc', 'Brake Caliper', 'Master Cylinder', 'ABS Unit']
            },
            'Suspension': {
                'order': 7,
                'subcategories': ['Shock Absorbers', 'Springs', 'Control Arms', 'Ball Joints', 'Bushings']
            },
            'Exhaust System': {
                'order': 8,
                'subcategories': ['Exhaust Manifold', 'Catalytic Converter', 'Muffler', 'DPF Filter', 'EGR Valve']
            },
        }
        
        categories = []
        subcategories = []
        
        for cat_name, cat_data in categories_data.items():
            category, created = PartCategory.objects.get_or_create(
                name=cat_name,
                defaults={
                    'slug': slugify(cat_name),
                    'order': cat_data['order'],
                    'description': f'{cat_name} parts and components'
                }
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {cat_name}')
            
            # Create subcategories
            for i, subcat_name in enumerate(cat_data['subcategories']):
                subcategory, created = PartSubCategory.objects.get_or_create(
                    part_category=category,
                    name=subcat_name,
                    defaults={
                        'slug': slugify(subcat_name),
                        'order': i,
                        'description': f'{subcat_name} components'
                    }
                )
                subcategories.append(subcategory)
                if created:
                    self.stdout.write(f'  Created subcategory: {subcat_name}')
        
        return categories, subcategories

    def create_engines_and_cars(self, manufacturers):
        """Create engine models and car models"""
        # Engine data for each manufacturer
        engines_data = {
            'Hino': [
                {'name': 'A09C', 'code': 'A09C-TI', 'fuel': 'diesel'},
                {'name': 'E13C', 'code': 'E13C-TN', 'fuel': 'diesel'},
                {'name': 'J08E', 'code': 'J08E-VD', 'fuel': 'diesel'},
                {'name': 'N04C', 'code': 'N04C-UM', 'fuel': 'diesel'},
            ],
            'Isuzu': [
                {'name': '6HK1', 'code': '6HK1-TCN', 'fuel': 'diesel'},
                {'name': '4HK1', 'code': '4HK1-TCC', 'fuel': 'diesel'},
                {'name': '6UZ1', 'code': '6UZ1-TCN', 'fuel': 'diesel'},
                {'name': '4JJ1', 'code': '4JJ1-TCS', 'fuel': 'diesel'},
            ],
            'Mitsubishi Fuso': [
                {'name': '6R10', 'code': '6R10-T3', 'fuel': 'diesel'},
                {'name': '6M60', 'code': '6M60-T4', 'fuel': 'diesel'},
                {'name': '4P10', 'code': '4P10-T6', 'fuel': 'diesel'},
            ],
        }
        
        # Car models data
        cars_data = {
            'Hino': [
                {'name': 'Profia', 'type': 'large_2_axle', 'engines': ['A09C', 'E13C']},
                {'name': 'Ranger', 'type': 'truck_medium_duty', 'engines': ['J08E']},
                {'name': 'Dutro', 'type': 'truck_light_duty', 'engines': ['N04C']},
            ],
            'Isuzu': [
                {'name': 'Giga', 'type': 'large_2_axle', 'engines': ['6HK1', '6UZ1']},
                {'name': 'Forward', 'type': 'truck_medium_duty', 'engines': ['4HK1', '6HK1']},
                {'name': 'Elf', 'type': 'truck_light_duty', 'engines': ['4JJ1']},
            ],
            'Mitsubishi Fuso': [
                {'name': 'Super Great', 'type': 'large_2_axle', 'engines': ['6R10']},
                {'name': 'Fighter', 'type': 'truck_medium_duty', 'engines': ['6M60']},
                {'name': 'Canter', 'type': 'truck_light_duty', 'engines': ['4P10']},
            ],
        }
        
        engines = []
        car_models = []
        
        # Create engines
        for manufacturer in manufacturers:
            if manufacturer.name in engines_data:
                for engine_data in engines_data[manufacturer.name]:
                    engine, created = EngineModel.objects.get_or_create(
                        manufacturer=manufacturer,
                        name=engine_data['name'],
                        defaults={
                            'engine_code': engine_data['code'],
                            'fuel_type': engine_data['fuel'],
                            'slug': slugify(f"{manufacturer.name}-{engine_data['name']}")
                        }
                    )
                    engines.append(engine)
                    if created:
                        self.stdout.write(f'Created engine: {engine}')
        
        # Create car models
        for manufacturer in manufacturers:
            if manufacturer.name in cars_data:
                for car_data in cars_data[manufacturer.name]:
                    car_model, created = CarModel.objects.get_or_create(
                        manufacturer=manufacturer,
                        name=car_data['name'],
                        defaults={
                            'vehicle_type': car_data['type'],
                            'year_from': 2015,
                            'slug': slugify(f"{manufacturer.name}-{car_data['name']}")
                        }
                    )
                    
                    if created:
                        # Link engines to car model
                        engine_names = car_data['engines']
                        related_engines = EngineModel.objects.filter(
                            manufacturer=manufacturer,
                            name__in=engine_names
                        )
                        car_model.engines.set(related_engines)
                        car_models.append(car_model)
                        self.stdout.write(f'Created car model: {car_model}')
        
        return engines, car_models

    def create_illustrations(self, user, engines, car_models, categories, subcategories):
        """Create at least 10 illustrations with varied combinations"""
        
        illustration_titles = [
            'Assembly Diagram - Complete View',
            'Exploded Parts Diagram',
            'Installation Guide',
            'Removal Procedure',
            'Maintenance Schedule',
            'Torque Specifications',
            'Electrical Wiring Diagram',
            'Component Location Map',
            'Service Manual Extract',
            'Repair Procedure Guide',
            'Replacement Parts List',
            'Technical Specifications',
            'Troubleshooting Guide',
            'Inspection Points Diagram',
            'Lubrication Points',
        ]
        
        descriptions = [
            'Detailed view showing all components and assembly points',
            'Step-by-step installation instructions with torque values',
            'Complete parts breakdown with reference numbers',
            'Maintenance intervals and service procedures',
            'Electrical connections and wire routing diagram',
            'Component locations for quick reference',
            'Service procedures following manufacturer guidelines',
            'Common issues and troubleshooting steps',
            'Regular inspection points and specifications',
            'Lubrication requirements and grease points',
        ]
        
        count = 0
        target = 15  # Create 15 illustrations to ensure we have more than 10
        
        for i in range(target):
            # Select random components
            engine = random.choice(engines)
            category = random.choice(categories)
            subcategory = random.choice([
                sub for sub in subcategories 
                if sub.part_category == category
            ])
            
            title = f"{random.choice(illustration_titles)} - {subcategory.name}"
            
            # Check if this combination already exists
            existing = Illustration.objects.filter(
                engine_model=engine,
                part_category=category,
                part_subcategory=subcategory,
                title=title
            ).exists()
            
            if not existing:
                illustration = Illustration.objects.create(
                    user=user,
                    engine_model=engine,
                    part_category=category,
                    part_subcategory=subcategory,
                    title=title,
                    description=random.choice(descriptions)
                )
                
                # Link to applicable car models
                applicable_cars = [
                    car for car in car_models 
                    if engine in car.engines.all()
                ]
                if applicable_cars:
                    illustration.applicable_car_models.set(
                        random.sample(applicable_cars, min(2, len(applicable_cars)))
                    )
                
                count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created illustration {count}/{target}: {illustration.title}'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nTotal illustrations created: {count}'
            )
        )