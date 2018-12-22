import { RouterTestingModule } from '@angular/router/testing';
import { EndpointsModule } from '../endpoints.module';
import { SharedModule } from '../../../shared/shared.module';
import { CoreModule } from '../../../core/core.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEndpointComponent } from './update-endpoint.component';
import { UpdateEndpointCfStep1Component } from './update-endpoint-cf-step-1/update-endpoint-cf-step-1.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createBasicStoreModule } from '../../../test-framework/store-test-helper';

describe('DeleteEndpointComponent', () => {
  let component: DeleteEndpointComponent;
  let fixture: ComponentFixture<DeleteEndpointComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UpdateEndpointComponent,
        UpdateEndpointCfStep1Component,
      ],
      imports: [
        CoreModule,
        SharedModule,
        createBasicStoreModule(),
        RouterTestingModule,
        NoopAnimationsModule

      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
