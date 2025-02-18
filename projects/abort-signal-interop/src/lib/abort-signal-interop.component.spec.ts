import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbortSignalInteropComponent } from './abort-signal-interop.component';

describe('AbortSignalInteropComponent', () => {
  let component: AbortSignalInteropComponent;
  let fixture: ComponentFixture<AbortSignalInteropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbortSignalInteropComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbortSignalInteropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
