import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements AfterViewInit{
  dclists;
  constructor(private httpClient: HttpClient) {
  }
  ngAfterViewInit() {
    this.httpClient.get('/pp/v1/datacenters')
      // .subscribe(data => console.log(data));
      .subscribe(data => this.dclists = data);
   
  }
}
