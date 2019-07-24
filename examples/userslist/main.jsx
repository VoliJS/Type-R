import './main.css'
import ReactDOM from 'react-dom'

import React, { Link } from 'react-mvx'
import { Record, define } from 'type-r'
import { localStorageIO } from 'type-r/endpoints/localStorage'

import Modal from 'react-modal'

const Email = String.has.check( x => !x || x.indexOf( '@' ) >= 0, 'Must be valid e-mail' );

@define class User extends Record {
    static attributes = {
        name : String.isRequired
                    .has.check( x => x.indexOf( ' ' ) < 0, 'Spaces are not allowed' ),

        email : Email.isRequired,

        isActive : true
    }

    remove(){ this.collection.remove( this ); }
}

@define class AppState extends Record {
    static endpoint = localStorageIO( '/react-mvx/examples' );

    static attributes = {
        id : 'users-list',
        users   : User.Collection, // No comments required, isn't it?
        editing : User.from( 'users' ), // User from user collection, which is being edited.
        adding  : User.shared.value( null ) // New user, which is being added.
    }
}

@define
export class UsersList extends React.Component {
    static State = AppState;

    componentWillMount(){
        this.state.fetch();
        window.onunload = () => this.state.save();
    }

    render(){
        const { state } = this;

        return (
            <div>
                <button onClick={ () => state.adding = new User() }>
                    Add User
                </button>

                <Header/>

                { state.users.map( user => (
                    <UserRow key={ user.cid }
                             user={ user }
                             onEdit={ () => state.editing = user }
                    />
                ) )}

                <Modal isOpen={ Boolean( state.adding ) }>
                    <EditUser userLink={ state.linkAt( 'adding' ) }
                              onSave={ () => state.users.add( state.adding ) }/>
                </Modal>

                <Modal isOpen={ Boolean( state.editing ) }>
                    <EditUser userLink={ state.linkAt( 'editing' ) } />
                </Modal>
            </div>
        );
    }
}

const Header = () =>(
    <div className="users-row">
        <div>Name</div>
        <div>Email</div>
        <div>Is Active</div>
        <div/>
    </div>
);

const UserRow = ( { user, onEdit } ) =>(
    <div className="users-row" onDoubleClick={ onEdit }>
        <div>{ user.name }</div>
        <div>{ user.email }</div>
        <div onClick={ () => user.isActive = !user.isActive }>
            { user.isActive ? 'Yes' : 'No' }</div>
        <div>
            <button onClick={ onEdit }>Edit</button>
            <button onClick={ () => user.remove() }>X</button>
        </div>
    </div>
);

@define class EditUser extends React.Component {
    static props = {
        userLink    : Link.has.watcher( React.assignToState( 'user' ) ),
        onSave : Function
    };

    static state = {
        user : User
    };

    onSubmit =  e => {
        e.preventDefault();

        const { userLink, onSave } = this.props;

        userLink.value.assignFrom( this.state.user );
        onSave && onSave( userLink.value );
        this.onCancel()
    }

    onCancel = () => this.props.userLink.set( null );

    render(){
        const { user } = this.state,
                linked = user.linkAll();

        return (
            <form onSubmit={ this.onSubmit }>
                <label>
                    Name: <ValidatedInput type="text" valueLink={ linked.name }/>
                </label>

                <label>
                    Email: <ValidatedInput type="text" valueLink={ linked.email }/>
                </label>

                <label>
                    Is active: <input type="checkbox" { ...linked.isActive.props }/>
                </label>

                <button type="submit" disabled={ !user.isValid() }>
                    Save
                </button>
                <button type="button" onClick={ this.onCancel }>
                    Cancel
                </button>
            </form>
        );
    }
}

const ValidatedInput = ({ valueLink, ...props }) => (
    <div>
        <input {...valueLink.props} { ...props } />
        <div className="validation-error">
            { valueLink.error || '' }
        </div>
    </div>
);

ReactDOM.render( <UsersList />, document.getElementById( 'app-mount-root' ) );
