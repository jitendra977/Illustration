from django.contrib import admin
from django.utils.html import format_html
from django.utils.text import Truncator
from django.urls import reverse
from django.db.models import Count
from .models import (
    Manufacturer, CarModel, EngineModel,
    PartCategory, PartSubCategory,
    Illustration, IllustrationFile
)


# ==========================================
# Manufacturer Admin
# ==========================================
@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'car_model_count', 'slug']
    search_fields = ['name', 'country']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['country']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(_car_model_count=Count('carmodel'))
    
    def car_model_count(self, obj):
        return obj._car_model_count
    car_model_count.short_description = 'Car Models'
    car_model_count.admin_order_field = '_car_model_count'


# ==========================================
# Car Model Admin
# ==========================================
@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'manufacturer_link', 'engine_model_count', 'slug']
    list_filter = ['manufacturer']
    search_fields = ['name', 'manufacturer__name']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['manufacturer']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('manufacturer').annotate(
            _engine_model_count=Count('enginemodel')
        )
    
    def manufacturer_link(self, obj):
        url = reverse('admin:app_manufacturer_change', args=[obj.manufacturer.id])
        return format_html('<a href="{}">{}</a>', url, obj.manufacturer.name)
    manufacturer_link.short_description = 'Manufacturer'
    manufacturer_link.admin_order_field = 'manufacturer__name'
    
    def engine_model_count(self, obj):
        return obj._engine_model_count
    engine_model_count.short_description = 'Engine Models'
    engine_model_count.admin_order_field = '_engine_model_count'


# ==========================================
# Engine Model Admin
# ==========================================
@admin.register(EngineModel)
class EngineModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'car_model_link', 'manufacturer_name', 'part_category_count', 'slug']
    list_filter = ['car_model__manufacturer']
    search_fields = ['name', 'car_model__name', 'car_model__manufacturer__name']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['car_model']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related(
            'car_model__manufacturer'
        ).annotate(
            _part_category_count=Count('partcategory')
        )
    
    def car_model_link(self, obj):
        url = reverse('admin:app_carmodel_change', args=[obj.car_model.id])
        return format_html('<a href="{}">{}</a>', url, obj.car_model.name)
    car_model_link.short_description = 'Car Model'
    car_model_link.admin_order_field = 'car_model__name'
    
    def manufacturer_name(self, obj):
        return obj.car_model.manufacturer.name
    manufacturer_name.short_description = 'Manufacturer'
    manufacturer_name.admin_order_field = 'car_model__manufacturer__name'
    
    def part_category_count(self, obj):
        return obj._part_category_count
    part_category_count.short_description = 'Part Categories'
    part_category_count.admin_order_field = '_part_category_count'


# ==========================================
# Part Category Admin
# ==========================================
@admin.register(PartCategory)
class PartCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'engine_model_link', 'subcategory_count', 'illustration_count', 'slug']
    list_filter = ['engine_model']
    search_fields = ['name', 'engine_model__name']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['engine_model']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('engine_model').annotate(
            _subcategory_count=Count('partsubcategory'),
            _illustration_count=Count('illustration')
        )
    
    def engine_model_link(self, obj):
        url = reverse('admin:app_enginemodel_change', args=[obj.engine_model.id])
        return format_html('<a href="{}">{}</a>', url, obj.engine_model.name)
    engine_model_link.short_description = 'Engine Model'
    engine_model_link.admin_order_field = 'engine_model__name'
    
    def subcategory_count(self, obj):
        return obj._subcategory_count
    subcategory_count.short_description = 'Subcategories'
    subcategory_count.admin_order_field = '_subcategory_count'
    
    def illustration_count(self, obj):
        return obj._illustration_count
    illustration_count.short_description = 'Illustrations'
    illustration_count.admin_order_field = '_illustration_count'


# ==========================================
# Part Subcategory Admin
# ==========================================
@admin.register(PartSubCategory)
class PartSubCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'part_category_link', 'illustration_count', 'slug']
    list_filter = ['part_category']
    search_fields = ['name', 'part_category__name']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['part_category']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('part_category').annotate(
            _illustration_count=Count('illustration')
        )
    
    def part_category_link(self, obj):
        url = reverse('admin:app_partcategory_change', args=[obj.part_category.id])
        return format_html('<a href="{}">{}</a>', url, obj.part_category.name)
    part_category_link.short_description = 'Part Category'
    part_category_link.admin_order_field = 'part_category__name'
    
    def illustration_count(self, obj):
        return obj._illustration_count
    illustration_count.short_description = 'Illustrations'
    illustration_count.admin_order_field = '_illustration_count'


# ==========================================
# Illustration File Inline
# ==========================================
class IllustrationFileInline(admin.TabularInline):
    model = IllustrationFile
    extra = 1
    fields = ['file', 'file_preview', 'uploaded_at']
    readonly_fields = ['uploaded_at', 'file_preview']
    
    def file_preview(self, obj):
        if obj.file:
            if obj.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
                return format_html(
                    '<a href="{}" target="_blank"><img src="{}" style="max-height: 50px; max-width: 100px;" /></a>',
                    obj.file.url, obj.file.url
                )
            else:
                return format_html(
                    '<a href="{}" target="_blank">View File</a>',
                    obj.file.url
                )
        return "-"
    file_preview.short_description = 'Preview'


