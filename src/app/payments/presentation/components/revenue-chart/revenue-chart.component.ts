import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { PaymentsStore } from '../../../application/store/payments.store';
import { RevenueByDayEntry } from '../../../domain/models/payment.models';

@Component({
  selector: 'app-revenue-chart',
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
  styleUrls: ['./revenue-chart.component.scss'],
})
export class RevenueChartComponent {
  readonly store = inject(PaymentsStore);

  readonly chartOptions = computed(() => {
    const rev = this.store.revenue();
    if (!rev?.dataByDay?.length) {
      return { backgroundColor: 'transparent' };
    }
    const labels = rev.dataByDay.map((d: RevenueByDayEntry) => d.date.slice(5));
    const values = rev.dataByDay.map((d: RevenueByDayEntry) => d.revenue);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#192121',
        borderColor: '#3a4a49',
        textStyle: { color: '#dbe4e3' },
        axisPointer: { type: 'shadow' },
      },
      grid: { left: '3%', right: '3%', bottom: '12%', top: '14%', containLabel: true },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: '#3a4a49' } },
        axisLabel: { color: '#b9cac9', fontFamily: 'JetBrains Mono', fontSize: 10, margin: 12 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#192121', type: 'solid' } },
        axisLabel: { color: '#b9cac9', fontFamily: 'JetBrains Mono', fontSize: 10 },
      },
      series: [
        {
          name: `Revenue (${rev.currency})`,
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          data: values,
          lineStyle: { color: '#01f2f2', width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(1, 242, 242, 0.25)' },
                { offset: 1, color: 'rgba(21, 29, 29, 0)' },
              ],
            },
          },
        },
      ],
    };
  });
}
