# 🚀 本番サーバー設置・デプロイガイド
[**日本語**] | [**English**](../en/SERVER_INSTALLATION.md)

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

# フロントエンド ビルド引数 (Dockerビルドに必須)
VITE_API_URL=https://api.yourdomain.com/api
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_NAME="Yaw Illustration"
VITE_MEDIA_URL=https://api.yourdomain.com/media
VITE_STATIC_URL=https://api.yourdomain.com/static
```

> [!TIP]
> `frontend` ディレクトリ内には `.env.production` が存在しますが、Dockerビルド時（`.dockerignore`により）**無視されます**。これらの変数は必ずルートの `.env` で定義し、ビルド引数として渡す必要があります。
>
> **設定上の注意**: `docker-compose.yml` 側でこれらの引数を明示的に渡す設定が必要です：
> ```yaml
> build:
>   args:
>     - VITE_API_URL=${VITE_API_URL}
>     - VITE_MEDIA_URL=${VITE_MEDIA_URL}
>     # ... 他
> ```

### 2. バックエンドディレクトリ (`backend/.env`)
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
CORS_ALLOWED_ORIGINS_EXTRA=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# メール送信設定 (SMTP)
# 例: Google SMTP
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
SUPPORT_EMAIL=support@yourdomain.com
```

> [!NOTE]
> バックエンドコンテナは `backend/.env` を直接参照します。本番環境では `.env.local` という名前にはしないでください。

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

---
### 📍 ナビゲーション
- [**メイン README**](../../README_JP.md)
- [**セットアップガイド**](INSTALLATION.md)
- [**プロジェクト構造**](PROJECT_STRUCTURE.md)
- [**開発ガイド**](DEVELOPMENT.md)
