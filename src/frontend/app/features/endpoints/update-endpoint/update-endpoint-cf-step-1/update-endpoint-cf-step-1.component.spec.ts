import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEndpointCfStep1Component } from './update-endpoint-cf-step-1.component';
import { updateBasicStoreModule } from '../../../../test-framework/store-test-helper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UpdateEndpointCfStep1Component', () => {
  let component: UpdateEndpointCfStep1Component;
  let fixture: ComponentFixture<UpdateEndpointCfStep1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateEndpointCfStep1Component],
      imports: [
        CoreModule,
        SharedModule,
        updateBasicStoreModule(),
        NoopAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.updateComponent(UpdateEndpointCfStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
