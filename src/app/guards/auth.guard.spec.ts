import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { loggedIn } from './auth.guard';

describe('loggedIn', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => loggedIn(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
