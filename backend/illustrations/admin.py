from django.contrib import admin
from django.utils.html import format_html
from django.utils.text import Truncator
from django.urls import reverse
from django.db.models import Count
from django.contrib.auth import get_user_model
from .models import (
    Manufacturer, CarModel, EngineModel,
    PartCategory, PartSubCategory,
    Illustration, IllustrationFile
)

User = get_user_model()


# ==========================================
# Manufacturer Admin
# ==========================================
@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'engine_count', 'car_model_count', 'slug']
    search_fields = ['name', 'country']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['country']
    ordering = ['name']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            _car_model_count=Count('car_models', distinct=True),
            _engine_count=Count('engines', distinct=True)
        )
    
    def car_model_count(self, obj):
        return obj._car_model_count
    car_model_count.short_description = 'Car Models'
    car_model_count.admin_order_field = '_car_model_count'
    
    def engine_count(self, obj):
        return obj._engine_count
    engine_count.short_description = 'Engines'
    engine_count.admin_order_field = '_engine_count'


# ==========================================
# Engine Model Admin
# ==========================================
@admin.register(EngineModel)
class EngineModelAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'engine_code', 'manufacturer_link', 'fuel_type',
        'displacement', 'horsepower', 'torque',
        'car_model_count', 'illustration_count', 'slug'
    ]
    list_filter = ['manufacturer', 'fuel_type']
    search_fields = ['name', 'engine_code', 'manufacturer__name']
    readonly_fields = ['slug']
    raw_id_fields = ['manufacturer']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('manufacturer', 'name', 'engine_code', 'slug')
        }),
        ('Technical Specifications', {
            'fields': ('fuel_type', 'displacement', 'horsepower', 'torque')
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('manufacturer').annotate(
            _car_model_count=Count('car_models', distinct=True),
            _illustration_count=Count('illustrations', distinct=True)
        )
    
    def manufacturer_link(self, obj):
        url = reverse('admin:illustrations_manufacturer_change', args=[obj.manufacturer.id])
        return format_html('<a href="{}">{}</a>', url, obj.manufacturer.name)
    manufacturer_link.short_description = 'Manufacturer'
    manufacturer_link.admin_order_field = 'manufacturer__name'
    
    def car_model_count(self, obj):
        return obj._car_model_count
    car_model_count.short_description = 'Car Models'
    car_model_count.admin_order_field = '_car_model_count'
    
    def illustration_count(self, obj):
        return obj._illustration_count
    illustration_count.short_description = 'Illustrations'
    illustration_count.admin_order_field = '_illustration_count'


# ==========================================
# Car Model Admin
# ==========================================
@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'manufacturer_link', 'vehicle_type',
        'year_range', 'model_code', 'chassis_code',
        'engine_count', 'slug'
    ]
    list_filter = ['manufacturer', 'vehicle_type']
    search_fields = ['name', 'manufacturer__name', 'model_code', 'chassis_code']
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ['engines']
    raw_id_fields = ['manufacturer']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('manufacturer', 'name', 'slug')
        }),
        ('Classification', {
            'fields': ('vehicle_type',)
        }),
        ('Production Period', {
            'fields': ('year_from', 'year_to')
        }),
        ('Technical Details', {
            'fields': ('model_code', 'chassis_code')
        }),
        ('Engine Options', {
            'fields': ('engines',),
            'description': 'Select all engine options available for this car model'
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('manufacturer').annotate(
            _engine_count=Count('engines', distinct=True)
        )
    
    def manufacturer_link(self, obj):
        url = reverse('admin:illustrations_manufacturer_change', args=[obj.manufacturer.id])
        return format_html('<a href="{}">{}</a>', url, obj.manufacturer.name)
    manufacturer_link.short_description = 'Manufacturer'
    manufacturer_link.admin_order_field = 'manufacturer__name'
    
    def year_range(self, obj):
        if obj.year_from and obj.year_to:
            return f"{obj.year_from} - {obj.year_to}"
        elif obj.year_from:
            return f"{obj.year_from} - Present"
        return "-"
    year_range.short_description = 'Production Years'
    
    def engine_count(self, obj):
        return obj._engine_count
    engine_count.short_description = 'Engines'
    engine_count.admin_order_field = '_engine_count'


# ==========================================
# Part Category Admin (UPDATED - No engine_model field)
# ==========================================
@admin.register(PartCategory)
class PartCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'name_ja', 'order', 'subcategory_count', 
        'illustration_count', 'slug'
    ]
    list_display_links = ['name']  # Make name clickable
    list_editable = ['order']  # Allow quick reordering
    search_fields = ['name', 'name_ja', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'name_ja', 'slug', 'order')
        }),
        ('Details', {
            'fields': ('description',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            _subcategory_count=Count('subcategories', distinct=True),
            _illustration_count=Count('illustrations', distinct=True)
        )
    
    def subcategory_count(self, obj):
        return obj._subcategory_count
    subcategory_count.short_description = 'Subcategories'
    subcategory_count.admin_order_field = '_subcategory_count'
    
    def illustration_count(self, obj):
        count = obj._illustration_count
        if count > 0:
            url = f"/admin/illustrations/illustration/?part_category__id__exact={obj.id}"
            return format_html('<a href="{}">{}</a>', url, count)
        return count
    illustration_count.short_description = 'Illustrations'
    illustration_count.admin_order_field = '_illustration_count'


# ==========================================
# Part Subcategory Admin (UPDATED - No engine_model reference)
# ==========================================
@admin.register(PartSubCategory)
class PartSubCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'name_ja', 'part_category_link', 'order',
        'illustration_count', 'slug'
    ]
    list_display_links = ['name']  # Make name clickable
    list_editable = ['order']  # Allow quick reordering
    list_filter = ['part_category']
    search_fields = ['name', 'name_ja', 'description', 'part_category__name']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['part_category']
    ordering = ['part_category__order', 'order', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('part_category', 'name', 'name_ja', 'slug', 'order')
        }),
        ('Details', {
            'fields': ('description',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('part_category').annotate(
            _illustration_count=Count('illustrations', distinct=True)
        )
    
    def part_category_link(self, obj):
        url = reverse('admin:illustrations_partcategory_change', args=[obj.part_category.id])
        display = f"{obj.part_category.name}"
        if obj.part_category.name_ja:
            display += f" ({obj.part_category.name_ja})"
        return format_html('<a href="{}">{}</a>', url, display)
    part_category_link.short_description = 'Part Category'
    part_category_link.admin_order_field = 'part_category__name'
    
    def illustration_count(self, obj):
        count = obj._illustration_count
        if count > 0:
            url = f"/admin/illustrations/illustration/?part_subcategory__id__exact={obj.id}"
            return format_html('<a href="{}">{}</a>', url, count)
        return count
    illustration_count.short_description = 'Illustrations'
    illustration_count.admin_order_field = '_illustration_count'


# ==========================================
# Illustration File Inline
# ==========================================
class IllustrationFileInline(admin.TabularInline):
    model = IllustrationFile
    extra = 1
    fields = ['file', 'file_type', 'file_preview', 'uploaded_at']
    readonly_fields = ['file_type', 'uploaded_at', 'file_preview']
    
    def file_preview(self, obj):
        if obj.file:
            if obj.file_type == 'image':
                return format_html(
                    '<a href="{}" target="_blank"><img src="{}" style="max-height: 50px; max-width: 100px;" /></a>',
                    obj.file.url, obj.file.url
                )
            elif obj.file_type == 'pdf':
                return format_html(
                    '<a href="{}" target="_blank">📄 PDF</a>',
                    obj.file.url
                )
            else:
                return format_html(
                    '<a href="{}" target="_blank">📎 File</a>',
                    obj.file.url
                )
        return "-"
    file_preview.short_description = 'Preview'


# ==========================================
# Illustration Admin (UPDATED)
# ==========================================
@admin.register(Illustration)
class IllustrationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'user_display', 'engine_model_link', 
        'part_category_display', 'part_subcategory_display', 
        'car_model_count', 'file_count', 'created_at'
    ]
    list_filter = [
        'created_at',
        'engine_model__manufacturer',
        'engine_model',
        'part_category',
        'part_subcategory',
        'user'
    ]
    search_fields = [
        'title', 'description',
        'user__username', 'user__email',
        'engine_model__name', 'part_category__name',
        'part_category__name_ja'
    ]
    raw_id_fields = ['user', 'engine_model', 'part_category', 'part_subcategory']
    filter_horizontal = ['applicable_car_models']
    date_hierarchy = 'created_at'
    inlines = [IllustrationFileInline]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description')
        }),
        ('Classification', {
            'fields': ('engine_model', 'part_category', 'part_subcategory'),
            'description': 'Select the engine and universal part categories'
        }),
        ('Applicable Car Models', {
            'fields': ('applicable_car_models',),
            'description': 'Select car models where this part/illustration is applicable (optional)'
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related(
            'user', 
            'engine_model__manufacturer',
            'part_category',
            'part_subcategory__part_category'
        ).prefetch_related(
            'files',
            'applicable_car_models'
        ).annotate(
            _file_count=Count('files', distinct=True),
            _car_model_count=Count('applicable_car_models', distinct=True)
        )
    
    def user_display(self, obj):
        return f"{obj.user.username}"
    user_display.short_description = 'User'
    user_display.admin_order_field = 'user__username'
    
    def engine_model_link(self, obj):
        url = reverse('admin:illustrations_enginemodel_change', args=[obj.engine_model.id])
        return format_html('<a href="{}">{}</a>', url, obj.engine_model)
    engine_model_link.short_description = 'Engine Model'
    engine_model_link.admin_order_field = 'engine_model__name'
    
    def part_category_display(self, obj):
        url = reverse('admin:illustrations_partcategory_change', args=[obj.part_category.id])
        display = obj.part_category.name
        if obj.part_category.name_ja:
            display += f" ({obj.part_category.name_ja})"
        return format_html('<a href="{}">{}</a>', url, display)
    part_category_display.short_description = 'Part Category'
    part_category_display.admin_order_field = 'part_category__name'
    
    def part_subcategory_display(self, obj):
        if obj.part_subcategory:
            url = reverse('admin:illustrations_partsubcategory_change', args=[obj.part_subcategory.id])
            display = obj.part_subcategory.name
            if obj.part_subcategory.name_ja:
                display += f" ({obj.part_subcategory.name_ja})"
            return format_html('<a href="{}">{}</a>', url, display)
        return "-"
    part_subcategory_display.short_description = 'Part Subcategory'
    part_subcategory_display.admin_order_field = 'part_subcategory__name'
    
    def car_model_count(self, obj):
        return obj._car_model_count
    car_model_count.short_description = 'Car Models'
    car_model_count.admin_order_field = '_car_model_count'
    
    def file_count(self, obj):
        return obj._file_count
    file_count.short_description = 'Files'
    file_count.admin_order_field = '_file_count'


# ==========================================
# Illustration File Admin
# ==========================================
@admin.register(IllustrationFile)
class IllustrationFileAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'illustration_link', 'file_type',
        'user_display', 'file_preview', 'file_name', 'uploaded_at'
    ]
    list_filter = [
        'file_type',
        'uploaded_at',
        'illustration__engine_model__manufacturer',
        'illustration__engine_model'
    ]
    search_fields = [
        'illustration__title', 
        'illustration__user__username',
        'illustration__user__email'
    ]
    raw_id_fields = ['illustration']
    readonly_fields = ['file_type', 'uploaded_at', 'file_preview_large']
    date_hierarchy = 'uploaded_at'
    
    fieldsets = (
        ('File Information', {
            'fields': ('illustration', 'file', 'file_type', 'file_preview_large')
        }),
        ('Metadata', {
            'fields': ('uploaded_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related(
            'illustration__user',
            'illustration__engine_model__manufacturer',
            'illustration__part_category',
            'illustration__part_subcategory'
        )
    
    def illustration_link(self, obj):
        url = reverse('admin:illustrations_illustration_change', args=[obj.illustration.id])
        return format_html('<a href="{}">{}</a>', url, obj.illustration.title)
    illustration_link.short_description = 'Illustration'
    illustration_link.admin_order_field = 'illustration__title'
    
    def user_display(self, obj):
        return f"{obj.illustration.user.username}"
    user_display.short_description = 'User'
    user_display.admin_order_field = 'illustration__user__username'
    
    def file_name(self, obj):
        return obj.file.name.split('/')[-1]
    file_name.short_description = 'Filename'
    
    def file_preview(self, obj):
        if obj.file:
            if obj.file_type == 'image':
                return format_html(
                    '<a href="{}" target="_blank"><img src="{}" style="max-height: 40px; max-width: 60px;" /></a>',
                    obj.file.url, obj.file.url
                )
            elif obj.file_type == 'pdf':
                return format_html(
                    '<a href="{}" target="_blank">📄 PDF</a>',
                    obj.file.url
                )
            else:
                return format_html(
                    '<a href="{}" target="_blank">📎 View</a>',
                    obj.file.url
                )
        return "-"
    file_preview.short_description = 'Preview'
    
    def file_preview_large(self, obj):
        if obj.file:
            if obj.file_type == 'image':
                return format_html(
                    '<a href="{}" target="_blank"><img src="{}" style="max-width: 300px; max-height: 300px;" /></a>',
                    obj.file.url, obj.file.url
                )
            elif obj.file_type == 'pdf':
                return format_html(
                    '<a href="{}" target="_blank">📄 Open PDF</a>',
                    obj.file.url
                )
            else:
                return format_html(
                    '<a href="{}" target="_blank">📎 Open File</a>',
                    obj.file.url
                )
        return "-"
    file_preview_large.short_description = 'File Preview'