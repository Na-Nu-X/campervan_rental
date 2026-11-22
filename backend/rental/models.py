from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify


class UnicodeJSONEncoder(DjangoJSONEncoder):
    """Store JSON with real UTF-8 characters so Slovak diacritics stay searchable."""

    def __init__(self, *args, **kwargs):
        kwargs["ensure_ascii"] = False
        super().__init__(*args, **kwargs)


def unique_slugify(instance: models.Model, value: str, field_name: str = "slug") -> str:
    """Generate a slug from `value` that is unique for the instance's model."""
    base = slugify(value)[:200] or "item"
    slug = base
    model = type(instance)
    counter = 2
    while model.objects.filter(**{field_name: slug}).exclude(pk=instance.pk).exists():
        slug = f"{base}-{counter}"
        counter += 1
    return slug


class CamperVehicle(models.Model):
    class Category(models.TextChoices):
        SEMI_INTEGRATED = "polointegrovany", "Polointegrovaný karavan"
        INTEGRATED = "integrovany", "Luxusný integrovaný"
        ALCOVE = "alkovna", "Rodinná alkovňa"
        CAMPERVAN = "campervan", "Kompaktný Campervan (dodávka)"

    class Transmission(models.TextChoices):
        AUTOMATIC = "automat", "Automatická prevodovka"
        MANUAL = "manual", "Manuálna 6-st. prevodovka"

    class Badge(models.TextChoices):
        TOP_CHOICE = "top_volba", "Najobľúbenejší"
        NEW = "novinka", "Model 2026"
        AUTOMATIC = "automat", "Automat"
        FAMILY = "pre_rodiny", "Ideálny pre rodiny"
        NONE = "none", "Bez odznaku"

    name = models.CharField("Názov modelu", max_length=200)
    category = models.CharField("Kategória", max_length=20, choices=Category.choices)
    slug = models.SlugField("URL identifikátor", max_length=220, unique=True, blank=True)
    seats_driving = models.PositiveSmallIntegerField("Počet miest na jazdu", default=4)
    berths_sleeping = models.PositiveSmallIntegerField("Počet lôžok", default=4)
    transmission = models.CharField("Prevodovka", max_length=10, choices=Transmission.choices)
    engine_spec = models.CharField("Motor", max_length=120)
    length_meters = models.DecimalField("Dĺžka (m)", max_digits=4, decimal_places=2)
    weight_max_kg = models.PositiveIntegerField("Max. hmotnosť (kg)", default=3500)
    license_note = models.CharField(
        "Poznámka k vodičskému preukazu",
        max_length=160,
        default="Stačí vodičský preukaz sk. B (do 3,5 t)",
    )
    low_season_price_eur = models.DecimalField(
        "Cena mimosezóna (€ / deň)", max_digits=7, decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
        help_text="Október až Apríl",
    )
    mid_season_price_eur = models.DecimalField(
        "Cena stredná sezóna (€ / deň)", max_digits=7, decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
        help_text="Máj, Jún, September",
    )
    high_season_price_eur = models.DecimalField(
        "Cena hlavná sezóna (€ / deň)", max_digits=7, decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
        help_text="Júl a August",
    )
    service_prep_fee_eur = models.DecimalField(
        "Servisný poplatok (€)", max_digits=7, decimal_places=2, default=Decimal("95.00")
    )
    security_deposit_eur = models.DecimalField(
        "Vratná kaucia (€)", max_digits=8, decimal_places=2, default=Decimal("1200.00")
    )
    included_equipment = models.JSONField(
        "Výbava v cene", default=list, blank=True, encoder=UnicodeJSONEncoder,
        help_text='Zoznam položiek, napr. ["Markíza Thule 4,5 m", "Kúrenie Truma"]',
    )
    badge = models.CharField("Odznak", max_length=20, choices=Badge.choices, default=Badge.NONE)
    description = models.TextField("Popis", blank=True)
    cover_image_url = models.URLField("Titulný obrázok (URL)", max_length=500, blank=True)
    is_featured = models.BooleanField("Zobraziť na úvodnej stránke", default=False)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        verbose_name = "Karavan / obytné auto"
        verbose_name_plural = "Flotila karavanov a obytných áut"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slugify(self, self.name)
        super().save(*args, **kwargs)

    @property
    def starting_price_eur(self) -> Decimal:
        return min(self.low_season_price_eur, self.mid_season_price_eur, self.high_season_price_eur)


