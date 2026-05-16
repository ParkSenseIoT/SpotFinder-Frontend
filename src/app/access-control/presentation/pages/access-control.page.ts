import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccessControlStore } from '../../application/store/access-control.store';
import { VehicleSession } from '../../domain/models/access-control.models';

type Tab = 'sessions' | 'alpr' | 'manual';

@Component({
  selector: 'app-access-control-page',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './access-control.page.html',
  styleUrls: ['./access-control.page.scss'],
})
export class AccessControlPage {
  readonly store = inject(AccessControlStore);
  private readonly fb = inject(FormBuilder);

  readonly activeTab = signal<Tab>('sessions');

  readonly alprForm = this.fb.nonNullable.group({
    imageData: ['', [Validators.required, Validators.minLength(8)]],
    cameraPosition: ['ENTRY', [Validators.required]],
  });

  readonly entryForm = this.fb.nonNullable.group({
    imageData: ['', [Validators.required, Validators.minLength(8)]],
    barrierCode: ['BARRIER-1', [Validators.required]],
  });

  readonly exitForm = this.fb.nonNullable.group({
    imageData: ['', [Validators.required, Validators.minLength(8)]],
    barrierCode: ['BARRIER-1', [Validators.required]],
  });

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  reloadHistory(): void {
    this.store.loadHistory();
    this.store.loadActiveSession();
  }

  runAlpr(): void {
    if (this.alprForm.invalid) {
      this.alprForm.markAllAsTouched();
      return;
    }
    this.store.runAlpr(this.alprForm.getRawValue());
  }

  registerEntry(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }
    this.store.registerEntry(this.entryForm.getRawValue());
  }

  registerExit(): void {
    if (this.exitForm.invalid) {
      this.exitForm.markAllAsTouched();
      return;
    }
    this.store.registerExit(this.exitForm.getRawValue());
  }

  trackBySessionId(_: number, session: VehicleSession): number {
    return session.id;
  }
}
