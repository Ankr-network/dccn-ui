import { NgModule } from '@angular/core';

import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { ListDcComponent } from './list/list.component';


@NgModule({
  imports: [
    CoreModule,
    SharedModule,
  ],
  declarations: [
    ListDcComponent
  ]
})
export class ListDcModule { }
