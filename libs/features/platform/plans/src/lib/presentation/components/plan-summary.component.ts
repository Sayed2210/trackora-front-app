import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlatformPlan } from '../../domain/models/platform-plan.models';
import { ENTITLEMENT_LABELS, formatLimit, formatMoney, formatYearlyMoney } from './plan-ui.helpers';

@Component({
  selector: 'app-plan-summary',
  imports: [CommonModule],
  template: `
    @if (plan) {
      <div class="plan-summary">
        <div class="plan-summary__price">
          <strong>{{ formatMoney(plan) }}</strong>
          <span>{{ plan.billingCycle }}</span>
        </div>
        <p>{{ plan.description || 'No description provided.' }}</p>
        <dl>
          <div><dt>Yearly price</dt><dd>{{ formatYearlyMoney(plan) }}</dd></div>
          <div><dt>Website visibility</dt><dd>{{ plan.isPublic ? 'Public' : 'Private' }}</dd></div>
          <div><dt>Popular badge</dt><dd>{{ plan.isPopular ? 'Enabled' : 'Disabled' }}</dd></div>
          <div><dt>Sort order</dt><dd>{{ plan.sortOrder }}</dd></div>
          <div><dt>Monthly shipments</dt><dd>{{ formatLimit(plan.limits.monthlyShipments) }}</dd></div>
          <div><dt>Max admins</dt><dd>{{ formatLimit(plan.limits.maxAdmins) }}</dd></div>
          <div><dt>Max merchants</dt><dd>{{ formatLimit(plan.limits.maxMerchants) }}</dd></div>
          <div><dt>Max couriers</dt><dd>{{ formatLimit(plan.limits.maxCouriers) }}</dd></div>
        </dl>
        <div class="plan-summary__features">
          @for (feature of plan.entitlements; track feature) { <span>{{ labels[feature] }}</span> }
          @if (!plan.entitlements.length) { <em>No feature entitlements enabled.</em> }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .plan-summary { display: grid; gap: 1rem; }
      .plan-summary__price { display: flex; align-items: baseline; gap: 0.55rem; }
      strong { color: var(--trackora-primary); font-family: var(--font-header); font-size: 2rem; }
      p, dt, em, .plan-summary__price span { color: var(--trackora-text-secondary); }
      p { margin: 0; line-height: 1.7; }
      dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin: 0; }
      dl div { padding: 0.8rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.85rem; }
      dt, dd { margin: 0; }
      dd { margin-block-start: 0.2rem; color: var(--trackora-primary); font-weight: 900; }
      .plan-summary__features { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .plan-summary__features span { padding: 0.4rem 0.6rem; color: var(--trackora-primary); background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 999px; font-weight: 800; }
      @media (max-width: 760px) { dl { grid-template-columns: 1fr; } }
    `,
  ],
})
export class PlanSummaryComponent {
  @Input() plan: PlatformPlan | null = null;
  readonly labels = ENTITLEMENT_LABELS;
  readonly formatLimit = formatLimit;
  readonly formatMoney = formatMoney;
  readonly formatYearlyMoney = formatYearlyMoney;
}
