# プロジェクトディレクトリ構造の概要
[**日本語**] | [**English**](../en/PROJECT_STRUCTURE.md)

これは **Illustration System** プロジェクトのハイレベルなロードマップです。

> [!TIP]
> **はじめての方へ** 
> 初回のセットアップについては、[**セットアップガイド**](INSTALLATION.md) または [**サーバーデプロイガイド**](SERVER_INSTALLATION.md)を参照してください。

---

## 🔭 メインプロジェクトレイアウト

### 🐍 [バックエンド (Django)](../../backend/STRUCTURE.md)
REST API、データベースモデル、および管理ロジックが含まれます。
- **パス**: `/backend`
- **詳細**: [backend/STRUCTURE.md](../../backend/STRUCTURE.md) を参照

### ⚛️ [フロントエンド (React)](../../frontend/STRUCTURE.md)
ユーザーインターフェース、ルーティング、およびデザインシステムが含まれます。
- **パス**: `/frontend`
- **詳細**: [frontend/STRUCTURE.md](../../frontend/STRUCTURE.md) を参照

### 🛠️ [インフラとスクリプト](../../scripts/)
デプロイとローカルセットアップのための自動化ツール。
- **パス**: `/scripts`
- **主要ファイル**: `deploy.sh`, `dev.sh`, `fix-deployment.sh`

---

## 📄 構成ファイル

-   `INSTALLATION.md` - **セットアップガイド。**
-   `SYSTEM_DOCUMENTATION.md` - 技術概要。
-   `DEVELOPMENT.md` - ローカルセットアップと貢献ガイド。

---

## 📝 設計原則
1. **クラウドネイティブ**: すべての構成は環境変数を介してパラメータ化されています。
2. **モジュール化**: フロントエンドとバックエンドは分離されており、独立して拡張可能です。
3. **セキュリティ第一**: 機密情報は `.env` ファイルで管理され、コミットされることはありません。

---
### 📍 ナビゲーション
- [**メイン README**](../../README_JP.md)
- [**セットアップガイド**](INSTALLATION.md)
- [**開発ガイド**](DEVELOPMENT.md)
- [**サーバーデプロイ**](SERVER_INSTALLATION.md)
