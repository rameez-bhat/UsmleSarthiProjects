import { ThrowStmt } from "@angular/compiler";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { AdminServicesService } from "../services/admin-services.service";

@Component({
  selector: "app-add-rotations",
  templateUrl: "./add-rotations.component.html",
  styleUrls: ["./add-rotations.component.scss"],
})
export class AddRotationsComponent implements OnInit {
  loading: boolean = false;
  landing: string = "";
  rotationsList: any = [];
  DoctorList: any = [];
  RotationListDoctor: any = {};
  selectedDoctorFromList: any = [];
  selectedRotation: any = {};
  addNew: boolean = false;
  newRotation: any = {};
  query: any = "";
  defaultVisaLetterText: any = `The Visa Invitation Letter comes from a US-based law firm 
partnered with Sarthi. The Visa Invitation letter fee is 
non-refundable $225. An additional $200 is required as an advance 
fee for the rotation, and it will be refunded after the start of 
your rotation. In case your visa is denied, the $200 advance will 
be adjusted for any other Sarthi services or you can do 
Telerotations.`;
  constructor(
    private toastr: ToastrService,
    private dbService: AdminServicesService
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.fetchDoctors();
    this.resetnewRotation();
    this.landing = "list";
    this.loading = false;
  }

  async fetchSome(rotation) {
    if (rotation == "") {
      this.toastr.info(
        "Please write some prefix of rotation's name, city or state in the input"
      );
      return;
    }
    try {
      this.rotationsList = [];
      this.loading = true;
      this.landing = "list";
      this.rotationsList = Object.values(
        await this.dbService.getSomeRotations(rotation)
      );
      this.query = rotation;
      this.loading = false;
    } catch (err) {
      console.log(err.message);
      this.toastr.error("Error while fetching rotations, please try again");
    }
  }
  async fetchDoctors() {

    try {
      this.rotationsList = [];
      this.loading = true;
      this.landing = "list";
      this.RotationListDoctor = await this.dbService.getListOfDoctors();
      this.DoctorList = Object.values(this.RotationListDoctor);
      console.log("DoctorList---->",this.DoctorList)
      console.log("RotationListDoctor---->",this.RotationListDoctor)
      this.loading = false;
    } catch (err) {
      console.log(err.message);
      this.toastr.error("Error while fetching Doctor List, please try again");
    }
  }

  async takeMeToList() {
    console.log("here you are")
    if (this.query) {
      await this.fetchSome(this.query);
      await this.fetchDoctors();
    } else {
      this.rotationsList = [];
      this.landing = "list";
    }
  }

  async takeMeToRotation(rotation) {
    try {
      this.loading = true;
      this.selectedRotation = {
        ...rotation,
        ...(await this.dbService.getRotationEmail(rotation)),
      };
      if(this.selectedRotation.DoctorDetails)
      {
        this.selectedRotation.doctorofrotation = [
  this.selectedRotation.DoctorDetails.id
];
      }
        
      this.landing = "rotation";
      this.loading = false;
    } catch (err) {
      console.log(err.message);
      this.toastr.error(
        "Error while getting information about the rotation, please try again"
      );
    }
  }

  async updateRotation() {
    if (this.validateRotation(this.selectedRotation)) {
      try {
        await this.dbService.updateRotation(this.selectedRotation);
        this.toastr.success("The rotation has been updated");
        await this.fetchSome(this.query);
      } catch (err) {
        console.log(err.message);
        this.toastr.error("Error while saving the changes, please try again");
      }
    }
  }

