"""
Idempotent seed command: `python manage.py seed_data`.

Creates or updates the demo fleet, accessories and route guides. Records are
matched by their natural key (slug / name), so running it repeatedly never
creates duplicates. Use `--reset` to wipe catalogue data first.
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from rental.models import CamperImage, CamperVehicle, ExtraAccessory, TravelRouteTip


def unsplash(photo_id: str, width: int = 1600) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={width}&q=80"


BASE_EQUIPMENT = [
    "Nezávislé kúrenie a ohrev vody Truma",
    "Plne vybavená kuchynka a riad",
    "Kempingový stôl a 4 stoličky",
    "Slovenská diaľničná známka",
    "Cúvacia kamera a Apple CarPlay / Android Auto",
]

CAMPERS = [
    {
        "slug": "sunlight-t68-adventure-edition",
        "name": "Sunlight T68 Adventure Edition (Polointegrovaný)",
        "category": CamperVehicle.Category.SEMI_INTEGRATED,
        "seats_driving": 4, "berths_sleeping": 4,
        "transmission": CamperVehicle.Transmission.MANUAL,
        "engine_spec": "Fiat Ducato 2.2 MultiJet • 140 HP",
        "length_meters": Decimal("6.99"),
        "low_season_price_eur": Decimal("115.00"),
        "mid_season_price_eur": Decimal("145.00"),
        "high_season_price_eur": Decimal("175.00"),
        "badge": CamperVehicle.Badge.TOP_CHOICE,
        "is_featured": True,
        "description": (
            "Najobľúbenejší karavan našej flotily pre páry aj menšie rodiny. Polointegrovaná "
            "karoséria spája jednoduché riadenie dodávky s priestorom skutočného obytného auta. "
            "Pozdĺžne postele v zadnej časti, sklápacie lôžko nad jedálenským kútom a priestorná "
            "garáž na bicykle či SUP – pripravený na Alpy aj Jadran."
        ),
        "cover": "1626680114529-3f6ffa002b80",
        "gallery": [
            ("1626680114529-3f6ffa002b80", "Exteriér v kempe"),
            ("1629222247198-00b164054719", "Bočný pohľad s otvorenými dverami"),
            ("1789043551317-048afedffa8e", "Priestranný jedálenský kút"),
            ("1785184949143-112301fcd809", "Spálňa v zadnej časti"),
        ],
        "extra_equipment": [
            "Markíza Thule 4,5 m",
            "Veľká chladnička s mrazničkou",
            "Solárny panel + nadstavbová batéria",
            "Garáž na bicykle a športovú výbavu",
        ],
    },
    {
        "slug": "hymer-b-class-modern-comfort-i-680",
        "name": "Hymer B-Class ModernComfort I 680 (Luxusný integrovaný)",
        "category": CamperVehicle.Category.INTEGRATED,
        "seats_driving": 4, "berths_sleeping": 4,
        "transmission": CamperVehicle.Transmission.AUTOMATIC,
        "engine_spec": "Mercedes-Benz Sprinter • 170 HP Automat",
        "length_meters": Decimal("7.40"),
        "low_season_price_eur": Decimal("159.00"),
        "mid_season_price_eur": Decimal("195.00"),
        "high_season_price_eur": Decimal("239.00"),
        "service_prep_fee_eur": Decimal("125.00"),
        "security_deposit_eur": Decimal("1800.00"),
        "badge": CamperVehicle.Badge.NEW,
        "is_featured": True,
        "description": (
            "Prémiový integrovaný karavan s panoramatickým čelným sklom, ktoré premení každú "
            "cestu na zážitok. Spúšťacie lôžko nad kabínou, oddelená sprcha, podlahové kúrenie "
            "a 9-stupňová automatická prevodovka Mercedes-Benz. Luxus hotelovej izby s výhľadom, "
            "ktorý si vyberiete sami."
        ),
        "cover": "1513311068348-19c8fbdc0bb6",
        "gallery": [
            ("1513311068348-19c8fbdc0bb6", "Exteriér pod hviezdami"),
            ("1775641080262-1a4e3978a4b5", "Na ceste k ďalšiemu dobrodružstvu"),
            ("1789043549866-ea7ff893df9f", "Obývací priestor s veľkými oknami"),
            ("1773123441753-e87f821ec76d", "Kuchynský kút a kúpeľňa"),
        ],
        "extra_equipment": [
            "Markíza Thule 4,5 m",
            "Veľká chladnička s mrazničkou (142 l)",
            "Solárny panel + lítiová batéria 200 Ah",
            "Podlahové kúrenie Alde",
            "Satelitná anténa a Smart TV",
        ],
    },
    {
        "slug": "weinsberg-carabus-600-mq",
        "name": "Weinsberg CaraBus 600 MQ (Kompaktný Campervan)",
        "category": CamperVehicle.Category.CAMPERVAN,
        "seats_driving": 4, "berths_sleeping": 2,
        "transmission": CamperVehicle.Transmission.MANUAL,
        "engine_spec": "Fiat Ducato 2.2 MultiJet • 140 HP",
        "length_meters": Decimal("5.99"),
        "low_season_price_eur": Decimal("95.00"),
        "mid_season_price_eur": Decimal("125.00"),
        "high_season_price_eur": Decimal("149.00"),
        "service_prep_fee_eur": Decimal("85.00"),
        "security_deposit_eur": Decimal("1000.00"),
        "badge": CamperVehicle.Badge.NONE,
        "is_featured": False,
        "description": (
            "Kompaktná obytná dodávka, s ktorou zaparkujete v historickom centre aj na úzkej "
            "horskej ceste. Priečna posteľ, kuchynka s dvojplatničkou a kompresorovou chladničkou "
            "a kúpeľňa s WC. Ideálna voľba pre dvoch, ktorí chcú cestovať pružne a úsporne."
        ),
        "cover": "1766083639110-ec7c4ad90490",
        "gallery": [
            ("1766083639110-ec7c4ad90490", "Večer v kempe"),
            ("1780886661843-abc65352bd01", "Kemping v lese"),
            ("1793996217219-5d8a93cfbcbb", "Exteriér so strešným nosičom"),
            ("1783731127141-b159143d5828", "Útulná spálňa"),
        ],
        "extra_equipment": [
            "Markíza Thule 3,5 m",
            "Kompresorová chladnička 90 l",
            "Kúpeľňa so sprchou a kazetovým WC",
        ],
    },
    {
        "slug": "dethleffs-trend-a-7877-2",
        "name": "Dethleffs Trend A 7877-2 (Rodinná alkovňa pre 6 osôb)",
        "category": CamperVehicle.Category.ALCOVE,
        "seats_driving": 6, "berths_sleeping": 6,
        "transmission": CamperVehicle.Transmission.MANUAL,
        "engine_spec": "Fiat Ducato 2.3 MultiJet • 160 HP",
        "length_meters": Decimal("7.41"),
        "low_season_price_eur": Decimal("129.00"),
        "mid_season_price_eur": Decimal("165.00"),
        "high_season_price_eur": Decimal("199.00"),
        "service_prep_fee_eur": Decimal("110.00"),
        "security_deposit_eur": Decimal("1500.00"),
        "badge": CamperVehicle.Badge.FAMILY,
        "is_featured": True,
        "description": (
            "Rodinná klasika so 6 miestami na jazdu aj na spanie. Veľká alkovňa nad kabínou "
            "je obľúbeným „detským hniezdom“, poschodové postele vzadu a priestranná dinetka "
            "ponúkajú dosť miesta aj počas daždivého dňa. Najlepší pomer ceny a priestoru."
        ),
        "cover": "1596470693312-9a3686a0af0f",
        "gallery": [
            ("1596470693312-9a3686a0af0f", "Exteriér na ceste"),
            ("1596470689751-54f9687c1b7f", "Zastávka v lese"),
            ("1597327190279-43b91807c7a5", "Západ slnka v prírode"),
            ("1789043551317-048afedffa8e", "Priestranný jedálenský kút"),
        ],
        "extra_equipment": [
            "Markíza Thule 5 m",
            "Veľká chladnička s mrazničkou",
            "Poschodové postele s bezpečnostnou sieťkou",
            "Isofix úchyty pre 2 detské sedačky",
            "Solárny panel + nadstavbová batéria",
        ],
    },
    {
        "slug": "vw-california-ocean-4x4",
        "name": "VW California Ocean 4×4 (Automat)",
        "category": CamperVehicle.Category.CAMPERVAN,
        "seats_driving": 4, "berths_sleeping": 4,
        "transmission": CamperVehicle.Transmission.AUTOMATIC,
        "engine_spec": "VW 2.0 TDI 4MOTION • 204 HP DSG",
        "length_meters": Decimal("4.90"),
        "weight_max_kg": 3200,
        "low_season_price_eur": Decimal("119.00"),
        "mid_season_price_eur": Decimal("155.00"),
        "high_season_price_eur": Decimal("189.00"),
        "service_prep_fee_eur": Decimal("85.00"),
        "security_deposit_eur": Decimal("1500.00"),
        "badge": CamperVehicle.Badge.AUTOMATIC,
        "is_featured": True,
        "description": (
            "Legenda medzi campervanmi s pohonom všetkých kolies a automatickou prevodovkou DSG. "
            "Výklopná strecha so zvýšeným lôžkom, dvojplatnička, chladnička a skrinky – všetko "
            "v aute, ktoré sa zmestí do bežnej garáže. Pre tých, ktorí chcú ísť aj tam, kde "
            "asfalt končí."
        ),
        "cover": "1594495894542-a46cc73e081a",
        "gallery": [
            ("1594495894542-a46cc73e081a", "Exteriér v horách"),
            ("1527786356703-4b100091cd2c", "Výklopná strecha pri mori"),
            ("1561361513-2d000a50f0dc", "Na pláži"),
            ("1625492995811-646c41068abe", "Ranný kemping v lese"),
        ],
        "extra_equipment": [
            "Výklopná strecha so lôžkom",
            "Bočná markíza 2,5 m",
            "Kompresorová chladnička 42 l",
            "Pohon všetkých kolies 4MOTION",
        ],
    },
    {
        "slug": "knaus-boxlife-600-me",
        "name": "Knaus BoxLife 600 ME (Pre páry a aktívnych športovcov)",
        "category": CamperVehicle.Category.CAMPERVAN,
        "seats_driving": 4, "berths_sleeping": 2,
        "transmission": CamperVehicle.Transmission.AUTOMATIC,
        "engine_spec": "Fiat Ducato 2.2 MultiJet • 180 HP Automat",
        "length_meters": Decimal("5.99"),
        "low_season_price_eur": Decimal("109.00"),
        "mid_season_price_eur": Decimal("139.00"),
        "high_season_price_eur": Decimal("165.00"),
        "badge": CamperVehicle.Badge.NEW,
        "is_featured": False,
        "description": (
            "Obytná dodávka pre páry, ktoré milujú bicykle, lezenie či skialpy. Pozdĺžne "
            "jednolôžka sa dajú spojiť do veľkej postele, pod nimi sa skrýva garáž pre dva "
            "bicykle. Automatická prevodovka robí z každej horskej serpentíny radosť."
        ),
        "cover": "1576793048000-494aaa93d160",
        "gallery": [
            ("1576793048000-494aaa93d160", "Exteriér na horskej ceste"),
            ("1780886661843-abc65352bd01", "Večer v kempe"),
            ("1783731127141-b159143d5828", "Pozdĺžne lôžka v zadnej časti"),
            ("1769888772959-b91e4340c617", "Výhľad z okna"),
        ],
        "extra_equipment": [
            "Markíza Thule 3,5 m",
            "Kompresorová chladnička 90 l",
            "Garáž na 2 bicykle",
            "Solárny panel + nadstavbová batéria",
        ],
    },
]

ACCESSORIES = [
    {
        "name": "Nosič na 4 bicykle / elektrobicykle",
        "pricing_type": ExtraAccessory.PricingType.PER_STAY,
        "price_eur": Decimal("49.00"),
        "description": "Nosič Thule s nosnosťou až 60 kg, vhodný aj pre elektrobicykle. Montáž pri odovzdaní zdarma.",
        "icon_name": "bike",
    },
    {
        "name": "Prenosný plynový gril Weber",
        "pricing_type": ExtraAccessory.PricingType.PER_STAY,
        "price_eur": Decimal("35.00"),
        "description": "Kompaktný gril Weber Q s náhradnou kartušou – večere pri západe slnka bez kompromisov.",
        "icon_name": "grill",
    },
    {
        "name": "Sada posteľnej bielizne a uterákov (pre 4 osoby)",
        "pricing_type": ExtraAccessory.PricingType.PER_STAY,
        "price_eur": Decimal("45.00"),
        "description": "Čistá bavlnená posteľná bielizeň, prikrývky, vankúše a osušky pre celú posádku.",
        "icon_name": "bed",
    },
    {
        "name": "Nafukovací paddleboard (SUP)",
        "pricing_type": ExtraAccessory.PricingType.PER_DAY,
        "price_eur": Decimal("12.00"),
        "description": "Stabilný SUP s pádlom, pumpou a vodotesným vakom. Ideálny na alpské jazerá aj Jadran.",
        "icon_name": "sup",
    },
    {
        "name": "5G Wi-Fi router s neobmedzenými dátami v EÚ",
        "pricing_type": ExtraAccessory.PricingType.PER_DAY,
        "price_eur": Decimal("6.00"),
        "description": "Rýchly internet pre celú posádku vo všetkých krajinách EÚ – na navigáciu, streaming aj prácu.",
        "icon_name": "wifi",
    },
    {
        "name": "Zníženie spoluúčasti havarijného poistenia",
        "pricing_type": ExtraAccessory.PricingType.PER_DAY,
        "price_eur": Decimal("18.00"),
        "description": "Zníži vašu spoluúčasť pri poistnej udalosti z 1 200 € na 300 €. Cestujte úplne bez starostí.",
        "icon_name": "shield",
    },
]

ROUTES = [
    {
        "slug": "slovinsko-julske-alpy-a-jadranske-pobrezie",
        "title": "Slovinsko, Julské Alpy a Jadranské pobrežie (10 dní)",
        "region_label": "Slovinsko & Chorvátsko",
        "duration_days_label": "10 dní",
        "distance_km_label": "≈ 1 450 km",
        "summary": (
            "Smaragdová Soča, jazerá Bled a Bohinj, horský priechod Vršič a na záver "
            "slnko na polostrove Istria. Slovinsko je k obytným autám mimoriadne priateľské – "
            "kvalitné kempy, krátke presuny a nádherná príroda na každom kroku."
        ),
        "highlights": [
            "Jazero Bled a ostrovček s kostolom",
            "Horský priechod Vršič (1 611 m n. m.)",
            "Údolie rieky Soča a kaňon Tolmin",
            "Piran a Rovinj pri západe slnka",
        ],
        "cover": "1501785888041-af3ef285b470",
    },
    {
        "slug": "norsko-a-najkrajsie-fjordy-karavanom",
        "title": "Nórsko a najkrajšie fjordy karavanom (14 dní)",
        "region_label": "Nórsko",
        "duration_days_label": "14 dní",
        "distance_km_label": "≈ 4 200 km",
        "summary": (
            "Cesta snov každého karavanistu. Trajektmi cez fjordy, serpentínami Trollstigen "
            "až na Atlantickú cestu. Vďaka zákonu „allemannsretten“ môžete prenocovať takmer "
            "kdekoľvek v prírode – stačí rešpektovať pravidlá."
        ),
        "highlights": [
            "Geirangerfjord a vyhliadka Dalsnibba",
            "Serpentíny Trollstigen",
            "Atlantická cesta (Atlanterhavsveien)",
            "Preikestolen a Lysefjord",
        ],
        "cover": "1508672019048-805c876b67e2",
    },
    {
        "slug": "toskansko-a-talianske-pobrezie-mimo-sezony",
        "title": "Toskánsko a talianske pobrežie mimo hlavnej sezóny (8 dní)",
        "region_label": "Taliansko",
        "duration_days_label": "8 dní",
        "distance_km_label": "≈ 2 100 km",
        "summary": (
            "Cyprusové aleje Val d'Orcia, vinárske mestečká, Cinque Terre a pobrežie Ligúrie. "
            "Na jar a na jeseň si užijete prázdne cesty, výhodné ceny v kempoch (sostas) a "
            "nižšiu sadzbu prenájmu v mimosezóne."
        ),
        "highlights": [
            "Val d'Orcia a mestečko Pienza",
            "Siena a San Gimignano",
            "Cinque Terre – pešia trasa Sentiero Azzurro",
            "Lago di Garda na ceste domov",
        ],
        "cover": "1516483638261-f4dbaf036963",
    },
    {
        "slug": "okruh-po-slovensku-a-vysokych-tatrach",
        "title": "Okruh po Slovensku a Vysokých Tatrách (5 dní)",
        "region_label": "Slovensko",
        "duration_days_label": "5 dní",
        "distance_km_label": "≈ 780 km",
        "summary": (
            "Ideálna prvá cesta karavanom bez hraníc a jazykovej bariéry. Hrady, horské "
            "plesá, Slovenský raj a termálne kúpaliská – na krátkych presunoch si vyskúšate "
            "život na kolesách a zamilujete si ho."
        ),
        "highlights": [
            "Štrbské a Popradské pleso",
            "Spišský hrad (UNESCO)",
            "Prielom Hornádu v Slovenskom raji",
            "Bojnický zámok a termálne kúpele",
        ],
        "cover": "1506905925346-21bda4d32df4",
    },
]


class Command(BaseCommand):
    help = "Naplní databázu ukážkovou flotilou, doplnkovou výbavou a tipmi na trasy (idempotentne)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset", action="store_true",
            help="Pred naplnením zmaže existujúce karavany (bez rezervácií), výbavu a trasy.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            ExtraAccessory.objects.all().delete()
            TravelRouteTip.objects.all().delete()
            CamperVehicle.objects.filter(booking_requests__isnull=True).delete()

        for order, data in enumerate(CAMPERS, start=1):
            data = dict(data)
            slug = data.pop("slug")
            cover = data.pop("cover")
            gallery = data.pop("gallery")
            extra = data.pop("extra_equipment")
            vehicle, _ = CamperVehicle.objects.update_or_create(
                slug=slug,
                defaults={
                    **data,
                    "cover_image_url": unsplash(cover),
                    "included_equipment": extra + BASE_EQUIPMENT,
                    "display_order": order,
                },
            )
            vehicle.images.all().delete()
            CamperImage.objects.bulk_create(
                CamperImage(vehicle=vehicle, image_url=unsplash(pid, 2000), caption=caption, display_order=i)
                for i, (pid, caption) in enumerate(gallery, start=1)
            )

        for order, data in enumerate(ACCESSORIES, start=1):
            ExtraAccessory.objects.update_or_create(
                name=data["name"], defaults={**data, "display_order": order}
            )

        for order, data in enumerate(ROUTES, start=1):
            data = dict(data)
            slug = data.pop("slug")
            cover = data.pop("cover")
            TravelRouteTip.objects.update_or_create(
                slug=slug,
                defaults={**data, "cover_image_url": unsplash(cover), "display_order": order},
            )

        self.stdout.write(self.style.SUCCESS(
            f"Hotovo: {CamperVehicle.objects.count()} karavanov, "
            f"{ExtraAccessory.objects.count()} doplnkov, {TravelRouteTip.objects.count()} trás."
        ))
