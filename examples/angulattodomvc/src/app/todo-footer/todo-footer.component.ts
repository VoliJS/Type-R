import { Component, OnInit } from '@angular/core';
import { TodoStoreService } from '../services/todo-store.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-todo-footer',
  templateUrl: './todo-footer.component.html',
  styleUrls: ['./todo-footer.component.css']
})
export class TodoFooterComponent implements OnInit {

  currentStatus = '';
  constructor(private todoStoreService: TodoStoreService, private route: ActivatedRoute) { }


  ngOnInit() {
    
    this.route.paramMap
    /*
    this.route.params
      .map(params => params.status)
      .subscribe((status) => {
        this.currentStatus = status || '';
      });
      */
  }

  removeCompleted() {
    this.todoStoreService.removeCompleted();
  }

  getCount() {
    return this.todoStoreService.todos.length;
  }

  getRemainingCount() {
    return this.todoStoreService.getRemaining().length;
  }

  hasCompleted() {
    return this.todoStoreService.getCompleted().length > 0;
  }

}
