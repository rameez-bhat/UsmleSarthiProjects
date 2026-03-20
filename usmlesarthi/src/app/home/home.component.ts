import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../common/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  landing : any = "";

  constructor(public router: Router, public authService: AuthenticationService) { }

  ngOnInit() {
    if (this.authService.isLoggedIn)
      this.landing = "user";
    else
      this.landing = "unknown";
  }

  takeMeToUser (){
    if (this.authService.isLoggedIn) 
      this.landing = "user";
    else 
      this.router.navigate(['authenticate']);
  }

}
