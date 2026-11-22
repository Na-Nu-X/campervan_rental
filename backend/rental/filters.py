import django_filters
from django.db.models import Q

from .models import CamperVehicle


class CamperVehicleFilter(django_filters.FilterSet):
    category = django_filters.MultipleChoiceFilter(choices=CamperVehicle.Category.choices)
    transmission = django_filters.ChoiceFilter(choices=CamperVehicle.Transmission.choices)
    min_berths = django_filters.NumberFilter(field_name="berths_sleeping", lookup_expr="gte")
    min_seats = django_filters.NumberFilter(field_name="seats_driving", lookup_expr="gte")
    max_price = django_filters.NumberFilter(method="filter_max_price")
    featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = CamperVehicle
        fields = ["category", "transmission", "min_berths", "min_seats", "max_price", "featured"]

    def filter_max_price(self, queryset, name, value):
        """Match campers whose cheapest (starting) daily rate fits the budget."""
        return queryset.filter(
            Q(low_season_price_eur__lte=value)
            | Q(mid_season_price_eur__lte=value)
            | Q(high_season_price_eur__lte=value)
        )
