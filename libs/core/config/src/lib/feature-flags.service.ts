import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly flags = signal<Record<string, boolean>>({});

  isEnabled(flag: string): boolean {
    return this.flags()[flag] ?? false;
  }

  setFlags(flags: Record<string, boolean>): void {
    this.flags.set(flags);
  }
}
