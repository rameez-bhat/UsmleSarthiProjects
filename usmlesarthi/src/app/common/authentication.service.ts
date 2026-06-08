import {
  Injectable,
  NgZone
} from '@angular/core';
import {
  auth,
  firestore
} from 'firebase/app';
import {
  AngularFireAuth
} from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { CookieService } from 'ngx-cookie-service';
import * as firebase from 'firebase/app';
const timestamp = firebase.firestore.Timestamp.now();
import {
  Router,ActivatedRoute
} from "@angular/router";
import {
  merge
} from 'rxjs';
import {
  ToastrService
} from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  userData: any; // Save logged in user data
  dataRead=false;
  promotor: any = "";
  private referrer: string;

  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public toastr: ToastrService,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private http: HttpClient
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    const savedUser = localStorage.getItem('user');
  if (savedUser && savedUser !== 'null') {
    this.userData = JSON.parse(savedUser);
  }
    this.route.queryParams.subscribe(params => {
      this.referrer = params['referrer']  || 'Unknown';
      this.promotor = params['ref'] || 'Unknown'; 
      console.log("Referrer:", this.referrer);
      console.log("this.promotor:", this.promotor);
      if(this.promotor!=="Unknown")
      {
        sessionStorage.setItem('promotor', this.promotor); 
      }
      else
      {
        const promotor=sessionStorage.getItem('promotor');
        if(typeof promotor!="undefined" && promotor!=null)
        {
          this.promotor=promotor;
        }
      }
      if(this.referrer!=="Unknown")
      sessionStorage.setItem('referrer', this.referrer); // Store for later use
    });
    this.afAuth.authState.subscribe(async (user) => {
      console.log("Auth Read----->",user)
      if (user) {
        await this.readUserData(user);
        this.dataRead=true;
        console.log("Auth Read----->",user)
        const uid = user.uid;

    // Call backend to get custom token
      const token = await this.getCustomToken(uid);
        // Store token in cookies accessible across subdomains
        this.cookieService.set('authToken', token, 7000, '/', '.usmlesarthi.com', true, 'Strict');
        
      } else {
        this.dataRead=true;
        localStorage.removeItem('user');
        JSON.parse(localStorage.getItem('user'));
        this.userData = null;
        
        const allowedRoutes = ["authenticate", "rotations", "housing","housingavailability", "rotationsavailability","payment-success-error","matchavailability","match","research","researchavailability"];
        if (!allowedRoutes.some(route => this.router.url.includes(route))) 
        {
          router.navigate(['']);
        }
      }
    })
  }
  async getCustomToken(uid: string): Promise<string | null> {
    try {
      const response = await this.http.post<{ customToken: string }>(
        'https://us-central1-usmlesarthi-residency-match.cloudfunctions.net/generateCustomToken',
        { uid }
      ).toPromise();
      
      console.log("Custom Token:", response.customToken);
      return response.customToken;
    } catch (error) {
      console.error("Error getting custom token:", error.message);
      return null;
    }
  }
  // Sign in with email/password
  async SignIn(email: any, password: any) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then(async (result) => {
        await this.readUserData(result.user);
        const token = await this.getCustomToken(result.user.uid);
        // Store token in cookies accessible across subdomains
        this.cookieService.set('authToken', token, 7000, '/', '.usmlesarthi.com', true, 'Strict');
        const referrer = sessionStorage.getItem('referrer') || 'Unknown';
        console.log("redirectUrl---->",referrer)
        if(referrer==="aichat")
        {
            window.location.href = 'https://ai.usmlesarthi.com/'; 
            return;
        }
        else
        {
          const redirectUrl = localStorage.getItem('redirectUrl') || '';
          console.log("redirectUrl---->",redirectUrl)
          if (redirectUrl && redirectUrl !== '/authenticate') 
          {
            localStorage.removeItem('redirectUrl'); // Clean up
            console.log("redirectUrl---->",redirectUrl)
            //redirectUrl.replace("home","rotations");
            this.router.navigateByUrl(redirectUrl.replace("home","rotations"));
          }
          else
          {
            this.router.navigate(['']);
          }
        }
        
        return result.user;
      })
  }

  // Sign up with email/password
  async SignUp(email: any, password: any, name: any, phone : string, medicalSchool: any, yearOfApplying: string, medicalschoolcountry: any, phoneNumber: any, selectedPhoneCountry: any, otherMedicalSchool: any) {
   
    
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(async (result) => {
        this.SendVerificationMail();
        let userData : any = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: name,
          createdAt:timestamp,
          updatedAt:timestamp,
          password:password,
          source:'register residency',
          phone,
          yearOfApplying,
          NameOfMedicalSchool:medicalSchool,
          CountryOfMedicalSchool:medicalschoolcountry,
          YearYouAreApplyingForResidency:yearOfApplying,
          PhoneCountry:selectedPhoneCountry,
          phoneNumber:phoneNumber,
          medicalSchool:medicalSchool.value,
          emailVerified: result.user.emailVerified,
          Locked: "0",
          NameOfMedicalSchoolOthers: '',
        }
        if(medicalSchool.label==="Other")
        {
          userData.NameOfMedicalSchoolOthers=otherMedicalSchool;
          userData.medicalSchool=medicalSchool;
        }
        console.log("this.promotor1--->",this.promotor);
        if(this.promotor!="Unknown")
        {
          const ReadDataUser= await this.ReadUserFromUID(this.promotor);
          //userData["ReferralObject"] ={};
          userData["ReferralObject"]={"ReferredBy":{[this.promotor]:{uid:this.promotor,email:ReadDataUser.email,displayName:ReadDataUser.displayName}}}
          console.log("userData.ReferralObject--->",userData.ReferralObject);
          await this.updateUserReferral(this.promotor,userData)
        }
        await this.setProfileData(userData);
        const redirectUrl = localStorage.getItem('redirectUrl') || '';
          if (redirectUrl && redirectUrl !== '/authenticate') 
          {
            localStorage.removeItem('redirectUrl'); // Clean up
            redirectUrl.replace("home","rotations");
            this.router.navigateByUrl(redirectUrl.replace("home","rotations"));
          }
          else
          {
            this.router.navigate(['']);
          }
      })
  }
