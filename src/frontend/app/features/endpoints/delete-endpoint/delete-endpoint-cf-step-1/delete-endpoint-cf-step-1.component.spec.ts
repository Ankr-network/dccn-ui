import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEndpointCfStep1Component } from './delete-endpoint-cf-step-1.component';
import { deleteBasicStoreModule } from '../../../../test-framework/store-test-helper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DeleteEndpointCfStep1Component', () => {
  let component: DeleteEndpointCfStep1Component;
  let fixture: ComponentFixture<DeleteEndpointCfStep1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteEndpointCfStep1Component],
      imports: [
        CoreModule,
        SharedModule,
        deleteBasicStoreModule(),
        NoopAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.deleteComponent(DeleteEndpointCfStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
