import { Component, OnInit } from '@angular/core';
import { TodoStoreService } from '../services/todo-store.service';

@Component({
  selector: 'app-todo-header',
  templateUrl: './todo-header.component.html',
  styleUrls: ['./todo-header.component.css']
})
export class TodoHeaderComponent implements OnInit {

  newTodo = '';
  constructor(private todoStoreService: TodoStoreService) { }

  addTodo() {
   
    if (this.newTodo.trim().length){
      console.log ('Add Todo');
      this.todoStoreService.add(this.newTodo);
      this.newTodo = '';
      console.log(this.todoStoreService.todos);
    }
  }

  ngOnInit() {
  }

}