  /*async addNewRotation() {
    if (this.validateRotation(this.newRotation)) {
      try {
       // await this.dbService.addNewRotation(this.newRotation);
        this.toastr.success("New Rotation has been added");
        //this.resetnewRotation();
      } catch (err) {
        console.log(err.message);
        this.toastr.error("Error while adding new rotation, please try again");
      }
    }
  }*/
    async addNewRotation() {
      try {
        // Validate the new rotation (await since validateRotation is async)
        console.log("this.newRotation----->",this.newRotation)
        const isValid = await this.validateRotation(this.newRotation, true); // true indicates it's a new rotation
        if (!isValid) return; // Validation failed (toast already shown by validateRotation)
    
        this.loading = true;
        // Add the new rotation to database
        await this.dbService.addNewRotation(this.newRotation,this.RotationListDoctor);
        // Show success message
        this.toastr.success("New Rotation has been added successfully");
        // Reset the form and go back to list view
        //this.resetnewRotation();
       // await this.takeMeToList(); // Refresh the list
        
      } catch (err) {
        console.error('Error adding rotation:', err);
        this.toastr.error(
          err.message || "Error while adding new rotation, please try again"
        );
      } finally {
        this.loading = false;
      }
    }
  private validateRequiredFields(data: any, fields: string[]): boolean {
    for (const field of fields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        this.toastr.info(`Rotation ${this.camelize(field)} cannot be empty`);
        return false;
      }
    }
    return true;
  }
  
  private validateNumericFields(data: any, validations: {field: string, min?: number, max?: number}[]): boolean {
    for (const validation of validations) {
      const value = data[validation.field];
      if (validation.min !== undefined && value < validation.min) {
        this.toastr.info(`Rotation ${this.camelize(validation.field)} must be at least ${validation.min}`);
        return false;
      }
      if (validation.max !== undefined && value > validation.max) {
        this.toastr.info(`Rotation ${this.camelize(validation.field)} must be at most ${validation.max}`);
        return false;
      }
    }
    return true;
  }
  
  private camelize(string: string): string {
    return string.replace("_", " ").replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toUpperCase() : word.toLowerCase()
    ).replace(/\s+/g, ' ');
  }

  /*async validateRotation(dataObject) {
    function camlize(string: string) {
      string.replace("_", " ");
      return string[0].toUpperCase() + string.substr(1).toLowerCase();
    }
    let toCheck = [
      "title",
      "city",
      "state",
      "duration",
      "type",
      "specialty",
      "rotation_setting",
      "affiliations",
      "fee",
      "residency",
      "registration_fee",
      "visa_letter",
      "rounds",
      "lor_type",
      "description",
      "location_code",
      "admin_email",
      "rank",
      "zipCode",
    ];
    for (let key of toCheck) {
      if (key == "fee" || key == "registration_fee") {
        if (dataObject[key] <= 0) {
          this.toastr.info("Rotation Fee cannot be zero or negative");
          return false;
        }
      } else if (key == "rank") {
        if (dataObject[key] < 0) {
          this.toastr.info("Rank can be a positive number or put 999");
          return false;
        }
      } else {
        try {
          let data = dataObject[key] && dataObject[key].trim();
          let label = camlize(key);
          if (data === "") {
            this.toastr.info(`Rotation ${label} cannot be empty`);
            return false;
          }
        } catch (err) {}
      }
    }
   let result= await this.dbService.getRotationByWhere("location_code","==",dataObject.location_code);
   console.log("result--->",result.empty)
   if(!result.empty)
   {
    this.toastr.info(`Rotation ${dataObject.location_code} Already Exists`);
    return false;
   }
    return true;
  }*/
  async validateRotation(data: any, isNew: boolean = false): Promise<boolean> {
    /*const requiredFields = [
      "title", "city", "state", "duration", "type", "specialty", 
      "rotation_setting", "affiliations", "residency", "rounds", 
      "lor_type", "description", "location_code", "admin_email", "zipCode","doctorofrotation"
    ];*/
    const requiredFields = [
      "title", "city", "state", "duration", "type", "specialty", 
      "rotation_setting", "affiliations", "residency", "rounds", 
      "lor_type", "description", "location_code", "zipCode", "doctorofrotation","payment_to_physicians"
    ];

    console.log("data====>",data)
    const numericValidations = [
      { field: "fee", min: 0 },
      { field: "registration_fee", min: 0 },
      { field: "rank", min: 0 },
      { field: "visa_letter_cost", min: 0 }
    ];
  
    if (!this.validateRequiredFields(data, requiredFields) || 
        !this.validateNumericFields(data, numericValidations)) {
      return false;
    }
  
    if (isNew) {
      const result = await this.dbService.getRotationByWhere(
        "location_code", "==", data.location_code
      );
      if (!result.empty) {
        this.toastr.info(`Rotation ${data.location_code} Already Exists`);
        return false;
      }
    }
  
    return true;
  }
  async deleteRotation(rotation) {
    try {
      await this.dbService.deleteRotation(rotation);
      this.toastr.success("Deleted");
      this.rotationsList = this.rotationsList.filter(
        (item) => item.rotationId != rotation.rotationId
      );
    } catch (err) {
      console.log(err);
      this.toastr.error("Error while performing action, Please try again");
    }
  }

  resetnewRotation() {
    this.addNew = false;
    this.newRotation = {
      title: "",
      city: "",
      state: "",
      duration: "",
      type: "",
      specialty: "",
      rotation_setting: "",
      affiliations: "",
      fee: 0,
      residency: "",
      rounds: "",
      lor_type: "",
      description: "",
      location_code: "",
      admin_email: "",
      registration_fee: "",
      doctorofrotation:  [],
      payment_to_physicians: "",
      discount_amount: "",
      discount_month_from: "",
      discount_month_to: "",
      visa_letter: "",
      zipCode: "",
      payment_policy: "",
      refund_policy_link: "",
      visa_letter_cost: 0,
      program_director: "",
      rank: 999,
    };
  }
}
