import React, { define } from 'react-mvx'

@define
export default class AddTodo extends React.Component {
    static props = {
        onEnter : Function.value( function(){} )
    }

    static state = {
        desc : String
    }

    render(){
        return (
            <header className="header">
                <h1>todos</h1>

                <input className="new-todo"
                       placeholder="What needs to be done?"
                       autoFocus
                       { ...this.linkAt( 'desc' ).props }
                       onKeyDown={ e => this.onKeyDown( e ) }
                />
            </header>
        );
    }

    onKeyDown( { keyCode } ){
        if( keyCode === 13 ){
            let { state, props } = this;

            state.desc && props.onEnter( state.desc );
            state.desc = "";
        }
    }
}