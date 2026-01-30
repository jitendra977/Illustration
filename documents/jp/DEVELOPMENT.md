# 📘 YAW イラストレーションシステム - 開発ガイド
[**日本語**] | [**English**](../en/DEVELOPMENT.md)

このガイドには、アプリケーションの実行、テスト、開発のための「ミスのない」ワークフローが含まれています。

> [!IMPORTANT]
> 初回セットアップと環境変数の設定については、[**ローカルセットアップガイド**](./LOCAL_INSTALLATION.md)を参照してください。

## ⚡ クイックスクリプト (チートシート)

| 目的 | コマンド | 説明 |
| :--- | :--- | :--- |
| **起動 / 再起動** | `scripts/dev.sh` | 安全な日常の再起動。 |
| **エラーの完全修復** | `scripts/dev.sh --nuclear` | ディープクリーン。ボリュームとモジュールを削除。 |
| **VPS へのデプロイ** | `scripts/deploy.sh` | コードをプッシュし、サーバーを自動更新。 |
| **ログの表示** | `docker compose logs -f` | ライブサーバーの出力を表示。 |

---

## 🛠 1. ローカル開発
### 標準的な起動
アプリケーションを通常通り起動するには：
```bash
scripts/dev.sh
```
- フロントエンド: [http://localhost:5173](http://localhost:5173)
- バックエンド: [http://localhost:8000](http://localhost:8000)

### アップデートの処理 (ミスのない方法)
ファイルが変更されたときに「Invalid Hook Call」エラーを避けるために、以下の表に従ってください。

| 変更したもの... | 行うべき操作... |
| :--- | :--- |
| **React コード** (`.jsx`, `.css`) | **不要。** ブラウザは自動的に更新されます。 |
| **package.json** (新しいライブラリ) | **再ビルド必須。** `scripts/dev.sh --nuclear` を実行。 |
| **Python コード** (`views.py`) | **不要。** サーバーは自動的にリロードされます。 |
| **DB モデル** | **後述の「データベースの変更」セクションを参照** |

---

## 🗄️ 2. データベースモデルの変更
Django モデルを変更した場合は、マイグレーションを作成して適用する必要があります。

### 手順
1. **モデルを編集する** (`backend/apps/*/models.py`)
2. **マイグレーションファイルを作成する**:
   ```bash
   docker compose -f docker-compose.local.yml exec yaw-backend python manage.py makemigrations
   ```
3. **マイグレーションを適用する**:
   ```bash
   docker compose -f docker-compose.local.yml exec yaw-backend python manage.py migrate
   ```

---

## 🚀 3. VPS へのデプロイ
`scripts/deploy.sh` を使用して、サーバーを自動更新します。

```bash
# 1. ローカルで動作確認
# 2. mainブランチにいることを確認
# 3. デプロイスクリプトを実行
scripts/deploy.sh
```

デプロイ後、[https://yaw.nishanaweb.cloud/](https://yaw.nishanaweb.cloud/) で変更が反映されているか確認してください。

---
### 📍 ナビゲーション
- [**メイン README**](../../README_JP.md)
- [**ローカルセットアップガイド**](LOCAL_INSTALLATION.md)
- [**プロジェクト構造**](PROJECT_STRUCTURE.md)
- [**サーバーデプロイ**](SERVER_INSTALLATION.md)
