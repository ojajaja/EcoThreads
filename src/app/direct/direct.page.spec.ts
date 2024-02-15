import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DirectPage } from './direct.page';

describe('DirectPage', () => {
  let component: DirectPage;
  let fixture: ComponentFixture<DirectPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DirectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
