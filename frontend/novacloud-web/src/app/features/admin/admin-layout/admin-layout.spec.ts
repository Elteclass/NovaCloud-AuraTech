import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AdminLayout } from './admin-layout';
import { AuthService } from '../../../core/services/http/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { AdminService } from '../../../core/services/http/admin.service';
import { Router } from '@angular/router';

describe('AdminLayout', () => {
  let component: AdminLayout;
  let fixture: ComponentFixture<AdminLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        {
          provide: AuthService,
          useValue: {
            logout: () => of(void 0),
          },
        },
        {
          provide: TokenService,
          useValue: {
            clear: () => {},
          },
        },
        {
          provide: AdminService,
          useValue: {
            searchQuery: () => '',
            setSearchQuery: () => {},
          },
        },
        {
          provide: Router,
          useValue: {
            events: of(),
            url: '/admin/dashboard',
            navigate: () => Promise.resolve(true),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the admin user menu', () => {
    component.toggleUserMenu();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Log out');
  });
});
