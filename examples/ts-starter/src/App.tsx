import { attributes, value } from '@type-r/models'
import { Linked, useModel } from '@type-r/react'
import React from 'react'
import './App.css'

const State = attributes({
    items : [{
      text : value('').required
    }]
})

export default () => {
    const state = useModel( State );

    return (
        <div>
            <button onClick={ () => state.items.add({ text : '' }) }>
                Add
            </button>
            
            { state.items.map( item =>
                <ValidatedInput key={ item.cid } $value={ item.$.text } /> 
            )}
        </div>
    );
}

const ValidatedInput = ({ $value } : {
    $value : Linked<string>
}) =>
    <div>
        <input { ...$value.props } /> 
        <span>{ $value.error || '' }</span>
    </div>