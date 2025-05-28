import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservablexComponent } from './observablex.component';

describe('ObservablexComponent', () => {
  let component: ObservablexComponent;
  let fixture: ComponentFixture<ObservablexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservablexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservablexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
