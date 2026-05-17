import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Topbar } from './topbar';
import { ProfileService } from '../../../../core/services/http/profile.service';
import { NotificationsService } from '../../../../core/services/http/notifications.service';
import { AuthService } from '../../../../core/services/http/auth.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../../core/services/token.service';

describe('Topbar', () => {
  let component: Topbar;
  let fixture: ComponentFixture<Topbar>;
  let logoutSpy: jasmine.Spy;
  let clearSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;

  beforeEach(() => {
    logoutSpy = jasmine.createSpy('logout').and.returnValue(of(void 0));
    clearSpy = jasmine.createSpy('clear');
    navigateSpy = jasmine.createSpy('navigate');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topbar],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            getProfile: () => of({ email: 'user@test.com', name: 'User Test', role: 'admin' }),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            getCount: () => of({ count: 0 }),
          },
        },
        {
          provide: AuthService,
          useValue: {
            logout: logoutSpy,
          },
        },
        {
          provide: TokenService,
          useValue: {
            clear: clearSpy,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: navigateSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Topbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an empty-state message when there are no notifications and the bell is clicked', () => {
    component.notificationCount = 0;
    component.onNotificationsClick();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No notifications.');
  });

  it('should open the user menu when the profile chip is clicked', () => {
    component.onUserMenuClick();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Log out');
  });

  it('should call logout from the user menu', () => {
    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
  });
});
