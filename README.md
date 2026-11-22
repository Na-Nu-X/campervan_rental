# Severka Karavany – Campervan & Motorhome Rental Platform

White-label full-stack web application for a campervan & motorhome rental agency
(*Požičovňa karavanov a obytných áut*). Built as a monorepo:

| Directory   | Stack                                                                 |
|-------------|-----------------------------------------------------------------------|
| `/backend`  | Python 3, Django 6, Django REST Framework, django-filter, CORS, Pillow |
| `/frontend` | Angular 22 (standalone components, Signals, strict TypeScript), pure SCSS |

The codebase is written in English; all user-facing copy and seeded content is in Slovak.

---

## Quick start

### 1. Backend (Django API + admin)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # optional – sensible defaults are built in
python manage.py migrate
python manage.py seed_data         # idempotent – safe to run repeatedly
python manage.py createsuperuser   # for /admin
python manage.py runserver         # http://localhost:8000
```

- API root: <http://localhost:8000/api/>
- Admin: <http://localhost:8000/admin/> (Slovak UI – fleet, seasonal pricing, accessories, routes, bookings, inquiries)

`seed_data --reset` wipes catalogue data (campers without bookings, accessories, routes) before re-seeding.

### 2. Frontend (Angular)

```bash
cd frontend
npm install
npm start                          # http://localhost:4200
```

The API base URL is set in `src/environments/environment.ts` (production) and
`src/environments/environment.development.ts` (`ng serve`) – both default to `http://localhost:8000/api`.

> `frontend/.npmrc` enables `legacy-peer-deps`, which works around an npm peer-resolution bug
> triggered by the Vitest test tooling during `npm install`.

### Production build

```bash
cd frontend && npx ng build        # output: frontend/dist/frontend/browser
cd backend && python manage.py check --deploy
```

---

## Configuration

### Backend (`backend/.env`)

| Variable               | Default                                       | Notes                                   |
|------------------------|-----------------------------------------------|-----------------------------------------|
| `DJANGO_SECRET_KEY`    | insecure dev key                              | **Set in production**                   |
| `DJANGO_DEBUG`         | `True`                                        | `False` in production                   |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1`                         | Comma-separated                         |
| `DATABASE_URL`         | SQLite (`backend/db.sqlite3`)                 | e.g. `postgres://user:pass@host:5432/db` (install `psycopg[binary]`) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200,http://127.0.0.1:4200` | Frontend origin(s)                      |
| `CSRF_TRUSTED_ORIGINS` | –                                             | Needed for admin behind HTTPS proxy     |
| `API_ANON_THROTTLE`    | `120/minute`                                  | Anonymous rate limit                    |

### White-label rebranding (frontend)

1. **Business details** – `frontend/src/app/core/config/site.config.ts`: company name, wordmark,
   tagline, phone, booking email, depot address, parking note, IČO/DIČ, license & 24/7 assistance
   notes, opening hours, social links, trust metrics, long-trip discount rules.
2. **Colours, fonts, radii** – `frontend/src/styles/_variables.scss` (emitted as CSS custom
   properties in `src/styles.scss`, so they can also be overridden at runtime).
3. **Marketing copy** – `frontend/src/app/core/content/site-content.ts`: trust pillars, reviews,
   process steps, FAQ.
4. **Fonts** – Google Fonts link in `frontend/src/index.html` (Fraunces + Plus Jakarta Sans).

---

## REST API

| Method | Endpoint                 | Description |
|--------|--------------------------|-------------|
| GET    | `/api/campers/`          | Fleet list. Filters: `category` (`polointegrovany`, `integrovany`, `alkovna`, `campervan`), `transmission` (`automat`, `manual`), `min_berths`, `min_seats`, `max_price` (cheapest seasonal rate), `featured`, `search` (name, engine, description, equipment), `ordering` (e.g. `-high_season_price_eur`, `berths_sleeping`) |
| GET    | `/api/campers/<slug>/`   | Full dossier: gallery, seasonal rates, fees, deposit, included equipment |
| GET    | `/api/accessories/`      | Optional rental add-ons |
| GET    | `/api/routes/`           | Curated road-trip route guides (`/api/routes/<slug>/` for detail) |
| POST   | `/api/bookings/`         | Availability & booking request (validates dates, past pickup, seats vs. travellers, accessory names) |
| POST   | `/api/inquiries/`        | General question / first-timer consultation |

Example booking payload:

```json
{
  "vehicle": "sunlight-t68-adventure-edition",
  "pickup_date": "2027-07-03",
  "return_date": "2027-07-17",
  "adults_count": 2,
  "children_count": 1,
  "selected_accessories": ["Nosič na 4 bicykle / elektrobicykle"],
  "estimated_total_eur": "2349.00",
  "destination_region": "Chorvátsko",
  "client_name": "Ján Novák",
  "email": "jan@example.com",
  "phone": "+421 900 000 000",
  "notes": ""
}
```

---

## Frontend routes

| Route               | Page |
|---------------------|------|
| `/`                 | Home – hero with quick camper filter, featured fleet, cost estimator, trust pillars, route inspirations, reviews |
| `/karavany`         | Fleet catalogue with URL-synced filters (`?category=&transmission=&min_berths=&max_price=&ordering=`) |
| `/karavany/:slug`   | Camper dossier – gallery + lightbox, spec bar, seasonal price table, equipment checklist, estimator |
| `/cennik-a-vybava`  | Pricing comparison, service fee breakdown, accessories, estimator |
| `/tipy-na-trasy`    | Road-trip route guides |
| `/ako-to-funguje`   | 4-step guide, booking form (`#rezervacia`), FAQ accordion, consultation form, depot info |

The booking form can be pre-filled via query params:
`/ako-to-funguje?camper=<slug>&season=low|mid|high&days=10&accessories=1,3&destination=Nórsko#rezervacia`
(the estimator's *"Overiť dostupnosť pre tento výber"* button does this automatically).

### Pricing rules

- Seasons: **Mimosezóna** (Oct–Apr), **Stredná** (May, Jun, Sep), **Hlavná** (Jul–Aug).
- Long-trip discount on the vehicle rental: **-5 % from 10 days**, **-10 % from 14 days** (configurable in `site.config.ts`).
- Total = rental − discount + accessories (per day or per stay) + one-time service fee; refundable deposit shown separately.
- The booking form prices each rental day by its own season (trips spanning season boundaries are priced exactly).

---

## Project structure

```
backend/
  config/                 settings (.env aware), urls
  rental/                 models, admin, serializers, filters, views, urls
  rental/management/commands/seed_data.py
frontend/src/
  styles/                 _variables, _mixins, _typography (design system)
  app/core/config/        site.config.ts (white-label)
  app/core/               models, services (API, signal store, title strategy), utils (pricing, form errors), content
  app/shared/             navbar, footer, camper-card, route-card, trip estimator, icon, pipes
  app/pages/              home, fleet, camper-detail, pricing, routes, how-it-works, not-found
```

Photography: Unsplash (hot-linked via `images.unsplash.com`).
