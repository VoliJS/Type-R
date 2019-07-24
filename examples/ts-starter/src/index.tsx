import React from 'react'
import { useModel } from  "@type-r/react"
import { Collection, Store, define } from '@type-r/models';
import { attributesIO } from '@type-r/endpoints';

import { User } from './user'
import { Model } from '@type-r/models/src';

const Main = WrapComponent
    .state({
        a : 0,
    })
    .render(({ state }) => {
        const users = useCollection.of( User ),
            isReady = useIO( () => users.fetch() );

        return isReady ?
                <table>
                    { store.users.map( user => 
                        <tr key={ user.cid }>
                            <td>{ user.id }</td>
                            <td>{ user.name }</td>
                            <td>{ user.email }</td>
                            <td>
                                <checkbox { ...user.$.checked }/>
                            </td>
                        </tr>
                    )}
                </table>
            :
                <div>Loading...</div>
    }
);

class ModelAttributeRefs {
    _model : Model;
    
    get name(){
        return this.name || ( this.name = new ModelLink( this._model, name ) );
    }
}