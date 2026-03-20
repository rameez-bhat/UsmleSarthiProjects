import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ReferrerService {
  private previousUrl: string = '';
  private currentUrl: string = '';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log("Navigated to:", event.url);
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        console.log("Previous URL:", this.previousUrl);
        sessionStorage.setItem('previousUrl', this.previousUrl);
      }
    });
  }

  getReferrer(): string {
    return sessionStorage.getItem('previousUrl') || 'No referrer';
  }
}
