# 🛠 ローカル環境構築・セットアップガイド
[**日本語**] | [**English**](../en/LOCAL_INSTALLATION.md)

Dockerがインストールされた環境（Local Mac/Windows/Linux、またはクラウドVPS）で **Illustration System** をゼロからセットアップするための手順です。

---

## 📋 1. 前提条件
以下がインストールされていることを確認してください：
-   **Docker** (v20.10+)
-   **Docker Compose** (v2.0+)
-   **Git**

---

## 📂 2. コードの取得
```bash
git clone https://github.com/jitendra977/Illustration.git
cd Illustration
```

---

## 🔑 3. 環境変数の設定
セキュリティと柔軟性を確保するため、システムは3つのレベルで設定を行います。

### A) ルートオーケストレーション (`.env`)
プロジェクトのルートに `.env` という名前のファイルを作成します。このファイルはデータベースの資格情報を管理します。

```env
# MySQL データベース設定
DB_NAME=yaw_illustration
DB_USER=nishanaweb
DB_ROOT_PASSWORD=your_secure_root_password
DB_PASSWORD=your_secure_user_password
DB_HOST=mysql_db
DB_PORT=3306
DB_ENGINE=django.db.backends.mysql

# デフォルト設定
DJANGO_SUPERUSER_USERNAME=admin
```

### B) バックエンド設定 (`backend/.env.local`)
アプリケーションレベルの動作を設定するために `backend/.env.local` を作成します。

```env
# Django コア設定
SECRET_KEY=generate-a-random-secure-string
DEBUG=True

# 管理者ユーザー自動セットアップ
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your_secure_password_match_db_password

# ドメイン設定 (カンマ区切り)
ALLOWED_HOSTS_EXTRA=your-domain.com,api.your-domain.com
CSRF_TRUSTED_ORIGINS_EXTRA=https://your-domain.com,https://api.your-domain.com
```

### C) フロントエンド設定 (`frontend/.env.local`)
UIからAPIを参照するために `frontend/.env.local` を作成します。

```env
# API 接続設定
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="YAW Illustration"
```
> [!TIP]
> 本番環境（VPS）では、`localhost:8000` を実際のAPIドメイン（例：`https://api.your-domain.com/api`）に置き換えてください。

---

## 🚀 4. システムの起動

### ローカル開発環境の場合
ホットリロードとコンソールアクセスが可能な、開発向けスタックを実行します：
```bash
docker compose -f docker-compose.local.yml up --build
```

### 本番環境 / VPS の場合
安定した本番向けスタックを実行します：
```bash
docker compose up -d --build
```

---

## ✅ 5. セットアップ後の確認

1.  **UIにアクセス**: `http://localhost:5173`（ローカル）または設定したドメインを開きます。
2.  **管理画面にアクセス**: `http://localhost:8000/admin/` を確認します。
3.  **ログイン**: `backend/.env.local` で定義した管理者資格情報を使用します。

---

## 📝 トラブルシューティング
- **Database Access Denied**: ルートの `.env` 内の `DB_PASSWORD` が `DJANGO_SUPERUSER_PASSWORD` と一致しているか確認してください。初回起動後にパスワードを変更した場合は、ボリュームをリセットする必要があります：
  ```bash
  docker compose -f docker-compose.local.yml down -v
  ```
- **CSRF エラー**: バックエンド設定の `CSRF_TRUSTED_ORIGINS_EXTRA` が正しいか再度確認してください。

---
### 📍 ナビゲーション
- [**メイン README**](../../README_JP.md)
- [**プロジェクト構造**](PROJECT_STRUCTURE.md)
- [**開発ガイド**](DEVELOPMENT.md)
- [**サーバーデプロイ**](SERVER_INSTALLATION.md)
