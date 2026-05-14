import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// 👇 1. Asegúrate de importar RouterLink desde @angular/router 👇
import { Router, RouterLink } from '@angular/router';
import { AuthHttpService } from '../../../infrastructure/http/auth-http.service';
import { TokenStorageService } from '../../../infrastructure/storage/token-storage.service';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthHttpService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]] // Tu backend pide min: 8
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValues = this.registerForm.getRawValue();

    // Armamos el payload incluyendo el requestedRole que exige tu backend
    const registerPayload = {
      ...formValues,
      requestedRole: 'ADMIN' as const
    };

    // 1. Llamamos a Registro
    this.authService.register(registerPayload).subscribe({
      next: () => {
        // 2. Si el registro es exitoso, automáticamente hacemos Login para sacar el JWT
        this.authService.login({ email: formValues.email, password: formValues.password }).subscribe({
          next: (authResponse) => {
            this.tokenStorage.saveSession(authResponse.token, authResponse.user);
            this.isLoading.set(false);
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.isLoading.set(false);
            this.router.navigate(['/auth/login']); // Fallback al login manual
          }
        });
      },
      error: (err) => {
        console.error(err);
        // Si es 409 es por UserAlreadyExistsException en tu backend
        if (err.status === 409) {
          this.errorMessage.set('Email is already registered. Please login.');
        } else {
          this.errorMessage.set('Registration failed. Check server connection.');
        }
        this.isLoading.set(false);
      }
    });
  }
}
