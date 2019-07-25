import { Record, define } from 'type-r'

@define class ToDoCollection extends Record.Collection {
	clearCompleted(){
		this.remove( this.filter( todo => todo.done ) );
	}

	get allDone(){
		return this.every( todo => todo.done );
	}

	set allDone( val ){
		this.updateEach( todo => todo.done = val );
	}

	get activeCount(){
		return this.filter( todo => !todo.done ).length;
	}
}

@define
export class ToDo extends Record {
	static Collection = ToDoCollection;
	static attributes = {
		done : Boolean,
		desc : String
	}

	remove(){
		this.collection.remove( this );
	}
}
