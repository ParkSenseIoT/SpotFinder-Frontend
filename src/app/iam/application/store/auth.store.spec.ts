import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { TokenStorageService } from '../../infrastructure/storage/token-storage.service';

describe('AuthStore', () => {
  let tokenSpy: jasmine.SpyObj<TokenStorageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    tokenSpy = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', [
      'saveSession',
      'clearSession',
      'getToken',
      'getUser',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStorageService, useValue: tokenSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  it('starts in a signed-out state by default', () => {
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBeFalse();
    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('login() persists the mock session, marks the user as authenticated and redirects to /dashboard', () => {
    store.login({ email: 'admin@spotfinder.com', password: 'admin1234' });

    expect(tokenSpy.saveSession).toHaveBeenCalledTimes(1);
    const [token, user] = tokenSpy.saveSession.calls.mostRecent().args;
    expect(token).toMatch(/^mock-jwt-token-\d+$/);
    expect(user.email).toBe('admin@spotfinder.com');
    expect(user.roles).toEqual(['ADMIN']);

    expect(store.isAuthenticated()).toBeTrue();
    expect(store.isLoading()).toBeFalse();
    expect(store.user()?.email).toBe('admin@spotfinder.com');
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/dashboard']);
  });

  it('logout() clears storage, resets state and redirects to /auth/login', () => {
    store.login({ email: 'admin@spotfinder.com', password: 'admin1234' });
    routerSpy.navigate.calls.reset();

    store.logout();

    expect(tokenSpy.clearSession).toHaveBeenCalledTimes(1);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/auth/login']);
  });
});
