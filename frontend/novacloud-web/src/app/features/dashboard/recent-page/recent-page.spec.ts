import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentPage } from './recent-page';

describe('RecentPage', () => {
  let component: RecentPage;
  let fixture: ComponentFixture<RecentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
