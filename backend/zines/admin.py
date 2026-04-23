from django.contrib import admin
from .models import Zine, ZineCell


class ZineCellInline(admin.TabularInline):
    model = ZineCell
    extra = 0
    fields = ['cell_key', 'image_url', 'text_content', 'bg_color', 'text_color']


@admin.register(Zine)
class ZineAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'is_public', 'created_at', 'slug']
    list_filter = ['is_public', 'created_at']
    search_fields = ['title', 'owner__username']
    prepopulated_fields = {}
    readonly_fields = ['slug', 'created_at', 'updated_at']
    inlines = [ZineCellInline]


@admin.register(ZineCell)
class ZineCellAdmin(admin.ModelAdmin):
    list_display = ['zine', 'cell_key', 'bg_color']
    list_filter = ['cell_key']
    search_fields = ['zine__title']
