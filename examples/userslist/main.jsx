import './main.css'
import ReactDOM from 'react-dom'

import React from 'react'
import { Model, define } from '@type-r/models'
import { localStorageIO } from '@type-r/endpoints'

import Modal from 'react-modal'

const Email = type( String )
                .check( x => !x || x.indexOf( '@' ) >= 0, 'Must be valid e-mail' );

@define class User extends Model {
    static attributes = {
        name : type( String )
                    .required
                    .check( x => x.indexOf( ' ' ) < 0, 'Spaces are not allowed' ),

        email : type( Email ).required,
        isActive : true
    }

    remove(){ this.collection.remove( this ); }
}

@define class AppState extends Model {
    static endpoint = localStorageIO( '/react-mvx/examples' );

    static attributes = {
        id : 'users-list',
        users   : Collection.of( User ), // No comments required, isn't it?
        editing : User.memberOf( 'users' ), // User from user collection, which is being edited.
        adding  : refTo( User ) // New user, which is being added.
    }
}


const UsersList = () => {
    const state = useModel( AppState );

    useIO( async () => {
        window.onunload = () => state.save();

        await state.fetch();
    });

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
                <EditUser $user={ state.$.adding }
                            onSave={ () => state.users.add( state.adding ) }/>
            </Modal>

            <Modal isOpen={ Boolean( state.editing ) }>
                <EditUser $user={ state.$.editing } />
            </Modal>
        </div>
    );
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

const EditUser = ({ $user, onSave }) => {
    const user = useModel( User );

    useEffect( () => {
        user.assignFrom( $user.value );
    }, [ $user.value ] );

    onSubmit =  e => {
        e.preventDefault();
        $user.value.assignFrom( user );
        onSave && onSave( $user.value );
        this.onCancel()
    }

    return (
        <form onSubmit={ this.onSubmit }>
            <label>
                Name: <ValidatedInput type="text" $value={ user.$.name }/>
            </label>

            <label>
                Email: <ValidatedInput type="text" $value={ user.$.email }/>
            </label>

            <label>
                Is active: <input type="checkbox" { ...user.$.isActive.props }/>
            </label>

            <button type="submit" disabled={ !user.isValid() }>
                Save
            </button>
 
            <button type="button" onClick={ () => $user.set( null ) }>
                Cancel
            </button>
        </form>
    );
}

const ValidatedInput = ({ $value, ...props }) => (
    <div>
        <input {...$value.props} { ...props } />
        <div className="validation-error">
            { $value.error || '' }
        </div>
    </div>
);

ReactDOM.render( <UsersList />, document.getElementById( 'app-mount-root' ) );
