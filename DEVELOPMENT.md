# 📘 YAW Illustration System - Development Guide

This guide contains the "No-Mistake" workflows for running, testing, and deploying the application.

## ⚡ Quick Scripts (Cheat Sheet)

| Goal | Command | Description |
| :--- | :--- | :--- |
| **Start / Restart** | `scripts/dev.sh` | Safe daily restart. |
| **Fix Hook Errors** | `scripts/dev.sh --nuclear` | Deep clean. Deletes volumes & modules. |
| **Deploy to VPS** | `scripts/deploy.sh` | Pushes code & updates server automatically. |
| **View Logs** | `docker compose logs -f` | View live server output. |

---

## 🛠 1. Local Development
### Standard Start
To start the application normally:
```bash
scripts/dev.sh
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)

### Handling Updates (Mistake-Proof)
Follow this table to avoid "Invalid Hook Call" errors when files change.

| If You Changed... | Do This... |
| :--- | :--- |
| **React Code** (`.jsx`, `.css`) | **Nothing.** Browser updates automatically. |
| **package.json** (New Libs) | **MUST Rebuild.** Run `scripts/dev.sh --nuclear` |
| **Python Code** (`views.py`) | **Nothing.** Server reloads automatically. |
| **Database Models** | **See "Database Changes" section below** |

---

## 📦 2. Frontend Dependencies (node_modules)

### When You Need to Rebuild

**CRITICAL:** Any time you change `package.json`, you MUST do a clean rebuild to avoid "Invalid Hook Call" errors.

### Common Scenarios

#### Scenario 1: Installing a New Package
```bash
# Example: Adding a new library
cd frontend
npm install axios
# or
bun add axios
```

**What to do next:**
```bash
# Return to project root
cd ..

# Clean rebuild (REQUIRED)
scripts/dev.sh --nuclear
```

#### Scenario 2: Updating Package Versions
```json
// frontend/package.json - BEFORE
{
  "dependencies": {
    "react": "^18.3.1",
    "axios": "^1.7.7"
  }
}

// frontend/package.json - AFTER
{
  "dependencies": {
    "react": "^18.3.1",
    "axios": "^1.8.0"  // Updated version
  }
}
```

**What to do next:**
```bash
./dev.sh --nuclear
```

#### Scenario 3: Removing a Package
```bash
cd frontend
npm uninstall lodash
# or
bun remove lodash
```

**What to do next:**
```bash
cd ..
scripts/dev.sh --nuclear
```

#### Scenario 4: Pulling Code with New Dependencies
If someone else added packages and you pulled their code:

```bash
# After git pull
git pull origin deploy-server

# Check if package.json changed
git diff HEAD@{1} frontend/package.json

