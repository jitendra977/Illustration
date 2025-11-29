from django.contrib import admin
from .models import Manufacturer, CarModel, EngineModel, PartCategory, PartSubCategory, Illustration, IllustrationFile


@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {"slug": ("name",)}


@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'manufacturer', 'slug')
    list_filter = ('manufacturer',)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(EngineModel)
class EngineModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'car_model', 'slug')
    list_filter = ('car_model',)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(PartCategory)
class PartCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_car_model', 'engine_model', 'slug')
    list_filter = ('engine_model',)
    prepopulated_fields = {"slug": ("name",)}

    def get_car_model(self, obj):
        return obj.engine_model.car_model
    get_car_model.short_description = 'Car Model'


@admin.register(PartSubCategory)
class PartSubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'part_category',)
    list_filter = ('part_category',)
    prepopulated_fields = {"slug": ("name",)}


class IllustrationFileInline(admin.TabularInline):
    model = IllustrationFile
    extra = 1


@admin.register(Illustration)
class IllustrationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'engine_model', 'part_category', 'part_subcategory', 'created_at')
    list_filter = ('engine_model', 'part_category', 'user')
    search_fields = ('title', 'user__username')
    inlines = [IllustrationFileInline]