import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddLeaderboardPage } from './add-leaderboard.page';

describe('AddLeaderboardPage', () => {
  let component: AddLeaderboardPage;
  let fixture: ComponentFixture<AddLeaderboardPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddLeaderboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
