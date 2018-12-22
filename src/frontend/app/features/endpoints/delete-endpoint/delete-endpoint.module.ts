import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../shared/shared.module';
import { DeleteEndpointComponent } from './delete-endpoint.component';
import { NgModule } from '@angular/core';
import { DeleteEndpointCfStep1Component } from './delete-endpoint-cf-step-1/delete-endpoint-cf-step-1.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule
  ],
  declarations: [
    DeleteEndpointComponent,
    DeleteEndpointCfStep1Component,
  ],
  exports: [
    DeleteEndpointComponent
  ]
})
export class DeleteEndpointModule { }
