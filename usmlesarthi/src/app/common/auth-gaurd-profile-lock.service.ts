import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from "./authentication.service";
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class AuthGuardProfileLock implements CanActivate {
  
  constructor(
    public authService: AuthenticationService,
    public router: Router,
    public toastr: ToastrService
  ){ }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if(this.authService.isLoggedIn !== true || this.authService.isEmailVerified!== true || this.authService.isUserVerified!=true) {
      this.router.navigate(['authenticate']);
      return false;
    }
    if(this.authService.userData && (this.authService.userData.Role!=="Admin") && ((this.authService.userData.Locked!=="1" && typeof this.authService.userData.Locked!=="undefined") || !this.authService.userData.extraUsersData)){
      this.toastr.info("Complete your profile first");
      this.router.navigate(["profile"]);
      return false;
    }
    return true;
  }

}