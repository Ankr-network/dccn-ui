import { AfterViewInit, Component, OnInit } from '@angular/core';
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
export class CfEndpointsMissingComponent implements AfterViewInit, OnInit {

  

  title = 'Working Datacenter';
  datacenters;
  lat = 37.587841986062806;
  lng  = -122.42805200195312;
  lat1 = 38.53097422958369;
  lng1 =  -121.48700433349609;
  lat2 = 31.112616816388908;
  lng2 = 121.38071340942383;
  lat3 = 1.3268178776839399;
  lng3 = 103.92120642089844;
  lat4 = 37.424429784838;
  lng4 = -121.8883486328125;
  lat5 = 40.72518092072731; 
  lng5 = -73.62588124847412;
  lat6 = 22.370599179467654; 
  lng6 = 114.12085337066651;
  lat7 = 37.32375374237436;
  lng7 =  -121.87530236816406;

  lat8 = 33.95617080536196;
  lng8 =  -118.27521997070312;
  lat9 = 32.708800571297964;
  lng9 =  -117.13907914733886;
  lat10 = 33.62926608829064;
  lng10 =  -117.8988524017334;

  lat11 = 44.03959742762122;
  lng11 =  -123.07088094329822;
  center = {
    lat: 38.97628854681858,
    lng: -123.04540625
  };
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
  ];

  icon = {
    url: '/assets/datacenter.svg',
    scaledSize: {
      height: 40,
      width: 40
    }
  };

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

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    public cloudFoundryService: CloudFoundryService,
    private httpClient: HttpClient
  ) { }

  ngOnInit() {
    this.loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js');
    this.loadScript('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js');
    this.loadScript('https://gitcdn.github.io/bootstrap-toggle/2.2.2/js/bootstrap-toggle.min.js');
  }

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

  public sendDatacenterRequest() {
    this.httpClient.get('/pp/v1/datacenters')
    // .subscribe(data => console.log(data));
    .subscribe(data => this.datacenters = data);
   }
  public num = 1;
  changeElement(): void {
    if (this.num > 1) {
      this.num = 0;
    }
    this.num++;
  }
  public loadScript(url: string) {
    const body = <HTMLDivElement> document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }
}
