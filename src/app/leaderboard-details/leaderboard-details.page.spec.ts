import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaderboardDetailsPage } from './leaderboard-details.page';

describe('LeaderboardDetailsPage', () => {
  let component: LeaderboardDetailsPage;
  let fixture: ComponentFixture<LeaderboardDetailsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LeaderboardDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
