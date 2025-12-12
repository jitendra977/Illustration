from django.core.management.base import BaseCommand
from illustrations.models import Manufacturer
from django.utils.text import slugify


# Japanese → English name map for slug
NAME_MAP = {
    "日野": "hino",
    "ニッサン": "nissan",
    "三菱": "mitsubishi",
    "トヨタ": "toyota",
    "いすゞ": "isuzu",
    "ＵＤトラックス": "ud-trucks",
    "ﾆｯｻﾝﾃﾞｨｰｾﾞﾙ": "nissan-diesel",
    "ニッサンＭＩ": "nissan-mi",
    "マツダ": "mazda",
    "ホンダ": "honda",
}


class Command(BaseCommand):
    help = "Create sample manufacturer data"

    def handle(self, *args, **kwargs):
        data = [
            "日野",
            "ニッサン",
            "三菱",
            "トヨタ",
            "いすゞ",
            "ＵＤトラックス",
            "ﾆｯｻﾝﾃﾞｨｰｾﾞﾙ",
            "ニッサンＭＩ",
            "マツダ",
            "ホンダ"
        ]

        for jp_name in data:
            english_slug = NAME_MAP.get(jp_name, slugify(jp_name))

            Manufacturer.objects.get_or_create(
                name=jp_name,
                defaults={
                    "country": "Japan",
                    "slug": english_slug
                }
            )

        self.stdout.write(self.style.SUCCESS("Sample manufacturers created successfully!"))