import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../common/authentication.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { medicalSchoolOptions } from './MedicalSchoolOptions';
import { CountryWithStates } from './countriesWithStates';

medicalSchoolOptions.push("Other");

function buildNext4Years() {
  const currentDate = new Date();
  const currentYearT = currentDate.getFullYear();

const currentYear = currentYearT + 1;

  const dateStrings = [];

  for (let i = 0; i < 6; i++) {
    const year = currentYear + i;
    const dateString = `${year}`;
    dateStrings.push(dateString);
  }

  return dateStrings;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  landing: string;
  loading: boolean = false;
  phoneError : boolean = false;
  phone : string = '';
  phoneNumber: string = '';
  countryPhoneOptions: any[] = [];
  countryOptions: any[] = [];
  selectedPhoneCountry: any;
  selectedCountry: any;

  medicalSchoolOptions: string[] = medicalSchoolOptions || [];
  medicalSchoolOptionsList: any[] = [];
  yearOfApplytingOptions: string[] = buildNext4Years();
  otherMedicalSchool: string = '';

  selectedMedicalSchool: any;

  constructor( public authService: AuthenticationService, private router: Router, private toast: ToastrService) { }

  ngOnInit() {
    this.findLanding();
    this.loadCountries(); 
  }
  loadCountries() {
    /*this.countryOptions = Object.keys(CountryWithStates).map((key) => ({
      value: key,
      label: CountryWithStates[key].name,
      flag: `https://flagcdn.com/w320/${CountryWithStates[key].code2.toLowerCase()}.png`,
      phoneCode: CountryWithStates[key].phoneCode,
    }));*/
    this.countryOptions = CountryWithStates.map(country => ({
      value: country.value,
      label: country.label,
      flag: country.flag,
      phoneCode: country.phoneCode,
      "FieldName":"CountryOfMedicalSchool",
    }));
    this.countryPhoneOptions = CountryWithStates.map(country => ({
      value: country.value,
      label: "("+country.phoneCode+")"+country.value,
      flag: country.flag,
      phoneCode: country.phoneCode,
    }));
    this.selectedPhoneCountry = this.countryPhoneOptions.find(c => c.value === 'IN');
    console.log("this.selectedPhoneCountry--->",this.selectedPhoneCountry)
  }
  updateFullPhoneNumber() {
    if (this.selectedPhoneCountry.phoneCode && this.phoneNumber) {
      this.phone = `${this.selectedPhoneCountry.phoneCode}${this.phoneNumber}`;
    }
  }
  validatePhoneNumber = (phoneNumber,Country) => {
    // List of possible phone number lengths for different countries (excluding country code)
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];

    // Remove all non-digit characters from the input
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    // Check if the length of the cleaned number is valid
    if (!validLengths.includes(cleanedNumber.length)) {
      return false;
    }

    try {
      // Use a dummy country code 'US' for parsing the number as libphonenumber-js requires a country code
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, Country);
      return parsedNumber && parsedNumber.isValid();
    } catch (e) {
      return false;
    }
  };
  onCountryChange(selectedCountryLabel: any) {
    // Find the full object based on the label
    this.selectedCountry = this.countryOptions.find(
      (country) => country.label === selectedCountryLabel.label
    );
    console.log('selectedCountryLabel===>', selectedCountryLabel);
    console.log('selectedCountry===>', this.selectedCountry);
    console.log('this.phone===>', this.phone);
  
    if (this.selectedCountry.label) {
      // Filter medical schools based on the selected country
      const filteredSchools = medicalSchoolOptions.filter((college) =>
        college.includes(`, ${this.selectedCountry.label}`)
      );
  
      // Map filtered options for ng-select
      this.medicalSchoolOptionsList = [
        ...filteredSchools.map((college) => ({
          value: college,
          label: college,
        })),
        { value: 'Other', label: 'Other' },
      ];
    } else {
      this.medicalSchoolOptionsList = []; // Reset if no country is selected
    }
  }

  async findLanding()
  {
    this.landing = "Login";
    let  userData = JSON.parse(localStorage.getItem('user'));
    console.log("userData----->",userData)
    if(userData!= null && userData.emailVerified==false)
    {
      this.landing = "Verify Email";
      return;
    }
    else if(userData!= null && (userData.Role=="NA" || userData.Role=="Default"))
    {
      this.landing = "Verify User";
      return;
    }
    else if(userData!= null)
    {
      this.router.navigate(['']);
      return;
    }
  }

  async signIn(email: string, password: string)
  {
    this.loading= true;
    await this.authService.SignIn(email, password).then(()=>{
      this.findLanding();
      this.toast.success("Welcome to USMLESarthi");
    })
    .catch(
      (err) => {
        this.toast.error("Please check the credentials again");
      }
    )
    this.loading= false;
  }

  hasError(errEvent){
    this.phoneError = !errEvent;
  }

  /*getNumber(number){
    this.phone = number;
  }*/
  onPhoneCountryChange(selected: any) 
  {
      this.selectedPhoneCountry = selected;
      this.updateFullPhoneNumber();
    }
  getNumber(event: string) {
    this.phoneNumber = event;
    this.updateFullPhoneNumber();
  }


  async register(email: string, password: string, repassword: string, name: string, yearOfApplying : string)
  {
    if (!email || !password || !repassword || !name || !yearOfApplying){
      return;
    }
    if(!this.phoneNumber)
      {
        this.toast.error("Please Enter Student Phone Number.");
        return;
      }
      else if(this.phoneNumber && !this.validatePhoneNumber(this.phoneNumber,this.selectedPhoneCountry.value))
      {
        this.toast.error("Please Enter A Valid Phone Number (Without Country Code).");
        return;
      }
      if(!this.selectedPhoneCountry)
      {
        this.toast.error("Select Country Code.");
        return;
      }
      if (!this.selectedMedicalSchool){
        this.toast.error("Select a Medical School");
        return;
      }
      if (!yearOfApplying){
        this.toast.error("Select Year of applying for residency");
        return;
      }
    if (this.selectedMedicalSchool === "Other" && !this.otherMedicalSchool){
      return;
    }
    this.loading=true;
    const medicalSchoolName = this.selectedMedicalSchool === "Other" ? this.otherMedicalSchool : this.selectedMedicalSchool;
    if (password==repassword){
      await this.authService.SignUp(email, password, name, this.phone, medicalSchoolName, yearOfApplying,this.selectedCountry, this.phoneNumber, this.selectedPhoneCountry, this.otherMedicalSchool).then(()=>{
        this.findLanding();
        this.toast.success("You are successfully registered","Hello "+ name);
    }).catch(
      (err: any) => {
        this.toast.error("Error while registering: "+err.message);
      }
    )
    }
    else{
      this.toast.error("Your password don't match re-entered password");
    }
    this.loading=false;
  }
  async sendVerificationEmail()
  {
    this.loading = true;
    try {
      await this.authService.SendVerificationMail(); 
      this.toast.success("Verification Email has been sent.")
    }
    catch(error){
      this.toast.error("Error while sending verification email: "+error.message);
    }
    this.loading=false;
  }
  async forgetPassword(email: string)
  {
    this.loading=true;
    try{
      await this.authService.ForgotPassword(email);
      this.toast.success("Email has been sent for password resetting.")
    }
    catch(error){
      this.toast.error(error.message);
    }
    this.loading=false;
  }

}
