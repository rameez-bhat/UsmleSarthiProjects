import { Injectable } from '@angular/core';
import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Program } from '../models/program';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  collectionRef: AngularFirestoreCollection<Program[]>;
  programList  : Program[] = [];
  constructor(private firestore: AngularFirestore) { 
    this.collectionRef = this.firestore.collection("Program");
  }

  async getProgramList()
  {
    this.programList = [];
      let docs = await this.collectionRef.get().toPromise();
      this.programList = [];
      for( var i in docs.docs){
        let doc  = docs.docs[i];
        let data = doc.data();
        data.PId = doc.id;
        this.programList.push(data as Program);
    }
    this.programList.sort((a, b) => Number(a.order) - Number(b.order));
    return this.programList;
  }
  async getProgramObject(){
    await this.getProgramList();
    let programs = {}
    for(let i in this.programList)
    {
      let data = this.programList[i];
      programs[data.PId] = data;
    }
    return programs;
  }
}
