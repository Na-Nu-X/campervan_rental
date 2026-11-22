from datetime import date

from rest_framework import serializers

from .models import (
    AvailabilityBookingRequest,
    CamperImage,
    CamperVehicle,
    ExtraAccessory,
    GeneralInquiry,
    TravelRouteTip,
)


class CamperImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CamperImage
        fields = ("id", "image_url", "caption", "display_order")


class CamperVehicleListSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    transmission_label = serializers.CharField(source="get_transmission_display", read_only=True)
    badge_label = serializers.CharField(source="get_badge_display", read_only=True)
    starting_price_eur = serializers.DecimalField(max_digits=7, decimal_places=2, read_only=True)

    class Meta:
        model = CamperVehicle
        fields = (
            "id", "name", "slug", "category", "category_label",
            "seats_driving", "berths_sleeping", "transmission", "transmission_label",
            "engine_spec", "length_meters", "weight_max_kg", "license_note",
            "low_season_price_eur", "mid_season_price_eur", "high_season_price_eur",
            "starting_price_eur", "service_prep_fee_eur", "security_deposit_eur",
            "badge", "badge_label", "cover_image_url", "is_featured", "display_order",
        )


class CamperVehicleDetailSerializer(CamperVehicleListSerializer):
    images = CamperImageSerializer(many=True, read_only=True)

    class Meta(CamperVehicleListSerializer.Meta):
        fields = CamperVehicleListSerializer.Meta.fields + (
            "description", "included_equipment", "images",
        )


class ExtraAccessorySerializer(serializers.ModelSerializer):
    pricing_type_label = serializers.CharField(source="get_pricing_type_display", read_only=True)

    class Meta:
        model = ExtraAccessory
        fields = (
            "id", "name", "pricing_type", "pricing_type_label", "price_eur",
            "description", "icon_name", "display_order",
        )


class TravelRouteTipSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelRouteTip
        fields = (
            "id", "title", "slug", "region_label", "duration_days_label",
            "distance_km_label", "summary", "highlights", "cover_image_url", "display_order",
        )


class AvailabilityBookingRequestSerializer(serializers.ModelSerializer):
    vehicle = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=CamperVehicle.objects.all(),
        error_messages={
            "does_not_exist": "Zvolený karavan neexistuje.",
            "required": "Vyberte prosím karavan.",
        },
    )
    selected_accessories = serializers.ListField(
        child=serializers.CharField(max_length=160), required=False, allow_empty=True
    )

    class Meta:
        model = AvailabilityBookingRequest
        fields = (
            "id", "vehicle", "pickup_date", "return_date", "adults_count", "children_count",
            "selected_accessories", "estimated_total_eur", "destination_region",
            "client_name", "email", "phone", "notes", "status", "created_at",
        )
        read_only_fields = ("id", "status", "created_at")
        extra_kwargs = {
            "client_name": {"error_messages": {"blank": "Zadajte prosím vaše meno."}},
            "email": {"error_messages": {"invalid": "Zadajte platnú e-mailovú adresu."}},
            "phone": {"error_messages": {"blank": "Zadajte prosím telefónne číslo."}},
        }

    def validate_pickup_date(self, value: date) -> date:
        if value < date.today():
            raise serializers.ValidationError("Dátum prevzatia nemôže byť v minulosti.")
        return value

    def validate_adults_count(self, value: int) -> int:
        if value < 1:
            raise serializers.ValidationError("Cestovať musí aspoň jedna dospelá osoba.")
        return value

    def validate_selected_accessories(self, value: list[str]) -> list[str]:
        known = set(ExtraAccessory.objects.values_list("name", flat=True))
        unknown = [name for name in value if name not in known]
        if unknown:
            raise serializers.ValidationError(f"Neznáma doplnková výbava: {', '.join(unknown)}.")
        return value

    def validate(self, attrs):
        pickup = attrs.get("pickup_date")
        ret = attrs.get("return_date")
        if pickup and ret and ret <= pickup:
            raise serializers.ValidationError(
                {"return_date": "Dátum vrátenia musí byť neskôr ako dátum prevzatia."}
            )
        vehicle = attrs.get("vehicle")
        travellers = attrs.get("adults_count", 2) + attrs.get("children_count", 0)
        if vehicle and travellers > vehicle.seats_driving:
            raise serializers.ValidationError({
                "children_count": (
                    f"Maximálny počet cestujúcich vo vozidle {vehicle.name} je {vehicle.seats_driving}. "
                    "Znížte prosím počet cestujúcich alebo zvoľte väčší karavan."
                )
            })
        return attrs


class GeneralInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralInquiry
        fields = ("id", "client_name", "email", "phone", "message", "created_at")
        read_only_fields = ("id", "created_at")
        extra_kwargs = {
            "client_name": {"error_messages": {"blank": "Zadajte prosím vaše meno."}},
            "email": {"error_messages": {"invalid": "Zadajte platnú e-mailovú adresu."}},
            "message": {"error_messages": {"blank": "Napíšte nám prosím vašu otázku."}},
        }

    def validate_message(self, value: str) -> str:
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Správa je príliš krátka (min. 10 znakov).")
        return value.strip()
