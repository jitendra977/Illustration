from django.core.management.base import BaseCommand
from apps.illustrations.models import PartCategory, PartSubCategory
import hashlib


def create_slug(text):
    """Create a URL-safe slug from Japanese text using hash"""
    # For Japanese text, create a short hash-based slug
    text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()[:8]
    # Use first few characters of romanized approximation if possible
    safe_chars = ''.join(c for c in text if c.isalnum() and ord(c) < 128)
    if safe_chars:
        return f"{safe_chars[:20].lower()}-{text_hash}"
    return f"category-{text_hash}"


class Command(BaseCommand):
    help = '日本語のイラストトピック（カテゴリとサブカテゴリ）をデータベースに追加します'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('日本語のイラストトピックを追加中...'))

        # カテゴリとサブカテゴリのデータ
        categories_data = {
            'エンジン本体': {
                'order': 1,
                'description': 'エンジン本体の主要部品',
                'subcategories': [
                    'シリンダーブロック',
                    'シリンダーヘッド',
                    'クランクシャフト',
                    'ピストン',
                    'コンロッド',
                    'カムシャフト',
                    'バルブ機構',
                    'タイミングギア',
                    'フライホイール',
                    'オイルパン',
                ]
            },
            '冷却系統': {
                'order': 2,
                'description': 'エンジン冷却システム関連部品',
                'subcategories': [
                    'ウォーターポンプ',
                    'ラジエーター',
                    'サーモスタット',
                    'ファンベルト',
                    'クーリングファン',
                    'インタークーラー',
                    'ホース類',
                    'ウォータージャケット',
                ]
            },
            '潤滑系統': {
                'order': 3,
                'description': 'エンジンオイル循環システム',
                'subcategories': [
                    'オイルポンプ',
                    'オイルフィルター',
                    'オイルクーラー',
                    'オイルストレーナー',
                    'オイル配管',
                    'オイルレベルゲージ',
                ]
            },
            '燃料系統': {
                'order': 4,
                'description': '燃料供給システム',
                'subcategories': [
                    '燃料噴射ポンプ',
                    'インジェクター',
                    '燃料フィルター',
                    '燃料タンク',
                    '燃料配管',
                    'プライミングポンプ',
                    'コモンレール',
                    'サプライポンプ',
                ]
            },
            '吸排気系統': {
                'order': 5,
                'description': '吸気・排気システム',
                'subcategories': [
                    'エアクリーナー',
                    'インテークマニホールド',
                    'エキゾーストマニホールド',
                    'ターボチャージャー',
                    'マフラー',
                    'EGRバルブ',
                    'DPF（ディーゼル微粒子捕集フィルター）',
                    'エアダクト',
                ]
            },
            '電装系': {
                'order': 6,
                'description': '電気・電子部品',
                'subcategories': [
                    'スターターモーター',
                    'オルタネーター',
                    'バッテリー',
                    'グロープラグ',
                    'ECU（エンジンコントロールユニット）',
                    'センサー類',
                    'ワイヤーハーネス',
                    'リレー・ヒューズ',
                ]
            },
            '動力伝達系': {
                'order': 7,
                'description': 'トランスミッション・駆動系',
                'subcategories': [
                    'クラッチ',
                    'トランスミッション本体',
                    'プロペラシャフト',
                    'デファレンシャル',
                    'ドライブシャフト',
                    'トランスファー',
                    'PTO（パワーテイクオフ）',
                ]
            },
            'ブレーキ系統': {
                'order': 8,
                'description': '制動装置',
                'subcategories': [
                    'ブレーキマスターシリンダー',
                    'ブレーキキャリパー',
                    'ブレーキディスク',
                    'ブレーキパッド',
                    'ブレーキドラム',
                    'ブレーキシュー',
                    'エアブレーキバルブ',
                    'エアタンク',
                    'ABS装置',
                ]
            },
            'ステアリング系統': {
                'order': 9,
                'description': '操舵装置',
                'subcategories': [
                    'ステアリングギアボックス',
                    'パワーステアリングポンプ',
                    'ステアリングコラム',
                    'ステアリングホイール',
                    'タイロッド',
                    'ドラッグリンク',
                    'ナックルアーム',
                ]
            },
            'サスペンション': {
                'order': 10,
                'description': '懸架装置',
                'subcategories': [
                    'リーフスプリング',
                    'コイルスプリング',
                    'エアサスペンション',
                    'ショックアブソーバー',
                    'スタビライザー',
                    'トーションバー',
                ]
            },
            'キャビン・車体': {
                'order': 11,
                'description': '運転席・車体構造',
                'subcategories': [
                    'キャビンマウント',
                    'ダッシュボード',
                    'シート',
                    'ドア',
                    'ウィンドウ',
                    'ミラー',
                    'フレーム',
                    'バンパー',
                ]
            },
            '油圧系統': {
                'order': 12,
                'description': '油圧システム',
                'subcategories': [
                    '油圧ポンプ',
                    '油圧シリンダー',
                    '油圧バルブ',
                    '油圧ホース',
                    '油圧タンク',
                    '油圧フィルター',
                ]
            },
            '空調・暖房': {
                'order': 13,
                'description': 'エアコン・ヒーター',
                'subcategories': [
                    'エアコンコンプレッサー',
                    'エバポレーター',
                    'コンデンサー',
                    'ヒーターコア',
                    'ブロワーモーター',
                    'エアコンフィルター',
                ]
            },
            '灯火装置': {
                'order': 14,
                'description': 'ライト・ランプ類',
                'subcategories': [
                    'ヘッドライト',
                    'テールランプ',
                    'ウィンカー',
                    'フォグランプ',
                    'マーカーランプ',
                    '室内灯',
                ]
            },
            '計器・メーター': {
                'order': 15,
                'description': '計器類',
                'subcategories': [
                    'スピードメーター',
                    'タコメーター',
                    '燃料計',
                    '水温計',
                    '油圧計',
                    'エアゲージ',
                    'コンビネーションメーター',
                ]
            },
            '架装・特装': {
                'order': 16,
                'description': '特殊車両装備',
                'subcategories': [
                    'ダンプ装置',
                    'クレーン装置',
                    'ウイング装置',
                    '冷凍機',
                    'パッカー車装置',
                    'ミキサー装置',
                    'タンクローリー装置',
                ]
            },
        }

        created_categories = 0
        created_subcategories = 0

        for category_name, category_info in categories_data.items():
            # カテゴリを作成または取得
            category, created = PartCategory.objects.get_or_create(
                name=category_name,
                defaults={
                    'description': category_info.get('description', ''),
                    'slug': create_slug(category_name),
                    'order': category_info.get('order', 0)
                }
            )
            
            if created:
                created_categories += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ カテゴリ作成: {category_name}'))
            else:
                self.stdout.write(f'  - カテゴリ既存: {category_name}')

            # サブカテゴリを作成
            for idx, subcategory_name in enumerate(category_info.get('subcategories', []), start=1):
                subcategory, sub_created = PartSubCategory.objects.get_or_create(
                    part_category=category,
                    name=subcategory_name,
                    defaults={
                        'slug': create_slug(subcategory_name),
                        'order': idx
                    }
                )
                
                if sub_created:
                    created_subcategories += 1
                    self.stdout.write(f'    ✓ サブカテゴリ作成: {subcategory_name}')

        self.stdout.write(self.style.SUCCESS(f'\n完了！'))
        self.stdout.write(self.style.SUCCESS(f'作成されたカテゴリ: {created_categories}'))
        self.stdout.write(self.style.SUCCESS(f'作成されたサブカテゴリ: {created_subcategories}'))
        self.stdout.write(self.style.SUCCESS(f'合計カテゴリ数: {PartCategory.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'合計サブカテゴリ数: {PartSubCategory.objects.count()}'))
