import { Component, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { AnalyticsStore } from '../../../application/store/analytics.store';

import { NgxEchartsDirective, NGX_ECHARTS_CONFIG } from 'ngx-echarts';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, NgxEchartsDirective],
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({
        echarts: () => import('echarts'),
      }),
    },
  ],
})
export class AnalyticsPage {
  readonly store = inject(AnalyticsStore);

  readonly chartOptions = computed(() => {
    const data = this.store.data();
    const trends = data?.trends ?? [];
    const xLabels = trends.length
      ? trends.map((t) => t.day)
      : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const series = trends.length ? trends.map((t) => t.value) : [0, 0, 0, 0, 0, 0, 0];

    const barThickness = 40;
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#192121',
        borderColor: '#3a4a49',
        textStyle: { color: '#dbe4e3' },
        axisPointer: { type: 'shadow' },
      },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: xLabels,
        axisLine: { lineStyle: { color: '#3a4a49' } },
        axisLabel: {
          color: '#b9cac9',
          fontFamily: 'JetBrains Mono',
          fontSize: 10,
          margin: 16,
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#192121', type: 'solid' } },
        axisLabel: { show: false },
      },
      series: [
        {
          name: 'Trend',
          type: 'bar',
          data: series,
          barWidth: barThickness,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(58, 74, 73, 0.4)' },
                { offset: 1, color: 'rgba(21, 29, 29, 0.0)' },
              ],
            },
          },
        },
        {
          name: 'Top Glow',
          type: 'pictorialBar',
          symbol: 'rect',
          symbolPosition: 'end',
          symbolSize: [barThickness, 3],
          symbolOffset: [0, '-50%'],
          data: series,
          itemStyle: {
            color: '#01f2f2',
            shadowColor: 'rgba(1, 242, 242, 0.8)',
            shadowBlur: 12,
          },
          tooltip: { show: false },
        },
      ],
    };
  });
}
