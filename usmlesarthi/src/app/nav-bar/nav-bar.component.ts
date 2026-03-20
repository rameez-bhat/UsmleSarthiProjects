import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../common/authentication.service';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  title = 'UsmleSarthi';
  isCollapsed = true;
  userData: any = {};
  constructor(public authService: AuthenticationService) {
   }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
  }

}
