import '../css/app.css'
import React, { define } from 'react-mvx'
import { Record } from 'type-r'
import ReactDOM from 'react-dom'
import {ToDo} from './model.js'
import TodoList from './todolist.jsx'
import Filter from './filter.jsx'
import AddTodo from './addtodo.jsx'

import { localStorageIO } from 'type-r/endpoints/localStorage'

// Declare component state
@define class AppState extends Record {
    static endpoint = localStorageIO( '/react-mvx/examples' );

    static attributes = {
        id         : 'todoMVC',
        todos      : ToDo.Collection,
        filterDone : Boolean.value( null ) // null | true | false, initialized with null.
    }
}

@define class App extends React.Component {
    static State = AppState;

    componentWillMount(){
        this.state.fetch();
        window.onunload = () => this.state.save();
    }

    render(){
        const { todos, filterDone } = this.state,
              hasTodos = Boolean( todos.length );

        return (
            <div>
                <section className="todoapp">
                    <AddTodo onEnter={ desc => todos.add({ desc : desc }) }/>

                    { hasTodos && <TodoList todos={ todos }
                                            filterDone={ filterDone }/> }

                    { hasTodos && <Filter count={ todos.activeCount }
                                          filterLink={ this.state.linkAt( 'filterDone' ) }
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
}

ReactDOM.render( <App />, document.getElementById( 'app-mount-root' ) );

