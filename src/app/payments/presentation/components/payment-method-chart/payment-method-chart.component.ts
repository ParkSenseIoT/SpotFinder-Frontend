import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { PaymentsStore } from '../../../application/store/payments.store';
import { RevenueByMethodEntry } from '../../../domain/models/payment.models';

@Component({
  selector: 'app-payment-method-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  template: `
    @if (store.revenueLoading() && !store.revenue()) {
      <div class="chart-skeleton">
        <div class="skeleton-block"></div>
      </div>
    } @else {
      <div echarts [options]="chartOptions()" class="echarts-instance"></div>
    }
  `,
  styleUrls: ['./payment-method-chart.component.scss'],
})
export class PaymentMethodChartComponent {
  readonly store = inject(PaymentsStore);

  readonly chartOptions = computed(() => {
    const rev = this.store.revenue();
    if (!rev?.paymentsByMethod?.length) {
      return { backgroundColor: 'transparent' };
    }
    const data = rev.paymentsByMethod.map((m: RevenueByMethodEntry) => ({
      name: m.method.replace(/_/g, ' '),
      value: m.amount,
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#192121',
        borderColor: '#3a4a49',
        textStyle: { color: '#dbe4e3' },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#b9cac9', fontSize: 11 },
      },
      series: [
        {
          name: `Mix (${rev.currency})`,
          type: 'pie',
          radius: ['40%', '68%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: '#151d1d',
            borderWidth: 2,
          },
          label: { color: '#dbe4e3', fontSize: 11 },
          data,
          color: ['#01f2f2', '#7ee0c3', '#f5d78e'],
        },
      ],
    };
  });
}
