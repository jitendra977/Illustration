# バックエンドディレクトリ構造 (`/backend`)

バックエンドは、API、データ管理、およびビジネスロジックを担当する **Django REST Framework (DRF)** アプリケーションです。

---

## 🌳 ファイルツリー
```text
backend/
├── apps/               # コアビジネスロジックモジュール
│   ├── accounts/       # ユーザー、ロール、アクティビティログ管理
│   │   ├── migrations/ # データベーススキーマ履歴
│   │   ├── utils/      # 共通ユーティリティ (例: activity_logger.py)
│   │   ├── admin.py    # Django 管理画面設定
│   │   ├── models.py   # データベースモデル
│   │   ├── serializers.py # API データ形式定義
│   │   ├── urls.py     # アカウント固有のルーティング
│   │   └── views.py    # リクエスト処理ロジック
│   ├── illustrations/  # 車両およびイラストデータの中核
│   │   ├── signals.py  # 自動ファイルライフサイクル管理
│   │   └── (標準的なDRFファイル)
│   └── __init__.py
├── config/             # システム構成
│   ├── settings.py     # メインプロジェクト設定（パラメータ化済み）
│   ├── urls.py         # メイン URL ルーター
│   ├── views.py        # ベース/ヘルスチェックビュー
│   ├── wsgi.py         # Web Server Gateway Interface
│   └── asgi.py         # Asynchronous Server Gateway Interface
├── scripts/            # バックエンドユーティリティスクリプト
│   ├── link_engines.py # DB 投入ロジック
│   └── generate_schema_pdf.py # テクニカルドローイングユーティリティ
├── media/              # ローカルに保存されたユーザーアップロード（イラスト/プロファイル）
├── staticfiles/        # ビルド済み静的アセット（管理画面スタイルなど）
├── Dockerfile          # 本番環境用コンテナ定義
├── Dockerfile.dev      # ホットリロード対応の開発用コンテナ定義
├── entrypoint.sh       # コンテナ起動およびマイグレーションスクリプト
├── manage.py           # Django コマンドラインユーティリティ
└── requirements.txt    # Python 依存関係
```

---

## 📦 主要コンポーネント

### 1. アカウントとセキュリティ (`/apps/accounts`)
- **アクティビティログ**: すべての主要なアクション（作成、更新、削除）は `activity_logger.py` を介して追跡されます。
- **ロール管理**: 管理者、メーカー、および一般ユーザー向けのカスタム権限ロジック。

### 2. イラストの中核 (`/apps/illustrations`)
- **ファイル管理**: `signals.py` により、データベースからイラストレコードが削除されると、`/media` 内の物理ファイルも自動的に削除されます。

### 3. 設定 (`/config/settings.py`)
- **パラメータ化**: 環境変数から `ALLOWED_HOSTS` や `CORS_ORIGINS` を読み取るように特別に構成されており、同じコードをローカルとクラウドの両方で変更なしに実行できます。
