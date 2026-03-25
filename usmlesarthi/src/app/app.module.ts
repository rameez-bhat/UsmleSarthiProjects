
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { NgbModule, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from "@angular/forms";
import { 
    PerfectScrollbarModule, 
    PERFECT_SCROLLBAR_CONFIG, 
    PerfectScrollbarConfigInterface
  } from 'ngx-perfect-scrollbar';

import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { AngularFirestore } from '@angular/fire/firestore';
import { CookieService } from 'ngx-cookie-service';
import { AngularFireFunctions, AngularFireFunctionsModule } from "@angular/fire/functions";
import { NgxSpinnerModule } from "ngx-spinner";
import { ToastrModule } from 'ngx-toastr';
import { AuthenticationService } from "./common/authentication.service";
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng5SliderModule } from 'ng5-slider';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { HttpClientModule } from '@angular/common/http';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { FullCalendarModule } from '@fullcalendar/angular'; // v4
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SafeHtmlPipe } from './safe-html.pipe';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzSelectModule } from 'ng-zorro-antd/select';



const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    wheelPropagation: false
  };
  

  @NgModule({
    declarations: [AppComponent, routingComponents,PrivacyPolicyComponent,SafeHtmlPipe],
    imports: [
      BrowserAnimationsModule,
      AppRoutingModule,
      NzDatePickerModule,
      FormsModule,
      NgSelectModule,
      NzSelectModule,
      FullCalendarModule,
      BrowserAnimationsModule,
      MatDialogModule,
      MatButtonModule,
      MatCardModule,
      MatIconModule,
      MatDividerModule,
      MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatTooltipModule,
      NgxSpinnerModule,
      Ng5SliderModule,
      NgbModule.forRoot(),
      ToastrModule.forRoot({
        timeOut: 3500,
        positionClass: "toast-bottom-left",
        preventDuplicates: true,
      }),
      PerfectScrollbarModule,
      AngularFireAuthModule, 
      AngularFireModule.initializeApp(environment.firebaseConfig),
      AngularFireDatabaseModule,
      Ng2TelInputModule,
      AngularFireFunctionsModule,
      HttpClientModule,
    ],
    providers: [
      {
        provide: PERFECT_SCROLLBAR_CONFIG,
        useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
      },
      { provide: NZ_I18N, useValue: en_US },
      AuthenticationService,
      CookieService,
      AngularFirestore,

      { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG }
    ],
    bootstrap: [AppComponent]
  })
  export class AppModule {}
  