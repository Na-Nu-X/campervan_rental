import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'karavany',
    title: 'Flotila karavanov a obytných áut',
    loadComponent: () => import('./pages/fleet/fleet.page').then((m) => m.FleetPage),
  },
  {
    path: 'karavany/:slug',
    title: 'Detail karavanu',
    loadComponent: () =>
      import('./pages/camper-detail/camper-detail.page').then((m) => m.CamperDetailPage),
  },
  {
    path: 'cennik-a-vybava',
    title: 'Cenník, podmienky a doplnková výbava',
    loadComponent: () => import('./pages/pricing/pricing.page').then((m) => m.PricingPage),
  },
  {
    path: 'tipy-na-trasy',
    title: 'Tipy na trasy karavanom',
    loadComponent: () => import('./pages/routes/routes.page').then((m) => m.RoutesPage),
  },
  {
    path: 'ako-to-funguje',
    title: 'Ako to funguje, rezervácia a FAQ',
    loadComponent: () =>
      import('./pages/how-it-works/how-it-works.page').then((m) => m.HowItWorksPage),
  },
  {
    path: '**',
    title: 'Stránka nenájdená',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
