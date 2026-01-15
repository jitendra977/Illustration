import os
import re
from pathlib import Path

# Configuration
SOURCE_DIR = '/Volumes/Programming/React-Python/YAW/Illustration-System/frontend/src'
EXTENSIONS = {'.js', '.jsx'}
EXCLUDE_FILES = {'main.jsx', 'reportWebVitals.js', 'setupTests.js', 'check_api.js'} # Common entry/config files

def get_all_files(root_dir):
    files = []
    for root, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if Path(filename).suffix in EXTENSIONS:
                files.append(Path(root) / filename)
    return files

def resolve_import(import_path, current_file_path):
    # Handle absolute imports (assuming aliasing or direct from src)
    if import_path.startswith('/'):
        # This is rare in JS unless specifically configured, usually means root of FS or alias
        # For this codebase, likely alias or just local path
         pass
    
    # Simple resolution logic
    # Check if it's a relative path
    if import_path.startswith('.'):
        resolved_path = (current_file_path.parent / import_path).resolve()
    else:
        # Assume it's relative to src for non-relative paths (common in React)
        # OR it's a node_module (which we ignore)
        # But wait, looking at file list: 'components/common/Button.jsx'
        # So 'components/...' is likely relative to 'src'
        resolved_path = Path(SOURCE_DIR) / import_path

    # Try extensions
    possible_paths = [
        resolved_path,
        resolved_path.with_suffix('.js'),
        resolved_path.with_suffix('.jsx'),
        resolved_path / 'index.js',
        resolved_path / 'index.jsx'
    ]
    
    for path in possible_paths:
        if path.exists():
            return path
    
    return None

def analyze_usage():
    all_files = get_all_files(SOURCE_DIR)
    file_usage = {f: 0 for f in all_files}
    
    # Mark entry points as used
    for f in all_files:
        if f.name in EXCLUDE_FILES:
            file_usage[f] = 1

    import_regex = re.compile(r'import\s+.*?\s+from\s+[\'"](.*?)[\'"]|import\s+[\'"](.*?)[\'"]|require\s*\(\s*[\'"](.*?)[\'"]\s*\)')

    for file_path in all_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Dynamic imports
                # const Foo = lazy(() => import('./Foo'));
                dynamic_imports = re.findall(r'import\(\s*[\'"](.*?)[\'"]\s*\)', content)
                
                matches = import_regex.findall(content)
                
                imports_to_check = []
                for m in matches:
                    # m is a tuple of (group1, group2, group3)
                    path = m[0] or m[1] or m[2]
                    if path:
                        imports_to_check.append(path)
                
                imports_to_check.extend(dynamic_imports)

                for import_path in imports_to_check:
                    # Ignore node_modules (non-relative, no extension usually, but could be 'react')
                    # HACK: If it starts with '.', it's local. If it looks like 'components/...', it might be local
                    
                    if import_path.startswith('.'):
                         resolved = resolve_import(import_path, file_path)
                         if resolved and resolved in file_usage:
                             file_usage[resolved] += 1
                    else:
                        # Check if it matches a file in src directly (e.g. absolute import configured in jsconfig)
                        # or specifically for this project structure
                        potential_path = Path(SOURCE_DIR) / import_path
                        resolved = resolve_import(str(import_path), file_path) # Utilize the logic in resolve_import which handles src-relative
                        
                        if resolved and resolved in file_usage:
                             file_usage[resolved] += 1

        except Exception as e:
            print(f"Error reading {file_path}: {e}")

    unused = [f for f, count in file_usage.items() if count == 0]
    return unused

if __name__ == "__main__":
    unused_files = analyze_usage()
    print("Possibly Undetected/Unused Files:")
    for f in unused_files:
        print(f.relative_to(SOURCE_DIR))
