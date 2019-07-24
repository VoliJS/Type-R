import React, { define } from 'react-mvx'
import cx from 'classnames'
import { ToDo } from './model'

@define export default
class TodoList extends React.Component {
    static props = {
        todos      : ToDo.Collection,
        filterDone : Boolean
    }

    static state = {
        editing : ToDo.from( '^props.todos' )
    }

    static pureRender = true

    render(){
        const { todos, filterDone } = this.props,
              filtered = filterDone === null ?
                            todos.models :
                            todos.filter( todo => todo.done === filterDone ),
              editingLink = this.state.linkAt( 'editing' );

        return (
            <section className="main">
                <input type="checkbox"
                       className="toggle-all"
                       id="toggle-all"
                       { ...todos.linkAt( 'allDone' ).props } />

                <label htmlFor="toggle-all">
                    Mark all as complete
                </label>

                <ul className="todo-list">
                    { filtered.map( todo => (
                        <TodoItem key={ todo.cid }
                                  todo={ todo }
                                  editingLink={ editingLink }/>
                    ) )}
                </ul>
            </section>
        );
    }
}

function clearOnEnter( x, e ){
    if( e.keyCode === 13 ) return null;
}

const TodoItem = ( { todo, editingLink } ) =>{
    const editing   = editingLink.value === todo,
          className = cx( {
              'completed' : todo.done,
              'view'      : !todo.done,
              'editing'   : editing
          } );

    return (
        <li className={ className }>
            <div className="view">
                <input type="checkbox"
                       className="toggle" 
                       { ...todo.linkAt( 'done' ).props }/>

                <label onDoubleClick={ editingLink.action( () => todo ) }>
                    { todo.desc }
                </label>

                <button className="destroy"
                        onClick={ () => todo.remove() } />
            </div>

            { editing && <input className="edit"
                                { ...todo.linkAt( 'desc' ).props }
                                autoFocus={ true }
                                onBlur={ editingLink.action( () => null ) }
                                onKeyDown={ editingLink.action( clearOnEnter ) }/> }
        </li>
    );
};