class CamperImage(models.Model):
    vehicle = models.ForeignKey(
        CamperVehicle, on_delete=models.CASCADE, related_name="images", verbose_name="Karavan"
    )
    image_url = models.URLField("Obrázok (URL)", max_length=500)
    caption = models.CharField("Popis fotografie", max_length=160, blank=True)
    display_order = models.PositiveIntegerField("Poradie", default=0)

    class Meta:
        verbose_name = "Fotografia karavanu"
        verbose_name_plural = "Fotogaléria karavanu"
        ordering = ["display_order", "id"]

    def __str__(self) -> str:
        return self.caption or f"Fotografia #{self.pk}"


class ExtraAccessory(models.Model):
    class PricingType(models.TextChoices):
        PER_DAY = "za_den", "Za deň prenájmu"
        PER_STAY = "za_pobyt", "Jednorazovo za celý pobyt"

    name = models.CharField("Názov", max_length=160, unique=True)
    pricing_type = models.CharField(
        "Spôsob účtovania", max_length=10, choices=PricingType.choices, default=PricingType.PER_DAY
    )
    price_eur = models.DecimalField(
        "Cena (€)", max_digits=7, decimal_places=2, validators=[MinValueValidator(Decimal("0"))]
    )
    description = models.TextField("Popis", blank=True)
    icon_name = models.CharField(
        "Ikona", max_length=40, blank=True,
        help_text="Identifikátor ikony vo frontende (bike, grill, bed, sup, wifi, shield)",
    )
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        verbose_name = "Doplnková výbava"
        verbose_name_plural = "Doplnková výbava na prenájom"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name


class TravelRouteTip(models.Model):
    title = models.CharField("Názov trasy", max_length=200)
    region_label = models.CharField("Región", max_length=120)
    duration_days_label = models.CharField("Dĺžka trvania", max_length=60)
    distance_km_label = models.CharField("Vzdialenosť", max_length=60)
    slug = models.SlugField("URL identifikátor", max_length=220, unique=True, blank=True)
    summary = models.TextField("Zhrnutie")
    highlights = models.JSONField("Najzaujímavejšie zastávky", default=list, blank=True, encoder=UnicodeJSONEncoder)
    cover_image_url = models.URLField("Titulný obrázok (URL)", max_length=500, blank=True)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        verbose_name = "Tip na trasu"
        verbose_name_plural = "Tipy na trasy karavanom"
        ordering = ["display_order", "title"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slugify(self, self.title)
        super().save(*args, **kwargs)


class AvailabilityBookingRequest(models.Model):
    class Status(models.TextChoices):
        NEW = "nova", "Nová požiadavka"
        OFFER_SENT = "ponuka_odoslana", "Ponuka odoslaná"
        BOOKED = "rezervovane", "Rezervované"
        CANCELLED = "zrusena", "Zrušená"

    vehicle = models.ForeignKey(
        CamperVehicle, on_delete=models.PROTECT, related_name="booking_requests",
        verbose_name="Karavan",
    )
    pickup_date = models.DateField("Dátum prevzatia")
    return_date = models.DateField("Dátum vrátenia")
    adults_count = models.PositiveSmallIntegerField("Počet dospelých", default=2)
    children_count = models.PositiveSmallIntegerField("Počet detí", default=0)
    selected_accessories = models.JSONField("Zvolená doplnková výbava", default=list, blank=True, encoder=UnicodeJSONEncoder)
    estimated_total_eur = models.DecimalField(
        "Odhadovaná cena (€)", max_digits=9, decimal_places=2, null=True, blank=True
    )
    destination_region = models.CharField("Cieľová destinácia", max_length=160, blank=True)
    client_name = models.CharField("Meno a priezvisko", max_length=160)
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=40)
    notes = models.TextField("Poznámka", blank=True)
    status = models.CharField("Stav", max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField("Vytvorené", auto_now_add=True)

    class Meta:
        verbose_name = "Rezervácia / overenie dostupnosti"
        verbose_name_plural = "Rezervácie a overenia dostupnosti"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.client_name} – {self.vehicle} ({self.pickup_date:%d.%m.%Y})"

    @property
    def rental_days(self) -> int:
        return max((self.return_date - self.pickup_date).days, 0)

    def clean(self):
        super().clean()
        if self.pickup_date and self.return_date and self.return_date <= self.pickup_date:
            raise ValidationError({"return_date": "Dátum vrátenia musí byť neskôr ako dátum prevzatia."})


class GeneralInquiry(models.Model):
    client_name = models.CharField("Meno a priezvisko", max_length=160)
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=40, blank=True)
    message = models.TextField("Správa")
    is_resolved = models.BooleanField("Vybavené", default=False)
    created_at = models.DateTimeField("Vytvorené", auto_now_add=True)

    class Meta:
        verbose_name = "Otázka / poradenstvo"
        verbose_name_plural = "Otázky a poradenstvo pred prvou cestou"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.client_name} ({self.created_at:%d.%m.%Y})"