async updateUserReferral(uid: string, ReadDataUser: any) {
  try {
    const userRef = this.afs.doc(`Users/${uid}`).ref;

    const updateData = {
      ReferralObject:{MyReferrals:{[ReadDataUser.uid]: {
        uid: ReadDataUser.uid,
        email: ReadDataUser.email,
        displayName: ReadDataUser.displayName,
        createdAt: timestamp
      }
    }}};
console.log("updateData--->",updateData)
   const rev=await userRef.set(updateData, { merge: true });

    console.log('ReferralObject → MyReferrals merged safely',rev);
  } catch (error) {
    console.error('Error updating referral:', error);
  }
}
  // Send email verfificaiton when new user sign up
  async SendVerificationMail() {
    return this.afAuth.auth.currentUser.sendEmailVerification()
      .then(() => {
        this.router.navigate(['authenticate']);
      })
  }

  // Reset Forggot password
  async ForgotPassword(passwordResetEmail) {
    return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
  }

  // Returns true when user is looged in and email is verified

  get isLoggedIn(): boolean {
  return !!(this.userData && this.userData.uid);
}

  get isEmailVerified(): boolean {
    const user = this.userData;
    if (!user)
      return false;
    else
      return true;
  }
  get isUserVerified(): boolean {
    const user = this.userData;
    if (!user || !user.Role || user.Role == "NA" || user.Role == "Default")
      return false;
    else
      return true;
  }
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  async ReadUserFromUID(uid: string): Promise<any | null> {
  try {
    const docRef = this.afs.doc(`Users/${uid}`).ref;
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn('User not found for UID:', uid);
      return null;
    }

    return docSnap.data();
  } catch (error) {
    console.error('Error reading user by UID:', error);
    return null;
  }
}

  async readUserData(user: any) {
    let results = await Promise.all([this.afs.doc(`Users/${user.uid}`).get().toPromise(), this.afs.doc(`UsersRoles/${user.uid}`).get().toPromise(), this.afs.doc(`UsersExtraData/${user.uid}`).get().toPromise()]);
    let docRef = results[0];
    let userRoleDocRef = results[1];
    if (!docRef.exists) { //Added to accomodate users who have registered aleady to Planner Login System
      let docRef2 = await this.afs.doc(`userInfo/${user.uid}`).get().toPromise();
      let display = user.displayName;
      if (docRef2.exists) {
        let data = docRef2.data();
        display = data.fname + " " + data.lname;
      }
      this.userData = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        Locked: "0",
        Role: "NA",
      }
      //We have sent a confirmation email to
      //this.setProfileData(this.userData);
    } else {
      this.userData = {
        ...{
          uid: user.uid,
          emailVerified: user.emailVerified
        },
        ...docRef.data(),
        ...userRoleDocRef.data(),
      };
    }
    let extraDocRef = results[2];
    if (!extraDocRef.exists) {
      this.userData.extraUsersData = false;
    } else {
      this.userData = {
        ...this.userData,
         ...extraDocRef.data(),
      };
      this.userData.extraUsersData = true;
    }
    localStorage.setItem('user', JSON.stringify(this.userData));
    JSON.parse(localStorage.getItem('user'));
  }
  async getMaxStudentUniqueId(collectionName: string): Promise<number> {
    try {
      const q = this.afs.collection(collectionName, ref =>
        ref.orderBy("StudentUniqueId", "desc").limit(1) // 🔹 Get highest StudentUniqueId
      );
  
      const querySnapshot = await q.get().toPromise();
      if (querySnapshot.empty) {
        console.log("No records found. Returning default 0.");
        return 0;
      }
  
      const maxStudentUniqueId = querySnapshot.docs[0].data().StudentUniqueId;
      console.log(`🎉 Max StudentUniqueId: ${maxStudentUniqueId}`);
      return maxStudentUniqueId;
    } catch (error) {
      console.error("❌ Error fetching max StudentUniqueId:", error);
      return 0;
    }
  }
  async setProfileData(userData: any) {
    const maxStudentUniqueId = await this.getMaxStudentUniqueId("Users");
    const newStudentUniqueId = maxStudentUniqueId ? maxStudentUniqueId + 1 : 1;
    let batch = this.afs.firestore.batch();
    if(userData.displayName)
      {
    let docRef = this.afs.doc(`Users/${userData.uid}`).ref;
    let userRoleDocRef = this.afs.doc(`UsersRoles/${userData.uid}`).ref;
    userData['StudentUniqueId']=newStudentUniqueId;
    userData.DisplayNamePre=userData.displayName;
    batch.set(docRef, userData, {
      merge: true
    });
    batch.set(userRoleDocRef, {
      uid: userData.uid,
      email: userData.email,
      source: 'register residency',
      createdAt:timestamp,
      StudentUniqueId:newStudentUniqueId,
      updatedAt:timestamp,
      DisplayNamePre: userData.DisplayNamePre,
      displayName: userData.DisplayNamePre,
      Role: "Default"
    }, {
      merge: true
    });
      this.http.post('https://addleadfromothersource-jwpx2jwsca-uc.a.run.app', {
        StudentEmail: userData.email,
        password: userData.password,
        StudentName: userData.displayName,
        phonecountrycode: userData.PhoneCountry,
        phone: userData.phone,
        nameofmedicalcollege:userData.NameOfMedicalSchool,
        countryofmedicalcollege:userData.CountryOfMedicalSchool
      }).toPromise()
      .then((response: any) => {
        console.log('Success Sent to lead Tracker:', response);
      })
      .catch((error) => {
        console.error('Error Sent to lead Tracker:', error);
      });
      await batch.commit();
    }
   
    
    this.userData = userData;
    localStorage.setItem('user', JSON.stringify(userData));
    JSON.parse(localStorage.getItem('user'));
    const referrer = sessionStorage.getItem('referrer') || 'Unknown';
        if(referrer==="aichat")
        {
          window.location.href = 'https://ai.usmlesarthi.com/'; 
          return;
        }
    return;
  }
  // Sign out 
  async SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.toastr.success("Signed out successfully");
      this.cookieService.delete('authToken', '/', '.usmlesarthi.com');
      this.router.navigate(['']);
    }).catch(err => {
      this.toastr.error("Error while logging out");
    })
  }

}
