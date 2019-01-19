import { NgModule } from '@angular/core';

import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { GrpcsignupComponent } from './signup/signup.component';


@NgModule({
  imports: [
    CoreModule,
    SharedModule,
  ],
  declarations: [
    GrpcsignupComponent
  ]
})
export class SignupModule { }
