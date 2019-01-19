import { of as observableOf } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './core/auth-guard.service';
import { CoreModule } from './core/core.module';
import { EndpointsService } from './core/endpoints.service';
import { DashboardBaseComponent } from './features/dashboard/dashboard-base/dashboard-base.component';
import { HomePageComponent } from './features/home/home/home-page.component';
import { NoEndpointsNonAdminComponent } from './features/no-endpoints-non-admin/no-endpoints-non-admin.component';
import { ConsoleUaaWizardComponent } from './features/setup/uaa-wizard/console-uaa-wizard.component';
import { UpgradePageComponent } from './features/setup/upgrade-page/upgrade-page.component';
import { SharedModule } from './shared/shared.module';
import { PageNotFoundComponentComponent } from './core/page-not-found-component/page-not-found-component.component';
import { DomainMismatchComponent } from './features/setup/domain-mismatch/domain-mismatch.component';
import { environment } from '../environments/environment';
import { CustomRoutingImportModule } from './custom-import.module';
import { GrpcsignupComponent } from './features/signup/signup/signup.component';
import { ListDcComponent } from './features/list-center/list/list.component';

const appRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'signup', component: GrpcsignupComponent},
 
  { path: 'uaa', component: ConsoleUaaWizardComponent },
  { path: 'upgrade', component: UpgradePageComponent },
  { path: 'domainMismatch', component: DomainMismatchComponent },
  { path: 'login', loadChildren: 'app/features/login/login.module#LoginModule' },
  {
    path: '',
    component: DashboardBaseComponent,
    canActivate: [AuthGuardService, EndpointsService],
    children: [
      {
        path: 'dashboard', component: HomePageComponent,
        data: {
          stratosNavigation: {
            text: 'Dashboard',
            matIcon: 'assessment',
            // Experimental - only show in development
            hidden: observableOf(environment.production),
            position: 10,
            // imglocation: 'assets/dashboard.svg'
            type: 'dashboard'
          }
        }
      },
      {
        path: 'marketplace', loadChildren: 'app/features/applications/applications.module#ApplicationsModule',
        data: {
          stratosNavigation: {
            text: 'Marketplace',
            matIcon: 'apps',
            position: 20,
            // imglocation: 'assets/marketplace.svg'
            type: 'marketplace'
          }
        },
      },
      
      {
        path: 'tasks',
        data: {
          stratosNavigation: {
            text: 'Tasks',
            matIcon: 'settings_ethernet',
            position: 30,
            // imglocation: 'assets/task.svg'
            type: 'tasks'
          }
        },
        children: [{
          path: '',
          loadChildren: 'app/features/endpoints/endpoints.module#EndpointsModule',
        },
        {
          path: 'metrics',
          loadChildren: 'app/features/metrics/metrics.module#MetricsModule',
        }]
      },
      /*{
        path: 'marketplace', loadChildren: 'app/features/service-catalog/service-catalog.module#ServiceCatalogModule',
        data: {
          stratosNavigation: {
            text: 'Marketplace',
            matIcon: 'store',
            position: 30
          }
        },
      },*/
      {
        path: 'payment', loadChildren: 'app/features/services/services.module#ServicesModule',
        data: {
          stratosNavigation: {
            text: 'Payment',
            matIcon: 'service',
            matIconFont: 'stratos-icons',
            position: 40,
            // imglocation: 'assets/wallet.svg'
            type: 'payment'
          }
        },
      },
      /*{
        path: 'cloud-foundry', loadChildren: 'app/features/cloud-foundry/cloud-foundry.module#CloudFoundryModule',
        data: {
          stratosNavigation: {
            text: 'Cloud Foundry',
            matIcon: 'cloud_foundry',
            matIconFont: 'stratos-icons',
            position: 50
          }
        },
      },*/
      { path: 'listdc', loadChildren: 'app/features/list-center/list.module#ListDcModule'},
      //{ path: 'about', loadChildren: 'app/features/about/about.module#AboutModule' },
      // { path: 'user-profile', loadChildren: 'app/features/user-profile/user-profile.module#UserProfileModule' },
    ]
  },
  {
    path: 'noendpoints',
    component: NoEndpointsNonAdminComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: '**',
    component: PageNotFoundComponentComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    RouterModule.forRoot(appRoutes),
    CustomRoutingImportModule,
  ]
})
export class RouteModule { }
