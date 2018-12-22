import { RouterTestingModule } from '@angular/router/testing';
import { EndpointsModule } from '../endpoints.module';
import { SharedModule } from '../../../shared/shared.module';
import { CoreModule } from '../../../core/core.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEndpointComponent } from './delete-endpoint.component';
import { DeleteEndpointCfStep1Component } from './delete-endpoint-cf-step-1/delete-endpoint-cf-step-1.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createBasicStoreModule } from '../../../test-framework/store-test-helper';

describe('DeleteEndpointComponent', () => {
  let component: DeleteEndpointComponent;
  let fixture: ComponentFixture<DeleteEndpointComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DeleteEndpointComponent,
        DeleteEndpointCfStep1Component,
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
    fixture = TestBed.createComponent(DeleteEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
