import { Component } from '@angular/core';
import {AuthenticationService} from './common/authentication.service';
import {trigger, transition, query, group, animateChild, animate, style} from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoggedIn: string;

  constructor( public authService: AuthenticationService)
  {

  }

  getPage(outlet) {
    return outlet.activatedRouteData['page'] || 'one';
  }
  
}
