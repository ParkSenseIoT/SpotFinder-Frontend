import { Component } from '@angular/core';

@Component({
  selector: 'app-temp-dashboard',
  standalone: true,
  template: `
    <div style="padding: 24px; color: #dbe4e3; font-family: 'Inter', sans-serif;">
      <h2 style="font-size: 24px; font-weight: 600; color: #01f2f2; margin-bottom: 8px;">
        Centro de Comando SpotFinder
      </h2>
      <p style="color: #b9cac9;">
        El sistema está en línea. Selecciona una opción del menú lateral.
      </p>
    </div>
  `
})
export class TempDashboardComponent {}
