import { Component, OnInit } from '@angular/core';
import { FaqService } from './services/faq.service';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {

  topics : any = [];
  questions : any = {};
  loading : boolean = false;
  selectedTopic : any = "";

  constructor(private dbService: FaqService) { }

  

  async ngOnInit() {
    this.loading = true;
    this.questions = await this.dbService.getAllQuestions();
    this.topics   = Object.keys(this.questions);
    this.selectedTopic = this.topics[0];
    this.loading  = false;
  }

}
