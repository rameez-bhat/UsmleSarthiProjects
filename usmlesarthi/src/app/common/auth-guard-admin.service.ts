import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from "./authentication.service";
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class AuthGuardAdmin implements CanActivate {
  
  constructor(
    public authService: AuthenticationService,
    public router: Router,
    private toastr: ToastrService,
  ){ }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if(this.authService.isLoggedIn !== true || this.authService.isEmailVerified!== true || this.authService.isUserVerified!=true) {
      this.router.navigate(['authenticate']);
      return false;
    }
    if(this.authService.userData.Role!="Admin" && this.authService.userData.Role!="Mentor")
    {
      this.router.navigate(['']);
      this.toastr.error("You are not authorized to access the route");
      return false;
    }
    return true;
  }

}