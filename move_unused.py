import os
import shutil
from pathlib import Path

# Configuration
SOURCE_BASE = Path('/Volumes/Programming/React-Python/YAW/Illustration-System/frontend/src')
BACKUP_BASE = Path('/Volumes/Programming/React-Python/YAW/Illustration-System/unused_backup')

# List of files identified as unused
UNUSED_FILES = [
    'components/common/Button.jsx',
    'components/common/Input.jsx',
    'components/common/Loader.jsx',
    'components/layout/Navbar.jsx',
    'components/layout/PageHeader.jsx',
    'components/layout/Sidebar.jsx',
    'components/forms/UserForm.jsx',
    'components/forms/EditIllustrationModal.jsx',
    'components/illustrations/IllustrationCard.jsx',
    'pages/auth/Login.jsx',
    'pages/auth/Register.jsx',
    'pages/dashboard/Dashboard.jsx',
    'pages/admin/FactoryManagement.jsx',
    'pages/admin/PasswordDialog.jsx',
    'pages/admin/RoleManagement.jsx',
    'pages/admin/UserDialog.jsx',
    'pages/admin/UserManagement.jsx',
    'pages/Illustrations/CarModelManagement.jsx',
    'pages/Illustrations/EngineModelManagement.jsx',
    'pages/Illustrations/IllustrationDashboard.jsx',
    'pages/Illustrations/ManufacturerManagement.jsx',
    'pages/Illustrations/PartCategoryManagement.jsx',
    'pages/navigation/PartCategoryList.jsx',
    'utils/token.js'
    # 'components/common/GlassCard.jsx' # Excluded - Used
]

def move_files():
    print(f"Moving unused files to {BACKUP_BASE}...")
    
    count = 0
    for relative_path in UNUSED_FILES:
        source_path = SOURCE_BASE / relative_path
        
        # Calculate destination path maintaining structure
        # E.g. unused_backup/frontend/src/components/common/Button.jsx
        dest_path = BACKUP_BASE / 'frontend/src' / relative_path
        
        if source_path.exists():
            try:
                # Create parent directories if they don't exist
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Move the file
                shutil.move(str(source_path), str(dest_path))
                print(f"Moved: {relative_path}")
                count += 1
            except Exception as e:
                print(f"Error moving {relative_path}: {e}")
        else:
            print(f"Skipped (not found): {relative_path}")
            
    print(f"\nOperation complete. Moved {count} files.")

if __name__ == "__main__":
    move_files()
