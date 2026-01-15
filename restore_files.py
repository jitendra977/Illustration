import shutil
from pathlib import Path

# Configuration
BACKUP_BASE = Path('/Volumes/Programming/React-Python/YAW/Illustration-System/unused_backup')
SOURCE_BASE = Path('/Volumes/Programming/React-Python/YAW/Illustration-System/frontend/src')

# Files to restore (relative to frontend/src)
FILES_TO_RESTORE = [
    'pages/admin/UserDialog.jsx'
]

def restore_files():
    print(f"Restoring files from {BACKUP_BASE} to {SOURCE_BASE}...")
    
    count = 0
    for relative_path in FILES_TO_RESTORE:
        backup_path = BACKUP_BASE / 'frontend/src' / relative_path
        dest_path = SOURCE_BASE / relative_path
        
        if backup_path.exists():
            try:
                # Create parent directories if they don't exist
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Move the file back
                shutil.move(str(backup_path), str(dest_path))
                print(f"Restored: {relative_path}")
                count += 1
            except Exception as e:
                print(f"Error restoring {relative_path}: {e}")
        else:
            print(f"Skipped (not found in backup): {relative_path}")
            
    print(f"\nOperation complete. Restored {count} files.")

if __name__ == "__main__":
    restore_files()
