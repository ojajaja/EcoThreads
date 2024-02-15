import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinLeaderboardPage } from './join-leaderboard.page';

describe('JoinLeaderboardPage', () => {
  let component: JoinLeaderboardPage;
  let fixture: ComponentFixture<JoinLeaderboardPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(JoinLeaderboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
