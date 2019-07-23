import React from 'react'
import { useModel } from  "@type-r/react"
import { Collection, Store, define } from '@type-r/models';
import { attributesIO } from '@type-r/endpoints';

import { User } from './user'

@define class MyStore extends Store {
    static endpoint = attributesIO()
    static attributes = {
        users : Collection.of( User )
    }
}

const Main = exposeStore( MyStore, 
    ({ store }) => {
        const isReady = useIO( () => store.fetch() );

        return isReady ?
                <table>
                    { store.users.map( user => 
                        <tr key={ user.cid }>
                            <td>{ user.id }</td>
                            <td>{ user.name }</td>
                            <td>{ user.email }</td>
                            <td>
                                <checkbox checked={user.active}
                                          onChange={ ({ target }) => user.active = target.value }/>
                                
                            </td>
                        </tr>
                    )}
                </table>
            :
                <div>Loading...</div>
    }
);