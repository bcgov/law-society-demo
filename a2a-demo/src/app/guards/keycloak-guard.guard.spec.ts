import { TestBed, async, inject } from '@angular/core/testing';

import { KeycloakGuardGuard } from './keycloak-guard.guard';

describe('KeycloakGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeycloakGuardGuard]
    });
  });

  it('should ...', inject([KeycloakGuardGuard], (guard: KeycloakGuardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