# If it changed, rebuild
scripts/dev.sh --nuclear
```

### Why the "Nuclear" Rebuild is Required

The `--nuclear` flag does these critical steps:

1. **Stops containers** - Prevents file locks
2. **Removes Docker volumes** - Clears cached dependencies
3. **Deletes local node_modules** - Removes conflicting packages
4. **Fresh install** - Installs dependencies from scratch inside Docker

**Without this, you'll get:**
- ❌ "Invalid hook call" errors
- ❌ "Cannot read properties of null" errors
- ❌ Mismatched React versions
- ❌ White screen with console errors

### Quick Reference Table

| Action | Command | Rebuild Required? |
| :--- | :--- | :--- |
| Changed `.jsx` or `.css` files | None | ❌ No (HMR handles it) |
| Added new package (`npm install`) | `scripts/dev.sh --nuclear` | ✅ YES |
| Updated package version | `scripts/dev.sh --nuclear` | ✅ YES |
| Removed package | `scripts/dev.sh --nuclear` | ✅ YES |
| Pulled code with `package.json` changes | `scripts/dev.sh --nuclear` | ✅ YES |
| Changed `vite.config.js` | `scripts/dev.sh` | ⚠️ Maybe (safe rebuild recommended) |

### Troubleshooting

#### Issue: "Invalid Hook Call" after installing a package
**Cause:** Old `node_modules` cached in Docker volume  
**Solution:**
```bash
scripts/dev.sh --nuclear
```

#### Issue: Package installed but import fails
**Cause:** Package installed on host, not in Docker container  
**Solution:**
```bash
# Don't install packages directly in frontend/
# Instead, edit package.json manually, then:
scripts/dev.sh --nuclear
```

#### Issue: Different versions locally vs. in Docker
**Cause:** `package-lock.json` or `bun.lockb` out of sync  
**Solution:**
```bash
# Delete lock files and rebuild
sudo rm -rf frontend/package-lock.json frontend/bun.lockb
scripts/dev.sh --nuclear
```

### Best Practices

1. ✅ **Always use `scripts/dev.sh --nuclear`** after `package.json` changes
2. ✅ **Commit `package.json` changes** before deploying
3. ✅ **Test locally first** before pushing to production
4. ❌ **Never install packages directly** in `frontend/` folder (use Docker)
5. ❌ **Never manually edit `node_modules`** (always reinstall)

---

## 🗄️ 3. Database Model Changes
When you modify Django models, you must create and apply migrations. Here's the complete process:

### Step-by-Step Process

#### 1. Edit Your Model
Example: Adding a new field to an existing model

```python
# backend/apps/illustrations/models.py
class Illustration(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # NEW FIELD - Adding a priority field
    priority = models.IntegerField(default=0, help_text="Higher number = higher priority")
    
    created_at = models.DateTimeField(auto_now_add=True)
```

#### 2. Create Migration Files
Run this command to generate migration files based on your model changes:
```bash
docker compose -f docker-compose.local.yml exec yaw-backend python manage.py makemigrations
```

**Expected Output:**
```
Migrations for 'illustrations':
  backend/apps/illustrations/migrations/0003_illustration_priority.py
    - Add field priority to illustration
```

#### 3. Apply Migrations
Apply the migrations to update your database schema:
```bash
docker compose -f docker-compose.local.yml exec yaw-backend python manage.py migrate
```

**Expected Output:**
```
Running migrations:
  Applying illustrations.0003_illustration_priority... OK
```

#### 4. Verify (Optional)
Check that the migration was applied:
```bash
docker compose -f docker-compose.local.yml exec yaw-backend python manage.py showmigrations illustrations
```

### Common Examples

#### Example 1: Adding a New Field
```python
# Add a field with a default value
status = models.CharField(
    max_length=20,
    choices=[('draft', 'Draft'), ('published', 'Published')],
    default='draft'
)
```

#### Example 2: Creating a New Model
```python
# backend/apps/illustrations/models.py
class IllustrationTag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    illustrations = models.ManyToManyField('Illustration', related_name='tags')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
```

After creating a new model:
```bash
# 1. Generate migration
docker compose -f docker-compose.local.yml exec yaw-backend python manage.py makemigrations

# 2. Apply migration
docker compose -f docker-compose.local.yml exec yaw-backend python manage.py migrate
```

#### Example 3: Modifying an Existing Field
```python
# Changing a field type (requires careful migration)
# OLD: title = models.CharField(max_length=255)
# NEW: title = models.CharField(max_length=500)
```

**Important:** Django will ask if you want to provide a default for existing rows when making breaking changes.

### Troubleshooting

#### Migration Conflicts
If you see "conflicting migrations", you may need to merge them:
```bash
docker compose -f docker-compose.local.yml exec yaw-backend python manage.py makemigrations --merge
```

#### Reset Migrations (DANGER - Development Only)
If migrations are completely broken in development:
```bash
# 1. Delete migration files (keep __init__.py)
rm backend/apps/illustrations/migrations/0*.py

# 2. Drop and recreate database
docker compose down -v
docker compose -f docker-compose.local.yml up -d

# 3. Create fresh migrations
docker compose -f docker-compose.local.yml exec yaw-backend python manage.py makemigrations
docker compose -f docker-compose.local.yml exec yaw-backend python manage.py migrate
```

⚠️ **Never do this on production!**

---

### The "Nuclear Reset"
If you see `Invalid Hook Call` or weird errors, run this to reset the environment:
```bash
./dev.sh --nuclear
```
*This deletes `node_modules` and Docker volumes to ensure a fresh, clean state.*

---

## 🚀 4. Deployment to VPS

### What `deploy.sh` Does (Step-by-Step)

The `scripts/deploy.sh` script automates the entire deployment process. Here's exactly what happens:

#### Phase 1: Local Machine
1. **Pushes Code to GitHub**
   ```bash
   git push origin deploy-server
   ```
   - Uploads your local commits to the `deploy-server` branch on GitHub
   - This ensures the VPS can pull the latest code

#### Phase 2: Remote VPS (via SSH)
The script connects to `nishanaweb@nishanaweb.cloud` and executes these commands:

2. **Navigate to Project Directory**
   ```bash
   cd /home/nishanaweb/project/Illustration
   ```

3. **Configure Git Safety**
   ```bash
   git config --global --add safe.directory /home/nishanaweb/project/Illustration
   ```
   - Prevents Git ownership warnings

4. **Fetch Latest Changes**
   ```bash
   git fetch origin
   ```
   - Downloads the latest code from GitHub (without applying it yet)

5. **Stash Local Changes**
   ```bash
   git stash
   ```
   - Temporarily saves any local modifications (like `.env` files)
   - Prevents conflicts when pulling

6. **Pull Latest Code**
   ```bash
   git pull origin deploy-server
   ```
   - Applies the latest code from the `deploy-server` branch

7. **Restore Local Changes**
   ```bash
   git stash pop
   ```
   - Restores the stashed `.env` files and local configurations

8. **Rebuild and Restart Containers**
   ```bash
   docker compose up -d --build
   ```
   - Rebuilds Docker images with the new code
   - Restarts all services (frontend, backend, database)
   - The `-d` flag runs containers in the background
   - The `--build` flag forces a rebuild even if images exist

#### What Gets Updated
- ✅ Frontend React code
- ✅ Backend Python code
- ✅ Dependencies (if `package.json` or `requirements.txt` changed)
- ✅ Database migrations (if you added them to the code)
- ❌ Database data (preserved)
- ❌ Environment variables (`.env` files are stashed/restored)

### Pre-Deployment Checklist
Before running `scripts/deploy.sh`, ensure:

1. ✅ **Code works locally**
   ```bash
   scripts/dev.sh
   # Test at http://localhost:5173
   ```

2. ✅ **All changes are committed**
   ```bash
   git status  # Should show "nothing to commit"
   ```

3. ✅ **You're on the correct branch**
   ```bash
   git branch  # Should show "* deploy-server"
   ```

4. ✅ **Database migrations are created** (if you changed models)
   ```bash
   docker compose exec yaw-backend python manage.py makemigrations
   git add backend/apps/*/migrations/
   git commit -m "Add migrations for model changes"
   ```

### Running the Deployment
```bash
scripts/deploy.sh
```

**Expected Output:**
```
🚀 Starting deployment flow...
📦 Pushing changes to origin/deploy-server...
🌐 Connecting to VPS: nishanaweb.cloud...
--- VPS: Navigating to project directory ---
--- VPS: Fetching latest changes from origin ---
--- VPS: Pulling latest changes from deploy-server ---
--- VPS: Restarting and rebuilding containers ---
✅ VPS: Deployment successful!
🎉 Deployment complete for branch deploy-server!
```

### Post-Deployment Verification
1. **Check the Live Site**
   - Open [https://yaw.nishanaweb.cloud/](https://yaw.nishanaweb.cloud/)
   - Verify your changes are visible

2. **Check Server Logs** (if something is wrong)
   ```bash
   ssh nishanaweb@nishanaweb.cloud "cd /home/nishanaweb/project/Illustration && docker compose logs -f"
   ```

3. **Run Migrations on Server** (if you added new models)
   ```bash
   ssh nishanaweb@nishanaweb.cloud "cd /home/nishanaweb/project/Illustration && docker compose exec yaw-backend python manage.py migrate"
   ```

### Troubleshooting Deployment

#### Issue: "Permission denied (publickey)"
**Solution:** Your SSH key is not configured. Contact the server administrator.

#### Issue: "Merge conflict" during `git pull`
**Solution:** The server has local changes conflicting with your code.
```bash
# SSH into server
ssh nishanaweb@nishanaweb.cloud

# Navigate to project
cd /home/nishanaweb/project/Illustration

# Force reset to match GitHub (DANGER: loses server-only changes)
git reset --hard origin/deploy-server

# Try deployment again
exit
scripts/deploy.sh
```

#### Issue: Containers won't start after deployment
**Solution:** Check logs for errors
```bash
ssh nishanaweb@nishanaweb.cloud "cd /home/nishanaweb/project/Illustration && docker compose logs yaw-frontend"
ssh nishanaweb@nishanaweb.cloud "cd /home/nishanaweb/project/Illustration && docker compose logs yaw-backend"
```

---

## 🚀 2. Deployment
### Phase 1: Pre-Flight Check
Before deploying, confirm it works locally.
1. Run `scripts/dev.sh`
2. Open http://localhost:5173 and check the Console (F12) for red errors.
3. If it works, proceed.

### Phase 2: Deploy to VPS
We use a single script to push code and update the server:
```bash
scripts/deploy.sh
```
This script will:
1. Push your local `deploy-server` branch to GitHub.
2. SSH into `yaw.nishanaweb.cloud`.
3. Pull the code.
4. Rebuild the containers on the server.

### Phase 3: Verification
- Open [https://yaw.nishanaweb.cloud/](https://yaw.nishanaweb.cloud/)
- Verify the update is live.
