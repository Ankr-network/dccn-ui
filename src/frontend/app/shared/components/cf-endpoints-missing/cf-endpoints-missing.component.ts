import { AfterViewInit, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { combineLatest as observableCombineLatest, Observable } from 'rxjs';
import { delay, map, startWith, tap } from 'rxjs/operators';

import { UserService } from '../../../core/user.service';
import { CloudFoundryService } from '../../data-services/cloud-foundry.service';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cf-endpoints-missing',
  templateUrl: './cf-endpoints-missing.component.html',
  styleUrls: ['./cf-endpoints-missing.component.scss']
})
export class CfEndpointsMissingComponent implements AfterViewInit {
  title: string = 'Working Datacenter';
  datacenters;
  lat: number = 37.587841986062806;
  lng : number = -122.42805200195312;
  lat1: number = 38.53097422958369;
  lng1: number =  -121.48700433349609;
  lat2: number = 31.112616816388908;
  lng2: number = 121.38071340942383;
  lat3: number = 1.3268178776839399; 
  lng3: number = 103.92120642089844;
  lat4: number = 37.424429784838;
  lng4: number = -121.8883486328125;
  lat5: number = 37.73297778721093; 
  lng5: number = -122.16712670898437;
  lat6: number = 37.36087499833259; 
  lng6: number = -122.08198266601562;
  lat7: number = 37.32375374237436; 
  lng7: number =  -121.87530236816406;

  lat8: number = 33.95617080536196;  
  lng8: number =  -118.27521997070312;
  lat9: number = 32.708800571297964; 
  lng9: number =  -117.13907914733886;
  lat10: number = 33.62926608829064;
  lng10: number =  -117.8988524017334;

  lat11: number = 44.03959742762122;
  lng11: number =  -123.07088094329822;
  center : {lat: 38.97628854681858, lng: -123.04540625}
  styles = [
    {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{color: '#263c3f'}]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{color: '#6b9a76'}]
    },
    
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{color: '#2f3948'}]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{color: '#17263c'}]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{color: '#515c6d'}]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{color: '#17263c'}]
    }
            
  ]



  noContent$: Observable<{ firstLine: string; secondLine: { text: string; }; }>;

  noneRegisteredText = {
    firstLine: 'There are no registered Cloud Foundry endpoints',
    toolbarLink: {
      text: 'Register an endpoint'
    },
    secondLine: {
      text: 'Use the Endpoints view to register'
    },
  };

  noneConnectedText = {
    firstLine: 'There are no connected Cloud Foundry endpoints',
    secondLine: {
      text: 'Use the Endpoints view to connect'
    },
  };

  constructor(private userService: UserService, private snackBar: MatSnackBar, public cloudFoundryService: CloudFoundryService, private httpClient: HttpClient) { }

  ngAfterViewInit() {
    this.noContent$ = observableCombineLatest(
      this.cloudFoundryService.hasRegisteredCFEndpoints$,
      this.cloudFoundryService.hasConnectedCFEndpoints$
    ).pipe(
      delay(1),
      map(([hasRegistered, hasConnected]) => {
        if (!hasRegistered) {
          return this.noneRegisteredText;
        }
        if (!hasConnected) {
          return this.noneConnectedText;
        }
        return null;
      })
    ).pipe(startWith(null));
  }

  public sendDatacenterRequest(){
    this.httpClient.get('/pp/v1/datacenters')
    // .subscribe(data => console.log(data));
    .subscribe(data => this.datacenters = data);
   }
   public icon = {
    url: "/assets/DATACENTER.svg", 
    scaledSize: {
      height: 40,
      width: 40
    }
  };
}
