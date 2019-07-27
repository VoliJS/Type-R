import React from 'react'
import { Collection } from "@type-r/models"
import { useLink, pureRenderProps } from "@type-r/react"
import cx from 'classnames'
import { ToDo } from './model'

export const TodoList = 
    pureRenderProps({
        todos      : Collection.of( ToDo ),
        filterDone : Boolean
    },
    ({ todos, filterDone }) => {
        const $editing = useLink( null ),
            filtered = filterDone === null ?
                            todos.models :
                            todos.filter( todo => todo.done === filterDone );

        return (
            <section className="main">
                <input type="checkbox"
                    className="toggle-all"
                    id="toggle-all"
                    { ...todos.$allDone.props } />

                <label htmlFor="toggle-all">
                    Mark all as complete
                </label>

                <ul className="todo-list">
                    { filtered.map( todo => (
                        <TodoItem key={ todo.cid }
                                todo={ todo }
                                $editing={ $editing }/>
                    ) )}
                </ul>
            </section>
        );
    });

function clearOnEnter( x, e ){
    if( e.keyCode === 13 ) return null;
}

const TodoItem = ( { todo, $editing } ) =>{
    const editing   = $editing.value === todo,
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
                       { ...todo.$.done.props }/>

                <label onDoubleClick={ $editing.action( () => todo ) }>
                    { todo.desc }
                </label>

                <button className="destroy"
                        onClick={ () => todo.remove() } />
            </div>

            { editing && <input className="edit"
                                { ...todo.$.desc.props }
                                autoFocus={ true }
                                onBlur={ $editing.action( () => null ) }
                                onKeyDown={ $editing.action( clearOnEnter ) }/> }
        </li>
    );
};
