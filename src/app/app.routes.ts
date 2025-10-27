import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./libs/filters-module/filters-module').then((m) => m.FiltersModuleComponent),
  },
];
