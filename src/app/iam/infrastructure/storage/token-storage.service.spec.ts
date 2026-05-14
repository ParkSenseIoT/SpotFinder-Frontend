import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TokenStorageService] });
    service = TestBed.inject(TokenStorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('persists the JWT and user payload in localStorage on saveSession', () => {
    const user = { id: 7, email: 'admin@spotfinder.com', roles: ['ADMIN'] };

    service.saveSession('jwt-token-123', user);

    expect(service.getToken()).toBe('jwt-token-123');
    expect(service.getUser()).toEqual(user);
  });

  it('overwrites any previous session when saveSession is called twice', () => {
    service.saveSession('old-token', { id: 1, email: 'a@a.com', roles: ['DRIVER'] });
    service.saveSession('new-token', { id: 2, email: 'b@b.com', roles: ['ADMIN'] });

    expect(service.getToken()).toBe('new-token');
    expect(service.getUser()?.email).toBe('b@b.com');
  });

  it('returns null for token and user when no session has been stored', () => {
    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
  });

  it('clears token and user from localStorage on clearSession (logout)', () => {
    service.saveSession('jwt-token-xyz', { id: 1, email: 'admin@spotfinder.com', roles: ['ADMIN'] });

    service.clearSession();

    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
  });
});
