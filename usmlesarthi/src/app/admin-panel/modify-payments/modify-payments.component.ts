import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { AdminServicesService } from '../services/admin-services.service';

@Component({
  selector: 'app-modify-payments',
  templateUrl: './modify-payments.component.html',
  styleUrls: ['./modify-payments.component.scss']
})
export class ModifyPaymentsComponent implements OnInit {
  loading: boolean = false;
  landing: string  = "";
  usersList: any[] = [];
  selectedUser: any = {};
  reportDateFrom : any;
  reportUsers: any[] = [];
  addNew: boolean = false;
  newUser: any   = {
    email : ''
  };
  constructor(private toastr: ToastrService, private dbService: AdminServicesService) { }

  async ngOnInit() {
    this.loading = true;
    this.resetNewUser();
    this.landing = "list";
    this.loading = false;
  }

  async fetchSome(userEmail){
    if(userEmail==""){
      this.toastr.info("Please write some prefix of users's email in the input");
      return;
    }
    try{
      this.usersList = [];
      this.loading = true;
      this.usersList = Object.values(
        {
          ...await this.dbService.getSomeUsers(userEmail),
          ...await this.dbService.getSomeUserPayments(userEmail)
        });
      this.usersList = [...new Map(this.usersList.map(item =>
        [item.email, item])).values()];
      this.reportUsers = [];
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while fetching users, please try again");
    }
  }

  async takeMeToUser(userEmail){
    try{
      this.loading = true;
      this.selectedUser = await this.dbService.getUserPaymentByEmail(userEmail);
      if (!this.selectedUser.email)
        this.selectedUser = {
          email : userEmail
        };
      this.landing = 'user';
      this.loading = false;
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while getting information about the user, please try again");
    }
  }

  async updatePayments(){
    try{
      await this.dbService.updateUserPayments(this.selectedUser, this.selectedUser.id);
      this.toastr.success("The payments has been updated for the user");
      await this.takeMeToUser(this.selectedUser.email);
    }
    catch(err){
      console.log(err.message);
      this.toastr.error("Error while saving the changes, please try again");
    }
  }


  async addNewUser(){
    if( this.validateNewUser() ){
      try{
        if(await this.dbService.checkIfUserPresent(this.newUser.email)){
          this.toastr.error("This email has already been registered, please navigate to Assign Roles to change his/her profile");
          return;
        }
        await this.dbService.addNewUserPaymentDoc(this.newUser.email);
        this.toastr.success("New User has been added");
        this.resetNewUser();
      }
      catch(err){
        console.log(err.message);
        this.toastr.error("Error while adding new user, please try again");
      }
    }
  }

  validateNewUser(){
    this.newUser.email = this.newUser.email.trim();
    if(this.newUser.email=="")
    {
      this.toastr.info("User Email cannot be empty");
      return false;
    }
    return true;
  }

  resetNewUser(){
    this.addNew = false;
    this.newUser =  {
      email: "",
    }
  }

  addElement(arrayKey){
    if (! this.selectedUser[arrayKey])
      this.selectedUser[arrayKey] = [];
    this.selectedUser[arrayKey].push({

    });
  }

  duplicateElement(arrayKey){
    if (! this.selectedUser[arrayKey])
      this.selectedUser[arrayKey] = [];
    const installments = this.selectedUser[arrayKey].length;
    let newInstallment = {};
    if (installments){
      const lastElement = this.selectedUser[arrayKey][installments-1];
      newInstallment = {...lastElement, received : "No"};
      const lastDate = lastElement.date;
      if (lastDate)
        newInstallment["date"] = {
          day: lastDate.day, month: lastDate.month+1, year: lastDate.year
        }
    }
    this.selectedUser[arrayKey].push(newInstallment);
  }

  deleteElement(index, arrayKey){
    this.selectedUser[arrayKey].splice(index, 1);
  }

  async generateReport(type? : string){
    try{
      this.loading = true;
      this.usersList = [];
      if (type==="all"){
        this.reportUsers = Object.values(await this.dbService.getSomeUserPaymentsByDate());
      }
      else{
        this.reportUsers = Object.values(await this.dbService.getSomeUserPaymentsByDate(new Date(Date.UTC(this.reportDateFrom.year, this.reportDateFrom.month - 1, this.reportDateFrom.day)).getTime()));
      }
      this.loading =false;
    }
    catch(err){
      this.loading =false;
      console.log(err.message);
      this.toastr.error("Error while fetching payments, please try again");
    }
  }

  exportReportToExcel(): void 
    {
      if(this.reportUsers.length==0){
        this.toastr.info("You cannot export an empty table");
        return;
      }
      let fileName = "PaymentsReport.xlsx";
       /* table id is passed over here */   
       let element = document.getElementById('Payments-List'); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, fileName);
			
    }

}
