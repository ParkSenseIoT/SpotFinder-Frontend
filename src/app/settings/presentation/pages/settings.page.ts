import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsStore } from '../../application/store/settings.store';
import { NotificationsStore } from '../../../notifications/application/store/notifications.store';
import { NotificationType } from '../../../notifications/domain/enums/notification.enums';

type Tab = 'profile' | 'password' | 'vehicles' | 'notifications';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  readonly store = inject(SettingsStore);
  readonly notificationsStore = inject(NotificationsStore);
  private readonly fb = inject(FormBuilder);

  readonly activeTab = signal<Tab>('profile');

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  readonly vehicleForm = this.fb.nonNullable.group({
    plate: ['', [Validators.required, Validators.minLength(4)]],
    brand: ['', [Validators.required]],
    model: ['', [Validators.required]],
    color: ['', [Validators.required]],
  });

  readonly passwordsMatch = computed(() => {
    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();
    return newPassword === confirmPassword;
  });

  constructor() {
    effect(() => {
      const profile = this.store.profile();
      if (profile && this.profileForm.pristine) {
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
      }
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.store.clearMessages();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.store.updateProfile(this.profileForm.getRawValue());
  }

  changePassword(): void {
    if (this.passwordForm.invalid || !this.passwordsMatch()) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.store.changePassword({ currentPassword, newPassword });
    this.passwordForm.reset();
  }

  addVehicle(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }
    this.store.registerVehicle(this.vehicleForm.getRawValue());
    this.vehicleForm.reset();
  }

  removeVehicle(vehicleId: number): void {
    this.store.deleteVehicle(vehicleId);
  }

  togglePreference(type: NotificationType, enabled: boolean): void {
    this.notificationsStore.setPreferenceEnabled({ type, enabled });
  }
}
