import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, takeWhile, tap } from 'rxjs/operators';

import { queryParamMap } from '../../../core/auth-guard.service';
import { Signup, VerifySession } from '../../../store/actions/auth.actions';
import { RouterNav } from '../../../store/actions/router.actions';
import { AppState } from '../../../store/app-state';
import { AuthState } from '../../../store/reducers/auth.reducer';
import { RouterRedirect } from '../../../store/reducers/routing.reducer';

@Component({
  selector: 'app-list-Dc',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListDcComponent {

  constructor(
    
  ) { }
}
