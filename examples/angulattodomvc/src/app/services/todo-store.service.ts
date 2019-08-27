import { Injectable } from '@angular/core';
import { ToDo, ToDos } from '../model/ToDo';

@Injectable({
  providedIn: 'root'
})
export class TodoStoreService {

  todos = ToDos;

  constructor() {

  }

  get(isCompleted: boolean): ToDo[] {
    return this.todos.filter((todo) => todo.completed === isCompleted);
  }

  getCompleted(): ToDo[] {
    return this.get(true);
  }

  allCompleted() {
    return this.todos.length === this.getCompleted().length;
  }

  getRemaining() {
    return this.get(false);
  }

  add(title: string) {
    const newtodo = new ToDo({ title });
    this.todos.add(newtodo);
  }

  remove(id) {
    this.todos.get(id).destroy();
  }

  removeCompleted() {
    this.getCompleted().map(todo => todo.destroy());

  }

  persist() {

  }

  setAll(isCompleted: boolean) {
    this.todos.map(todo => todo.completed = isCompleted);
  }


}


