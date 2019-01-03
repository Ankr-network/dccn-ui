import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../shared/shared.module';
import { UpdateEndpointComponent } from './update-endpoint.component';
import { NgModule } from '@angular/core';
import { UpdateEndpointCfStep1Component } from './update-endpoint-cf-step-1/update-endpoint-cf-step-1.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule
  ],
  declarations: [
    UpdateEndpointComponent,
    UpdateEndpointCfStep1Component,
  ],
  exports: [
    UpdateEndpointComponent
  ]
})
export class UpdateEndpointModule { }
