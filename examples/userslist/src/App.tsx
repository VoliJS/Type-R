import { localStorageIO } from '@type-r/endpoints'
import { attributes, Linked, metadata, type } from '@type-r/models'
import { useIO, useLinked, useModel } from '@type-r/react'
import React, { ComponentProps, FormEvent } from 'react'
import Modal from 'react-modal'
import './App.css'

const Email = type( String )
    .check( x => !x || x.indexOf( '@' ) >= 0, 'Must be valid e-mail' );

type User = InstanceType<typeof User>
const User = attributes({
    name : type( String )
                .required
                .check( x => x.indexOf( ' ' ) < 0, 'Spaces are not allowed' ),

    email : type( Email ).required,
    isActive : true,

    [metadata] : {
        endpoint : localStorageIO( '/react-mvx/examples/userslist' )
    }
})

const AppState = attributes({
    users : [User]
})

export default () => {
    const state = useModel( AppState ),
        $editing = useLinked<User|null>( null );

    useIO( async () => {
        await state.users.fetch();
    });

    return (
        <div>
            <button onClick={ () => $editing.set( new User() )}>
                Add User
            </button>

            <Header/>

            { state.users.map( user => (
                <UserRow key={ user.cid }
                            user={ user }
                            onEdit={ () => $editing.set( user ) }
                />
            ) )}

            { $editing.value &&
                <Modal isOpen={true}>
                    <EditUser
                        $user={ $editing as Linked<User> }
                        onSave={ async user => {
                            state.users.add( user );
                            await user.save();
                        }}
                    />
                </Modal>
            }
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

const UserRow = ( { user, onEdit } :{
    user : User
    onEdit() : void
}) =>
    <div className="users-row" onDoubleClick={ onEdit }>
        <div>{ user.name }</div>
        <div>{ user.email }</div>
        <div onClick={ () => {
            user.isActive = !user.isActive;
            user.save();
        }}>
            { user.isActive ? 'Yes' : 'No' }</div>
        <div>
            <button onClick={ onEdit }>Edit</button>
            <button onClick={ () => user.destroy() }>X</button>
        </div>
    </div>

const EditUser = ({ $user, onSave }:{
    $user : Linked<User>,
    onSave?( user : User ) : void
}) => {
    const user = useModel.copy( $user.value );

    function onSubmit( e : FormEvent ){
        e.preventDefault();
        $user.value.assignFrom( user );
        onSave && onSave( $user.value );
        $user.null();
    }

    return (
        <form onSubmit={ onSubmit }>
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
 
            <button type="button" onClick={ $user.null }>
                Cancel
            </button>
        </form>
    );
}

const ValidatedInput = ({ $value, ...props }:{
    $value : Linked<string>
} & ComponentProps<'input'> ) => (
    <div>
        <input {...$value.props} { ...props } />
        <div className="validation-error">
            { $value.error || '' }
        </div>
    </div>
);