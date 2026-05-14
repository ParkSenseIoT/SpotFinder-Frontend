// src/app/iam/presentation/pages/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValues = this.registerForm.getRawValue();

    // Simulamos registro exitoso
    setTimeout(() => {
      const mockUser = {
        id: Math.floor(Math.random() * 1000),
        email: formValues.email,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        isVerified: true,
        active: true,
        roles: ['ADMIN'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      this.tokenStorage.saveSession(mockToken, mockUser);
      this.isLoading.set(false);
      this.router.navigate(['/dashboard']);
    }, 500);
  }
}
