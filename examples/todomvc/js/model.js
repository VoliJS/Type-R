import { Model, Collection, define, Linked } from '@type-r/models'

@define class ToDoCollection extends Collection {
	clearCompleted(){
		this.remove( this.filter( todo => todo.done ) );
	}

	get $allDone(){
		return Linked.value(
			this.every( todo => todo.done ),
			x => this.updateEach( todo => todo.done = x )
		);
	}

	get activeCount(){
		return this.filter( todo => !todo.done ).length;
	}
}

@define
export class ToDo extends Model {
	static Collection = ToDoCollection;
	static attributes = {
		done : Boolean,
		desc : String
	}

	remove(){
		this.collection.remove( this );
	}
}
