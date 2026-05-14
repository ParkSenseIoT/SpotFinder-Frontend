import { Component, OnInit, inject } from '@angular/core';
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
        echarts: () => import('echarts')
      })
    }
  ]
})
export class AnalyticsPage implements OnInit {
  readonly store = inject(AnalyticsStore);
  chartOptions: any = {};

  ngOnInit(): void {
    this.store.loadData();
    this.initChart();
  }

  initChart() {
    const trendData = [35, 55, 65, 80, 75, 50, 85];
    // 👇 CAMBIO CLAVE: Usamos un número entero (píxeles) en lugar de '50%'
    const barThickness = 40;

    this.chartOptions = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#192121',
        borderColor: '#3a4a49',
        textStyle: { color: '#dbe4e3' },
        axisPointer: { type: 'shadow' }
      },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        axisLine: { lineStyle: { color: '#3a4a49' } },
        axisLabel: { color: '#b9cac9', fontFamily: 'JetBrains Mono', fontSize: 10, margin: 16 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#192121', type: 'solid' } },
        axisLabel: { show: false }
      },
      series: [
        {
          name: 'Occupancy',
          type: 'bar',
          data: trendData,
          barWidth: barThickness, // Usamos los 40px aquí
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(58, 74, 73, 0.4)' },
                { offset: 1, color: 'rgba(21, 29, 29, 0.0)' }
              ]
            }
          }
        },
        {
          name: 'Top Glow',
          type: 'pictorialBar',
          symbol: 'rect',
          symbolPosition: 'end',
          // Usamos los mismos 40px exactos para el ancho de la línea de luz
          symbolSize: [barThickness, 3],
          symbolOffset: [0, '-50%'],
          data: trendData,
          itemStyle: {
            color: '#01f2f2',
            shadowColor: 'rgba(1, 242, 242, 0.8)',
            shadowBlur: 12
          },
          tooltip: { show: false }
        }
      ]
    };
  }
}
