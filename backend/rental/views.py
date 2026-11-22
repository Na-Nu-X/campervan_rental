from rest_framework import mixins, viewsets

from .filters import CamperVehicleFilter
from .models import (
    AvailabilityBookingRequest,
    CamperVehicle,
    ExtraAccessory,
    GeneralInquiry,
    TravelRouteTip,
)
from .serializers import (
    AvailabilityBookingRequestSerializer,
    CamperVehicleDetailSerializer,
    CamperVehicleListSerializer,
    ExtraAccessorySerializer,
    GeneralInquirySerializer,
    TravelRouteTipSerializer,
)


class CamperVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CamperVehicle.objects.prefetch_related("images")
    lookup_field = "slug"
    filterset_class = CamperVehicleFilter
    search_fields = ("name", "engine_spec", "description", "included_equipment")
    ordering_fields = (
        "low_season_price_eur", "mid_season_price_eur", "high_season_price_eur",
        "berths_sleeping", "seats_driving", "length_meters", "display_order", "name",
    )
    ordering = ("display_order", "name")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CamperVehicleDetailSerializer
        return CamperVehicleListSerializer


class ExtraAccessoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExtraAccessory.objects.all()
    serializer_class = ExtraAccessorySerializer
    filterset_fields = ("pricing_type",)


class TravelRouteTipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TravelRouteTip.objects.all()
    serializer_class = TravelRouteTipSerializer
    lookup_field = "slug"


class AvailabilityBookingRequestViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = AvailabilityBookingRequest.objects.all()
    serializer_class = AvailabilityBookingRequestSerializer


class GeneralInquiryViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = GeneralInquiry.objects.all()
    serializer_class = GeneralInquirySerializer
