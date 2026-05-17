import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <div class="card">
        <span class="code mono">404</span>
        <h2>Route not found</h2>
        <p>The screen you were looking for is not available in this build.</p>
        <a routerLink="/dashboard" class="btn-primary">Back to dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
    }
    .card {
      text-align: center;
      padding: 2.5rem;
      border: 1px solid #1f2a2a;
      border-radius: 12px;
      background: rgba(15, 20, 20, 0.7);
      color: #dbe4e3;
      max-width: 480px;
    }
    .code {
      display: block;
      font-size: 4rem;
      color: #01f2f2;
      margin-bottom: 0.5rem;
    }
    h2 { margin: 0 0 0.5rem; }
    p { color: #b9cac9; margin-bottom: 1.5rem; }
    .btn-primary {
      display: inline-block;
      padding: 0.6rem 1.4rem;
      background: #1a82ff;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
    .btn-primary:hover { background: #1571e0; }
    .mono { font-family: 'JetBrains Mono', monospace; }
  `]
})
export class NotFoundPage {}
