import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEventPage } from './add-event.page';

describe('AddEventPage', () => {
  let component: AddEventPage;
  let fixture: ComponentFixture<AddEventPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddEventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
