from rest_framework.routers import DefaultRouter

from .views import (
    AvailabilityBookingRequestViewSet,
    CamperVehicleViewSet,
    ExtraAccessoryViewSet,
    GeneralInquiryViewSet,
    TravelRouteTipViewSet,
)

router = DefaultRouter()
router.register("campers", CamperVehicleViewSet, basename="camper")
router.register("accessories", ExtraAccessoryViewSet, basename="accessory")
router.register("routes", TravelRouteTipViewSet, basename="route")
router.register("bookings", AvailabilityBookingRequestViewSet, basename="booking")
router.register("inquiries", GeneralInquiryViewSet, basename="inquiry")

urlpatterns = router.urls
