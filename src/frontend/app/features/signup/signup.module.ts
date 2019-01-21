import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { GrpcsignupComponent } from './signup.component';

@NgModule({
  imports: [
    CoreModule,
    SharedModule,
    BrowserModule, 
    FormsModule, 
    NgbModule.forRoot(),
  ],
  declarations: [
    GrpcsignupComponent,

  ],
  bootstrap:    [ GrpcsignupComponent ],
})
export class GrpcsignupModule { }