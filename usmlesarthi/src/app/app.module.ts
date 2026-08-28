import {
  NgModule
} from '@angular/core';

import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClientModule
} from '@angular/common/http';

import {
  AppRoutingModule,
  routingComponents
} from './app-routing.module';

import {
  NgbModule
} from '@ng-bootstrap/ng-bootstrap';

import {
  NzDatePickerModule
} from 'ng-zorro-antd/date-picker';

import {
  NzSelectModule
} from 'ng-zorro-antd/select';

import {
  NZ_I18N,
  en_US
} from 'ng-zorro-antd/i18n';

import {
  PerfectScrollbarModule,
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface
} from 'ngx-perfect-scrollbar';

import {
  AngularFireModule
} from '@angular/fire';

import {
  AngularFireAuthModule
} from '@angular/fire/auth';

import {
  AngularFireDatabaseModule
} from '@angular/fire/database';

import {
  AngularFireFunctionsModule
} from '@angular/fire/functions';

import {
  AngularFirestoreModule,
  SETTINGS as FIRESTORE_SETTINGS
} from '@angular/fire/firestore';

import {
  CookieService
} from 'ngx-cookie-service';

import {
  NgxSpinnerModule
} from 'ngx-spinner';

import {
  ToastrModule
} from 'ngx-toastr';

import {
  NgSelectModule
} from '@ng-select/ng-select';

import {
  Ng5SliderModule
} from 'ng5-slider';

import {
  Ng2TelInputModule
} from 'ng2-tel-input';

import {
  FullCalendarModule
} from '@fullcalendar/angular';

import {
  MatDialogModule
} from '@angular/material/dialog';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatDividerModule
} from '@angular/material/divider';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatNativeDateModule
} from '@angular/material/core';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatTooltipModule
} from '@angular/material/tooltip';

import {
  AppComponent
} from './app.component';

import {
  PrivacyPolicyComponent
} from './privacy-policy/privacy-policy.component';

import {
  SafeHtmlPipe
} from './safe-html.pipe';

import {
  AuthenticationService
} from './common/authentication.service';

import {
  environment
} from '../environments/environment';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG:
  PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    wheelPropagation: false
  };


@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    PrivacyPolicyComponent,
    SafeHtmlPipe
  ],

  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,

    NzDatePickerModule,
    NzSelectModule,

    NgSelectModule,
    Ng5SliderModule,
    Ng2TelInputModule,
    NgxSpinnerModule,

    FullCalendarModule,

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

    NgbModule.forRoot(),

    ToastrModule.forRoot({
      timeOut: 3500,
      positionClass:
        'toast-bottom-left',
      preventDuplicates: true
    }),

    PerfectScrollbarModule,

    /*
     * Firebase must be initialized before
     * its individual feature modules.
     */
    AngularFireModule.initializeApp(
      environment.firebaseConfig
    ),

    /*
     * Persist Firestore documents in
     * browser IndexedDB across refreshes.
     */
    AngularFirestoreModule.enablePersistence({
      synchronizeTabs: true
    }),

    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireFunctionsModule
  ],

  providers: [
    {
      provide:
        PERFECT_SCROLLBAR_CONFIG,

      useValue:
        DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },

    {
      provide:
        FIRESTORE_SETTINGS,

      useValue: {
        cacheSizeBytes:
          100 * 1024 * 1024
      }
    },

    {
      provide: NZ_I18N,
      useValue: en_US
    },

    AuthenticationService,
    CookieService
  ],

  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}