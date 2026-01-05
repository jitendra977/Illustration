
import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.illustrations.models import CarModel, EngineModel, Manufacturer

def link_engines_to_cars():
    print("Linking engines to cars based on manufacturer...")
    
    manufacturers = Manufacturer.objects.all()
    
    total_links = 0
    
    for manufacturer in manufacturers:
        print(f"\nProcessing {manufacturer.name}...")
        
        # Get all engines for this manufacturer
        engines = EngineModel.objects.filter(manufacturer=manufacturer)
        if not engines.exists():
            print(f"  No engines found for {manufacturer.name}")
            continue
            
        # Get all cars for this manufacturer
        cars = CarModel.objects.filter(manufacturer=manufacturer)
        if not cars.exists():
            print(f"  No cars found for {manufacturer.name}")
            continue
            
        print(f"  Found {engines.count()} engines and {cars.count()} cars.")
        
        # Link all engines to all cars (heuristic)
        for car in cars:
            original_count = car.engines.count()
            car.engines.add(*engines)
            new_count = car.engines.count()
            added = new_count - original_count
            if added > 0:
                print(f"    Linked {added} engines to {car.name}")
                total_links += added
                
    print(f"\nDone! Created {total_links} new links.")

if __name__ == "__main__":
    link_engines_to_cars()
