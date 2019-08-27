import { Component, OnInit } from '@angular/core';
import { TodoStoreService } from '../services/todo-store.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {

  private currentStatus = '';

  constructor(private todoStore: TodoStoreService, private route: ActivatedRoute) {

    this.currentStatus = '';
  }

  ngOnInit() {

    this.route.paramMap.subscribe((params:ParamMap) =>{
      this.currentStatus =params.get('status');
    });
    /*
    this.route.params.map(params => params.status)
      .subscribe((status) => {
        this.currentStatus = status;
      });
      */
  }

  remove(uid) {
    this.todoStore.remove(uid);
  }

  update() {
    this.todoStore.persist();
  }

  getTodos() {
    
    if (this.currentStatus === 'completed') {
      return this.todoStore.getCompleted();
    } else if (this.currentStatus === 'active') {
      return this.todoStore.getRemaining();
    } else {
      return this.todoStore.todos;
    }
  }

  allCompleted() {
    return this.todoStore.allCompleted();
  }

  setAllTo(toggleAll) {
    this.todoStore.setAll(toggleAll.checked);
  }

}
