# システム詳細仕様書 (Detailed System Documentation)
[**日本語**] | [**English**](../en/SYSTEM_DOCUMENTATION.md)

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
    -   管理ファイル: `package.json` (依存関係), `vite.config.js` (ビルド設定), `nginx.conf` (内部Webサーバー)
    -   特徴: 高速なBunランタイムを使用し、ViteでビルドされたSPA。
    -   **内部Webサーバー**: フロントエンドコンテナは内部的にNginx (`frontend/nginx.conf`) を使用して静的ファイルを配信し、SPAルーティング（404エラーを `index.html` にリダイレクト）を処理します。また、`X-Frame-Options` や `X-Content-Type-Options` などのセキュリティヘッダーも適用します。
        > **注記**: これはDockerイメージ (`nginx:alpine`) に内包されているため、ホスト上への **Nginxの手動インストールは不要** です。
-   **設定ファイル**:
    ```text
    /opt/illustration-system/
    ├── .env                  <-- [1] ルート設定ファイル (DB接続 & フロントエンドビルド引数)
    ├── docker-compose.yml
    └── backend/
        └── .env              <-- [2] バックエンド設定ファイル (Django設定)
    ```


> 📝 **設定の詳細**: 環境変数の完全なテンプレートや詳細な設定手順については、サーバーインストールガイドの [**環境変数の設定**](../jp/SERVER_INSTALLATION.md#-3-環境変数の設定) セクションを参照してください。

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

-   **ホスティング環境**: Hostinger VPS (KVM 1)
-   **プロキシ管理**: **Nginx Proxy Manager (NPM)** を採用。SSL証明書（Let's Encrypt）の自動更新および各コンテナへの流量制御を管理。
-   **ハードウェア構成**:
    -   CPU: 1 Core
    -   メモリ: 4 GB
    -   ディスク: 50 GB NVMe
-   **OS**: Ubuntu 25.10 (Docker環境)
-   **ランタイム環境**:
    -   **Python**: 3.11-slim (軽量・高速なベースイメージ)
    -   **Bun**: 1.0 (Node.js互換の最新ランタイム)
    -   **Nginx**: Alpine版 (Webサーバ・リバースプロキシ)
-   **外部サービス/API**:
    -   Frontend URL: `https://yaw.nishanaweb.cloud`
    -   API URL: `https://api.yaw.nishanaweb.cloud`
    -   静的ファイル/メディア: Nginx経由で適切な権限チェックのもと配信。

### インフラ自動化 (`scripts/`)
運用の安定性を高めるため、以下の自動化用スクリプトが用意されています。
- **`deploy.sh`**: Gitのプル、ビルド、コンテナの再起動を一括実行。

## 4) ドキュメント・運用 (Documentation & Operations)

### セットアップ手順 (New Server)
詳細なセットアップ手順については、以下のガイドを参照してください。
👉 [**ローカルセットアップガイド (LOCAL_INSTALLATION.md)**](./LOCAL_INSTALLATION.md)

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
-   **アクティビティログ (Audit Trail)**: 「誰が」「いつ」「どこから(IP)」「何に対して」「どのような」操作を行ったかを全て自動的に記録。
    - **IP追跡**: 管理操作の実行場所をトラッキングし、不正アクセスの検知に活用。
    - **変更履歴**: データベースの各オブジェクトに対する変更内容を記録し、カタログ編集の変遷を追跡可能。
- **詳細なエラーログ**: 本番環境でのエラーを追跡用IDと共に記録。セキュリティを損なうことなく、迅速なデバッグを可能にします。

### 外部サービス・API連携 (External APIs)
システムを軽量かつセルフホスト可能にするため、外部サービスへの依存は最小限に抑えられています。
-   **UI Avatars (`ui-avatars.com`)**: ユーザーのプロフィール画像が未設定の場合、イニシャルを元にしたアバター画像を自動生成するために使用。
-   **SMTP サーバー**: システムからの通知メール送信に使用。環境変数で指定された任意のSMTPサーバーと連携可能。
-   **JSQR (ローカル利用)**: フロントエンドでのQRコード解析に使用していますが、外部サーバーとは通信せずブラウザ内で完結しています。

### インフラの隔離
-   **Dockerコンテナの隔離**: アプリケーション、データベース、Webサーバが個別のコンテナとして独立しており、ホストOSや他サービスへの影響を最小化する設計になっています。

---
### 📍 ナビゲーション
- [**メイン README**](../../README_JP.md)
- [**ローカルセットアップガイド**](LOCAL_INSTALLATION.md)
- [**プロジェクト構造**](PROJECT_STRUCTURE.md)
- [**開発ガイド**](DEVELOPMENT.md)
