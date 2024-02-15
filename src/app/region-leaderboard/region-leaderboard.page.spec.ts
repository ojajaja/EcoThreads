import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegionLeaderboardPage } from './region-leaderboard.page';

describe('RegionLeaderboardPage', () => {
  let component: RegionLeaderboardPage;
  let fixture: ComponentFixture<RegionLeaderboardPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RegionLeaderboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
