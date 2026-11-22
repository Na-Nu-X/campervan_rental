from django.contrib import admin
from django.utils.html import format_html

from .models import (
    AvailabilityBookingRequest,
    CamperImage,
    CamperVehicle,
    ExtraAccessory,
    GeneralInquiry,
    TravelRouteTip,
)

admin.site.site_header = "Požičovňa karavanov – správa"
admin.site.site_title = "Správa požičovne"
admin.site.index_title = "Flotila, cenník a rezervácie"


class CamperImageInline(admin.TabularInline):
    model = CamperImage
    extra = 1
    fields = ("preview", "image_url", "caption", "display_order")
    readonly_fields = ("preview",)

    @admin.display(description="Náhľad")
    def preview(self, obj):
        if obj.pk and obj.image_url:
            return format_html('<img src="{}" style="height:56px;border-radius:6px" />', obj.image_url)
        return "—"


@admin.register(CamperVehicle)
class CamperVehicleAdmin(admin.ModelAdmin):
    list_display = (
        "name", "category", "transmission", "seats_driving", "berths_sleeping",
        "low_season_price_eur", "mid_season_price_eur", "high_season_price_eur",
        "badge", "is_featured", "display_order",
    )
    list_editable = ("is_featured", "display_order")
    list_filter = ("category", "transmission", "badge", "is_featured")
    search_fields = ("name", "engine_spec", "description")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [CamperImageInline]
    fieldsets = (
        ("Základné údaje", {"fields": ("name", "slug", "category", "badge", "description", "cover_image_url")}),
        ("Technické parametre", {"fields": (
            "seats_driving", "berths_sleeping", "transmission", "engine_spec",
            "length_meters", "weight_max_kg", "license_note",
        )}),
        ("Sezónny cenník a poplatky", {"fields": (
            "low_season_price_eur", "mid_season_price_eur", "high_season_price_eur",
            "service_prep_fee_eur", "security_deposit_eur",
        )}),
        ("Výbava v cene", {"fields": ("included_equipment",)}),
        ("Zobrazenie na webe", {"fields": ("is_featured", "display_order")}),
    )


@admin.register(ExtraAccessory)
class ExtraAccessoryAdmin(admin.ModelAdmin):
    list_display = ("name", "pricing_type", "price_eur", "icon_name", "display_order")
    list_editable = ("price_eur", "display_order")
    list_filter = ("pricing_type",)
    search_fields = ("name", "description")


@admin.register(TravelRouteTip)
class TravelRouteTipAdmin(admin.ModelAdmin):
    list_display = ("title", "region_label", "duration_days_label", "distance_km_label", "display_order")
    list_editable = ("display_order",)
    search_fields = ("title", "region_label", "summary")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(AvailabilityBookingRequest)
class AvailabilityBookingRequestAdmin(admin.ModelAdmin):
    list_display = (
        "client_name", "vehicle", "pickup_date", "return_date", "rental_days_display",
        "estimated_total_eur", "status", "created_at",
    )
    list_filter = ("status", "vehicle", "pickup_date")
    list_editable = ("status",)
    search_fields = ("client_name", "email", "phone", "destination_region")
    date_hierarchy = "pickup_date"
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Stav požiadavky", {"fields": ("status", "created_at")}),
        ("Termín a vozidlo", {"fields": ("vehicle", "pickup_date", "return_date", "destination_region")}),
        ("Cestujúci a výbava", {"fields": (
            "adults_count", "children_count", "selected_accessories", "estimated_total_eur",
        )}),
        ("Kontakt", {"fields": ("client_name", "email", "phone", "notes")}),
    )

    @admin.display(description="Počet dní")
    def rental_days_display(self, obj):
        return obj.rental_days


@admin.register(GeneralInquiry)
class GeneralInquiryAdmin(admin.ModelAdmin):
    list_display = ("client_name", "email", "phone", "is_resolved", "created_at")
    list_filter = ("is_resolved",)
    list_editable = ("is_resolved",)
    search_fields = ("client_name", "email", "message")
    readonly_fields = ("created_at",)
