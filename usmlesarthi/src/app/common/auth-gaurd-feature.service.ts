import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGaurdFeatureService implements CanActivate {

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
    if(this.authService.userData.Role!="Admin")
    {
      this.toastr.info("Launching this soon! Stay tuned.");
    this.router.navigate(['']);
      return false;
    }
    return true;
  }
}
