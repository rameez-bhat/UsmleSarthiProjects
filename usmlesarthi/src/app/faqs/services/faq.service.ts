import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  faqs: any = {};
  fetched: boolean = false;

  constructor(private firestore: AngularFirestore) { }

  async getAllQuestions (){
    if (this.fetched)
      return this.faqs;
    let docsRef = await this.firestore.collection("FAQs").get().toPromise();
    for(let doc of docsRef.docs){
      let data = doc.data();
      if (this.faqs[data.topic])
        this.faqs[data.topic].push(data);
      else
        this.faqs[data.topic] = [data];
    }
    this.fetched = true;
    return this.faqs;
  }
}
