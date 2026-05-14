import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { authGuard } from './auth.guard';
import { TokenStorageService } from '../../infrastructure/storage/token-storage.service';

describe('authGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let tokenSpy: jasmine.SpyObj<TokenStorageService>;

  const runGuard = (): boolean | any =>
    TestBed.runInInjectionContext(() =>
      (authGuard as CanActivateFn)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    tokenSpy = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TokenStorageService, useValue: tokenSpy },
      ],
    });
  });

  it('grants access when a JWT is present in storage', () => {
    tokenSpy.getToken.and.returnValue('jwt-token-123');

    expect(runGuard()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('denies access and redirects to /auth/login when no JWT is stored', () => {
    tokenSpy.getToken.and.returnValue(null);

    expect(runGuard()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/auth/login']);
  });
});
