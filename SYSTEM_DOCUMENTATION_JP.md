# システム詳細仕様書 (Detailed System Documentation)

本ドキュメントは、株式会社のDX推進課からの具体的な4つの質問に対する回答として作成されました。

---

## 1) ソースコード (Source Code)

システムは「フロントエンド」と「バックエンド」の2つの主要コンポーネントで構成されており、Dockerによって統合管理されています。

-   **公式リポジトリ**: [GitHub - jitendra977/Illustration](https://github.com/jitendra977/Illustration)
-   **バックエンド (Django/Python)**:
    -   ディレクトリ: `/backend`
    -   管理ファイル: `requirements.txt` (ライブラリ構成), `entrypoint.sh` (起動スクリプト)
    -   特徴: 自動化されたRESTful API (Django Rest Framework) を提供。
-   **フロントエンド (React/Bun)**:
    -   ディレクトリ: `/frontend`
    -   管理ファイル: `package.json` (依存関係), `vite.config.js` (ビルド設定)
    -   特徴: 高速なBunランタイムを使用し、ViteでビルドされたSPA。
-   **設定ファイル**:
    -   各ディレクトリの `.env`: 環境変数（DB接続、API通信先など）を保持。
    -   `/docker-compose.yml`: システム全体のコンテナオーケストレーションを定義。

#### バックエンド .env 例 (Backend Example)
```env
DEBUG=False
SECRET_KEY=your-secret-key
DB_ENGINE=django.db.backends.mysql
DB_NAME=illustration_db
DB_USER=root
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=3306
FRONTEND_URL=https://your-frontend-domain.com
```

#### フロントエンド .env 例 (Frontend Example)
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME="Yaw Illustration"
VITE_ENV=production
```

## 2) データベース情報 (Database Information)

**MySQL 8.0** を中核としたリレーショナルデータベース構成です。

-   **主なテーブル構造**:
    1.  **組織・ユーザー系**:
        -   `Factory`: 店舗/工場ユニットの管理。
        -   `User`: ユーザー情報。
        -   `Role`: 詳細な権限設定（管理者、編集者、閲覧者など）。
    2.  **車両・カタログ系**:
        -   `Manufacturer`: メーカー情報（日野、いすゞ、トヨタ等）。
        -   `CarModel`: 車種、型式、年式情報。
        -   `EngineModel`: エンジン型式、燃料タイプ。
    3.  **イラスト・コンテンツ系**:
        -   `PartCategory` / `PartSubCategory`: 部品分類の体系。
        -   `Illustration`: 車種・エンジンに対応するイラストの主データ。
        -   `IllustrationFile`: 画像やPDFの実データへの参照。
    4.  **運用・ログ系**:
        -   `ActivityLog`: 各ユーザーの操作履歴（誰が何をしたか）を記録。
        -   `Comment`: ユーザーからのフィードバックと5段階評価。

## 3) インフラ・環境の詳細 (Infrastructure & Environment)

安定性とスケーラビリティを考慮し、Dockerコンテナ環境を採用しています。

-   **ホスティング**: Hostinger VPS
-   **ランタイム環境**:
    -   **Python**: 3.11-slim (軽量・高速なベースイメージ)
    -   **Bun**: 1.0 (Node.js互換の最新ランタイム)
    -   **Nginx**: Alpine版 (Webサーバ・リバースプロキシ)
-   **外部サービス/API**:
    -   Frontend URL: `https://yaw.nishanaweb.cloud`
    -   API URL: `https://api.yaw.nishanaweb.cloud`
    -   静的ファイル/メディア: Nginx経由でセキュアに配信。

## 4) ドキュメント・運用 (Documentation & Operations)

### セットアップ手順 (New Server)
1.  **環境準備**: Docker および Docker Compose をサーバーにインストール。
2.  **コード取得**: 弊社リポジトリよりクローン。
3.  **設定**: `.env` ファイルにDB接続情報やAPIキーを設定。
4.  **起動**: `docker-compose up -d --build` を実行。
5.  **初期化**: `docker exec` を使用し、DBマイグレーションと管理者ユーザー作成を実行。

### 管理権限
-   **システム管理**: `https://api.yaw.nishanaweb.cloud/admin/` より全データの管理が可能。
-   **暫定ログイン情報**: セキュリティ保護のため、具体的なID/パスワードは別添または直接お伝えします。

### 機能概要
-   部品イラストの検索（メーカー・車種・エンジン・カテゴリ別）。
    -   イラストのPDF/画像表示・ダウンロード。
    -   管理者による車両・カテゴリマスタの編集。
---

## 5) セキュリティ機能 (Security Features)

本システムは、企業の機密情報を扱うため、複数の層で強固なセキュリティ対策を講じています。

### 認証と認可
-   **JWT (JSON Web Token) 認証**: セッションレスでセキュアな認証方式を採用。アクセストークンの短寿命化とリフレッシュトークンの回転（Rotation）により、万が一の漏洩リスクを最小限に抑えています。
-   **詳細な権限管理 (RBAC)**: 単なる管理者/ユーザーの区別だけでなく、機能ごとに細分化された権限ビット（カタログ編集、ユーザー管理、イラスト閲覧等）を役割（Role）に割り当てています。

### データ保護と防護
-   **Django セキュリティ・ガード**: クロスサイトスクリプティング (XSS)、クロスサイトリクエストフォージェリ (CSRF)、SQLインジェクションに対する標準的な防護策を全て適応。
-   **通信の保護 (SSL/HSTS)**: 常時SSL通信を前提とし、HSTS (HTTP Strict Transport Security) を有効化することで、中間者攻撃を防止。
-   **CORS/Allowed Hosts 設定**: 許可されたドメイン以外からのAPIアクセスを厳格に制限。

### 監査と透明性
-   **アクティビティログ (Audit Trail)**: 「誰が」「いつ」「どこから(IP)」「何に対して」「どのような」操作を行ったかを全て自動的に記録。不正アクセスの早期発見や操作ミスの追跡が可能です。

### インフラの隔離
-   **Dockerコンテナの隔離**: アプリケーション、データベース、Webサーバが個別のコンテナとして独立しており、ホストOSや他サービスへの影響を最小化する設計になっています。