# ==========================================
# Illustration Admin
# ==========================================
@admin.register(Illustration)
class IllustrationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'user_link', 'engine_model_link', 
        'part_category_link', 'part_subcategory_link', 
        'file_count', 'created_at'
    ]
    list_filter = ['created_at', 'engine_model', 'part_category', 'part_subcategory', 'user']
    search_fields = ['title', 'description', 'user__username', 'user__email']
    raw_id_fields = ['user', 'engine_model', 'part_category', 'part_subcategory']
    date_hierarchy = 'created_at'
    inlines = [IllustrationFileInline]
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description')
        }),
        ('Classification', {
            'fields': ('engine_model', 'part_category', 'part_subcategory')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queries with select_related and annotate file count"""
        qs = super().get_queryset(request)
        return qs.select_related(
            'user', 
            'engine_model__car_model__manufacturer', 
            'part_category', 
            'part_subcategory'
        ).prefetch_related('files').annotate(
            _file_count=Count('files')
        )
    
    def user_link(self, obj):
        url = reverse('admin:auth_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__username'
    
    def engine_model_link(self, obj):
        url = reverse('admin:app_enginemodel_change', args=[obj.engine_model.id])
        return format_html('<a href="{}">{}</a>', url, obj.engine_model.name)
    engine_model_link.short_description = 'Engine Model'
    engine_model_link.admin_order_field = 'engine_model__name'
    
    def part_category_link(self, obj):
        url = reverse('admin:app_partcategory_change', args=[obj.part_category.id])
        return format_html('<a href="{}">{}</a>', url, obj.part_category.name)
    part_category_link.short_description = 'Part Category'
    part_category_link.admin_order_field = 'part_category__name'
    
    def part_subcategory_link(self, obj):
        if obj.part_subcategory:
            url = reverse('admin:app_partsubcategory_change', args=[obj.part_subcategory.id])
            return format_html('<a href="{}">{}</a>', url, obj.part_subcategory.name)
        return "-"
    part_subcategory_link.short_description = 'Part Subcategory'
    part_subcategory_link.admin_order_field = 'part_subcategory__name'
    
    def file_count(self, obj):
        return obj._file_count
    file_count.short_description = 'Files'
    file_count.admin_order_field = '_file_count'
    
    def description_short(self, obj):
        return Truncator(obj.description).chars(100)
    description_short.short_description = 'Description'


# ==========================================
# Illustration File Admin
# ==========================================
@admin.register(IllustrationFile)
class IllustrationFileAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'illustration_link', 'user_name', 
        'file_preview', 'file_name', 'uploaded_at'
    ]
    list_filter = ['uploaded_at', 'illustration__engine_model']
    search_fields = [
        'illustration__title', 
        'illustration__user__username',
        'illustration__user__email'
    ]
    raw_id_fields = ['illustration']
    readonly_fields = ['uploaded_at', 'file_preview_large']
    date_hierarchy = 'uploaded_at'
    
    def get_queryset(self, request):
        """Optimize queries with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related(
            'illustration__user',
            'illustration__engine_model__car_model__manufacturer',
            'illustration__part_category',
            'illustration__part_subcategory'
        )
    
    def illustration_link(self, obj):
        url = reverse('admin:app_illustration_change', args=[obj.illustration.id])
        return format_html('<a href="{}">{}</a>', url, obj.illustration.title)
    illustration_link.short_description = 'Illustration'
    illustration_link.admin_order_field = 'illustration__title'
    
    def user_name(self, obj):
        url = reverse('admin:auth_user_change', args=[obj.illustration.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.illustration.user.username)
    user_name.short_description = 'User'
    user_name.admin_order_field = 'illustration__user__username'
    
    def file_name(self, obj):
        return obj.file.name.split('/')[-1]
    file_name.short_description = 'Filename'
    
    def file_preview(self, obj):
        if obj.file:
            if obj.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
                return format_html(
                    '<a href="{}" target="_blank"><img src="{}" style="max-height: 40px; max-width: 60px;" /></a>',
                    obj.file.url, obj.file.url
                )
            else:
                return format_html(
                    '<a href="{}" target="_blank">📄 View</a>',
                    obj.file.url
                )
        return "-"
    file_preview.short_description = 'Preview'
    
    def file_preview_large(self, obj):
        if obj.file:
            if obj.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
                return format_html(
                    '<a href="{}" target="_blank"><img src="{}" style="max-width: 300px; max-height: 300px;" /></a>',
                    obj.file.url, obj.file.url
                )
            else:
                return format_html(
                    '<a href="{}" target="_blank">📄 Open File</a>',
                    obj.file.url
                )
        return "-"
    file_preview_large.short_description = 'File Preview'
    
    fieldsets = (
        ('File Information', {
            'fields': ('illustration', 'file', 'file_preview_large')
        }),
        ('Metadata', {
            'fields': ('uploaded_at',),
            'classes': ('collapse',)
        }),
    )