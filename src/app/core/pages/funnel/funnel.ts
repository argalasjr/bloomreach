import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FiltersModuleComponent } from '@libs/filters-module';

@Component({
  selector: 'app-funnel',
  imports: [FiltersModuleComponent],
  templateUrl: './funnel.html',
  styleUrl: './funnel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FunnelComponent {}
