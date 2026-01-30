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
以下の **2つ** の `.env` ファイルを特定の場所に作成する必要があります。

### 📂 設定ファイル構造
サーバー上のファイル配置が以下のようになっていることを確認してください：
```text
/opt/illustration-system/
├── .env                  <-- [1] ルート設定ファイル (DB接続 & フロントエンドビルド引数)
├── docker-compose.yml
├── backend/
│   ├── .env              <-- [2] バックエンド設定ファイル (Django設定)
│   └── ...
└── frontend/
    └── .env.production   <-- [削除推奨] (サーバー上では不要)
```

以下のテンプレートを使用してください：

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
SECURE_SSL_REDIRECT=False  # 重要: 内部SSLリダイレクトを無効化 (NginxがSSLを処理するため)

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
> バックエンドコンテナは主に `backend/.env` を参照します。`settings.py` は `.env.local` が存在する場合に優先的に読み込むよう構成されているため、ローカル開発でのみ設定を上書きしたい場合に利用してください。

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
**Nginx Proxy Manager (NPM)** を使用すると、SSL化とルーティングが容易になります。以下の **2つ** のプロキシホストを設定してください。

### A. バックエンド用 プロキシホスト (API)
APIへの直接アクセスや管理画面へのアクセスを処理します。
-   **Domain Names**: `api.yourdomain.com`
-   **Scheme**: `http`
-   **Forward Hostname / IP**: `yaw-backend` (またはサーバーIP)
-   **Forward Port**: `8000`
-   **SSL**: 新しい Let's Encrypt 証明書を取得 (Force SSL, HTTP/2 Support を有効化)。

### B. フロントエンド用 プロキシホスト (メインサイト)
Reactアプリケーションを表示し、CORSエラーやメソッドエラーを防ぐためにAPIリクエストを転送します。
-   **Domain Names**: `yourdomain.com`
-   **Scheme**: `http`
-   **Forward Hostname / IP**: `yaw-frontend` (またはサーバーIP)
-   **Forward Port**: `80`
-   **SSL**: 新しい Let's Encrypt 証明書を取得 (Force SSL, HTTP/2 Support を有効化)。

#### ⚠️ 重要: フロントエンドのカスタムロケーション設定
**フロントエンド用プロキシホスト**の **"Custom Locations"** タブに、以下の設定を**必ず**追加してください。これにより、相対パスでのAPIリクエスト（`/api/...`）がバックエンドコンテナに正しくルーティングされます。

**Location**: `/api/`
-   **Scheme**: `http`
-   **Forward Host**: `yaw-backend`
-   **Forward Port**: `8000`
-   **歯車アイコン (詳細設定)**:
    ```nginx
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    ```

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
