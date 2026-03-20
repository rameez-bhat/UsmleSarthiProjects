import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ObservershipService {

  hospitals: any = {};
  hospitalsFetched: boolean = false;

  constructor(private firestore: AngularFirestore) { }

  async getAllHospitals(){
    if( ! this.hospitalsFetched ){
      this.hospitals = {}; 
      let docsRef = await this.firestore.collection("Observership").get().toPromise();
      for (let doc of docsRef.docs){
        let data = doc.data();
        data.Speciality = data.Speciality.trim();
        data.Rotation   = data.Rotation.trim();
        data.Duration   = data.Duration.trim();
        data.City       = data.City.trim();
        data.State      = data.State.trim();
        if(data.Date)
          data.Date = new Date(data.Date).toDateString();
        else
          data.Date = new Date("01-01-2018").toDateString();
        this.hospitals[data.id] =data;
      }
      this.hospitalsFetched = true;
    }
    return Object.values(this.hospitals);
  }

}
