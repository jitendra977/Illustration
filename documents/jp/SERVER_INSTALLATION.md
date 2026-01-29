# 🚀 本番サーバー設置・デプロイガイド

このドキュメントは、**Illustration System** を本番環境（Ubuntu/Linux VPS）にデプロイし、Docker と Nginx Proxy Manager (NPM) を利用して運用するためのプロフェッショナルな手順書です。

---

## 📋 1. 前提条件
サーバーに以下のツールがインストールされていることを確認してください：
-   **Docker Engine** (v20.10+)
-   **Docker Compose** (v2.0+)
-   **Git**

---

## 📂 2. インフラの準備

### A) リポジトリの取得
```bash
git clone https://github.com/jitendra977/Illustration.git /opt/illustration-system
cd /opt/illustration-system
```

### B) ディレクトリ権限の設定
メディアディレクトリがDockerコンテナから書き込み可能であることを確認します：
```bash
mkdir -p backend/media
chmod -R 777 backend/media
```

---

## 🔑 3. 環境変数の設定
以下の **3つ** の `.env` ファイルを作成する必要があります。

### 1. ルートディレクトリ (`.env`)
```env
# データベース接続情報
DB_NAME=yaw_db
DB_USER=yaw_admin
DB_PASSWORD=セキュアなパスワード
DB_ROOT_PASSWORD=セキュアなルートパスワード
DB_HOST=mysql_db
DB_PORT=3306

# 管理者初期設定
DJANGO_SUPERUSER_USERNAME=admin
```

### 2. バックエンドディレクトリ (`backend/.env.local`)
```env
# セキュリティ設定
SECRET_KEY=ランダムな長い文字列
DEBUG=False

# 管理者ログイン情報
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@yourdomain.com
DJANGO_SUPERUSER_PASSWORD=DBパスワードと一致させる

# ドメイン設定
ALLOWED_HOSTS_EXTRA=api.yourdomain.com,yourdomain.com
CSRF_TRUSTED_ORIGINS_EXTRA=https://api.yourdomain.com,https://yourdomain.com
```

### 3. フロントエンドディレクトリ (`frontend/.env.local`)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME="Yaw Illustration"
```

---

## 🚢 4. デプロイの実行

### コンテナの起動
本番用設定でバックグラウンド実行します：
```bash
docker compose up -d --build
```

### データベースの初期化
マイグレーションを実行し、初期管理ユーザーを作成します：
```bash
docker compose exec yaw-backend python manage.py migrate
docker compose exec yaw-backend python manage.py createsuperuser --noinput
```

---

## 🌍 5. リバースプロキシの設定 (Nginx Proxy Manager)
**Nginx Proxy Manager (NPM)** を使用する場合の推奨設定：

1.  **フロントエンド プロキシ**:
    -   Domain: `yourdomain.com`
    -   Scheme: `http`
    -   Forward Host: `サーバーのIP`
    -   Forward Port: `5173` (またはマッピングしたポート)
2.  **バックエンド プロキシ**:
    -   Domain: `api.yourdomain.com`
    -   Scheme: `http`
    -   Forward Host: `サーバーのIP`
    -   Forward Port: `8000`

> [!IMPORTANT]
> **SSL (Let's Encrypt)** を有効にし、**Websockets Support** をオンにしてください。

---

## ✅ 6. 動作確認
-   **ヘルスチェック**: `https://api.yourdomain.com/health/` を開く
-   **管理画面**: `https://api.yourdomain.com/admin/` にログイン
-   **メインアプリ**: `https://yourdomain.com` にアクセス

---

## 🛠 メンテナンス
-   **更新**: `git pull && docker compose up -d --build`
-   **ログの確認**: `docker compose logs -f`
-   **バックアップ**: `docker exec mysql_db mysqldump -u root -p yaw_db > backup.sql`
