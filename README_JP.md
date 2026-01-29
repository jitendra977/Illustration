# 🚜 YAW イラストレーションシステム

**Django REST Framework** と **React (Vite)** で構築された、包括的な自動車イラスト管理システムです。**Docker** によって完全にコンテナ化されています。

---

## 📖 ドキュメントハブ
すべてのプロジェクトドキュメントは [**`documents/`**](./documents/) ディレクトリに集約されています。

### 🚀 はじめに
-   **[セットアップガイド](./documents/jp/INSTALLATION.md)** - ローカル設定（Docker, .env）。
-   **[サーバーデプロイ](./documents/jp/SERVER_INSTALLATION.md)** - 本番VPS設定 & NPM。
-   **[開発ガイド](./documents/jp/DEVELOPMENT.md)** - 日常的なワークフロー。

### 📐 仕様と構造
-   **[プロジェクト構造](./documents/jp/PROJECT_STRUCTURE.md)** - 詳細なファイルマップ。
-   **[システム詳細仕様書](./documents/jp/SYSTEM_DOCUMENTATION.md)** - 日本語版テクニカルドキュメント。

---

## 🛠 技術スタック

| コンポーネント | テクノロジー |
| :--- | :--- |
| **バックエンド** | Python 3.11, Django 4.x, Django REST Framework |
| **フロントエンド** | React 18, Vite, Bun 1.0, Material UI (MUI) |
| **データベース** | MySQL 8.0 |
| **オーケストレーション** | Docker, Docker Compose |
| **リバースプロキシ** | Nginx Proxy Manager (NPM) |

---

## 🏗 主な機能
-   **車両カタログ管理**: メーカー、モデル、エンジンの構造化データ。
-   **イラスト管理**: Django シグナルによる自動ファイルクリーンアップ機能を備えた画像・PDF管理。
-   **ロールベースのアクセス制御 (RBAC)**: 管理者、メーカー、閲覧者向けのきめ細かな権限設定。
-   **監査トレイル**: システムにとって重要なすべての操作を自動的に記録するアクティビティログ。
-   **レスポンシブデザイン**: デスクトップとモバイルの両方に最適化された、モダンでグラスモーフィックな UI。

---

## 🤝 貢献
プルリクエストを送信する前に、[**開発ガイド**](./documents/jp/DEVELOPMENT.md)を参照してください。すべてのコードは `main` ブランチにあります。

---

## 📄 ライセンス
© 2026 YAW Illustration System. All rights reserved.
