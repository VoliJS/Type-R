import React from 'react'
import ReactDOM from 'react-dom'
import { define, Model } from '@type-r/models'
import { useCollection } from '@type-r/react'

import './styles.css'

@define class Item extends Model {
    static attributes = {
        text : String
    }
}

const Application = () => {
    const items = useCollection.of( Item );

    return (
        <div>
            <button onClick={ () => items.add({}) }>
                Add
            </button>
            
            { items.map( item => (
                <ItemView key={ item.cid } item={ item } /> 
            ))}
        </div>
    );
}

const ItemView = ({ item }) => (
    <input { ...item.$.text.props } /> 
);

ReactDOM.render( <Application/>, document.getElementById( 'react-application' ) );