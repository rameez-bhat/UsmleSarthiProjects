import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NgbCalendar, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ObservershipService } from "../observership/services/observership.service";
import { ToastrService } from "ngx-toastr";
import { debounceTime, first } from "rxjs/operators";

import * as firebase from "firebase";
import { AngularFireFunctions } from "@angular/fire/functions";
import { ResearchService } from "./services/research.service";
import { AuthenticationService } from "../common/authentication.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: "app-rotations",
  templateUrl: "./research.component.html",
  styleUrls: ["./research.component.scss"],
})
export class ResearchComponent implements OnInit {  matchPlans: any[] = [];
selectedMatchPlan: any = null;
  

  constructor(
    public modalService: NgbModal,
    private matchService: ResearchService,
    private toastr: ToastrService,
    private afn: AngularFireFunctions,
    public auth: AuthenticationService,
    public router: Router,
    public calendar: NgbCalendar,
    public route: ActivatedRoute
  ) {}

  async ngOnInit() {
    try {
      const matchPlans = await this.matchService.getAllMatchPlans();
console.log("Match Plans Loaded => ", matchPlans);

this.matchPlans = Object.values(matchPlans);
    } catch (err) {
      console.log(err.message);
      this.toastr.error("Error while fetching the data, please try again");
    }
  }
 


  redirectToLogin(modal: any): void {
    modal.close(); // Close the modal
    const currentUrl = this.router.url;
    console.log("currentUrl----->",currentUrl)
    console.log("this.router----->",this.router)
    localStorage.setItem('redirectUrl', currentUrl);
    this.router.navigate(['/authenticate']); // Redirect to /authenticate
  }
  openAvailabilityModal(content: any, rotation: any, openinSameTab: any) {
    console.log("rotation---->",'/researchavailability/' + rotation.Pid + '/'+content)
    window.open('/researchavailability/' + rotation.Pid + '/'+content, '_blank');
  }

  getEvents() {
    // map your rotations or other data into events
    return [
      { title: 'Event 1', start: '2025-10-15' },
      { title: 'Event 2', start: '2025-10-20' }
    ];
  }

  handleDateClick(info: any) {
    alert('Date clicked: ' + info.dateStr);
  }


  openInstructions(content) {
    this.modalService.open(content, { size: "lg" });
  }







   openWhatsApp(plan) {
    const phoneNumber ="919306193724"; // ✅ Replace with your WhatsApp number (country code + number)
    const message = encodeURIComponent(`Hello, I need assistance regarding Research Plan:${plan.Name}`);
    
    // Opens WhatsApp (mobile or desktop)
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  }
  openGmail(plan) {
    const email = "customerservice@usmlesarthi.com"; // ✅ Replace with your support email
    const subject = encodeURIComponent("Help Needed Regarding Research Plan("+plan.Name+")");
    const body = encodeURIComponent(
      `Hello,\n\nI need assistance regarding Research Plan: ${plan.Name}.\n\nThank you.`
    );

// Opens Gmail compose window in a new tab
const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
window.open(gmailUrl, "_blank");
  }
}
