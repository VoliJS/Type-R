import '../css/app.css'
import React from 'react'
import { define, Model, Collection, type } from '@type-r/models'
import { useModel, useIO } from '@type-r/react'
import ReactDOM from 'react-dom'
import {ToDo} from './model.js'
import { TodoList } from './todolist.jsx'
import { Filter } from './filter.jsx'
import { AddTodo } from './addtodo.jsx'

import { localStorageIO } from '@type-r/endpoints'

// Declare component state
@define class AppState extends Model {
    static endpoint = localStorageIO( '/react-mvx/examples' );

    static attributes = {
        id         : 'todoMVC',
        todos      : Collection.of( ToDo ),
        filterDone : type( Boolean ).value( null ) // null | true | false, initialized with null.
    }
}

const App = () => {
    const state = useModel( AppState );

    useIO( async () => {
        window.onunload = () => state.save();

        await state.fetch();
    })
   
    const { todos, filterDone } = state,
            hasTodos = Boolean( todos.length );

    return (
        <div>
            <section className="todoapp">
                <AddTodo onEnter={ desc => todos.add({ desc : desc }) }/>

                { hasTodos && <TodoList todos={ todos }
                                        filterDone={ filterDone }/> }

                { hasTodos && <Filter count={ todos.activeCount }
                                        $filter={ state.$.filterDone }
                                        onClear={ () => todos.clearCompleted() }
                />}
            </section>

            <footer className="info">
                <p>Double-click to edit a todo</p>
                <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
                <p>Created by <a href="http://todomvc.com">Vlad Balin</a></p>
                <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
            </footer>
        </div>
    );
}

ReactDOM.render( <App />, document.getElementById( 'app-mount-root' ) );