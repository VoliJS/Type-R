import React from 'react'
import ReactDOM from 'react-dom'
import { define, Model, type } from '@type-r/models'
import { useCollection } from '@type-r/react'

import './styles.css'

const Identifier = type( String ).check( x => x.match( /^\w+$/ ), 'No spaces allowed' );

@define class Item extends Model {
    static attributes = {
        text : type( Identifier ).required
    }
}

const Application = () => {
    const items = useCollection.of( Item );

    return (
        <div>
            <button onClick={ () => items.add({ text : '' }) }>
                Add
            </button>
            
            { items.map( item =>
                <ValidatedInput key={ item.cid } $value={ item.$.text } /> 
            )}
        </div>
    );
}

const ValidatedInput = ({ $value }) => (
    <div>
        <input { ...$value.props } /> 
        <span>{ $value.error || '' }</span>
    </div>
    
);

ReactDOM.render( <Application/>, document.getElementById( 'react-application' ) );