import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-page">
      <div class="placeholder-card">
        <span class="badge mono">COMING SOON</span>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
        <ul class="todo-list" *ngIf="bullets?.length">
          <li *ngFor="let item of bullets">{{ item }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 2rem;
    }
    .placeholder-card {
      max-width: 640px;
      padding: 2.5rem;
      border: 1px solid #1f2a2a;
      border-radius: 12px;
      background: linear-gradient(180deg, rgba(25, 33, 33, 0.6), rgba(15, 20, 20, 0.6));
      color: #dbe4e3;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      background: rgba(1, 242, 242, 0.1);
      color: #01f2f2;
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      margin-bottom: 1rem;
    }
    h2 { margin: 0 0 0.5rem; font-size: 1.6rem; }
    p { margin: 0 0 1.25rem; color: #b9cac9; line-height: 1.55; }
    .todo-list { margin: 0; padding-left: 1.25rem; color: #b9cac9; }
    .todo-list li { margin-bottom: 0.4rem; }
    .mono { font-family: 'JetBrains Mono', monospace; }
  `]
})
export class PlaceholderPage {
  @Input() title = 'Module under construction';
  @Input() subtitle = 'This module is part of the SpotFinder dashboard scope but is not implemented yet.';
  @Input() bullets: string[] = [];
}
