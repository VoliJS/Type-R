import './styles.css'
import React from 'react'
import ReactDOM from 'react-dom'

import { define, Model, Collection } from '@type-r/models'
import { localStorageIO } from '@type-r/endpoints'
import { useModel, useIO, pureRenderProps } from '@type-r/react'

// Import checklist model definition. Think of "model" as of an observable serializable class.
import { ChecklistItem } from './model'

// Local counter to help us count top-level renders.
let _renders = 0;

// Type-R model for the state.
@define class AppState extends Model {
    // The state is persisted in localStorage
    static endpoint = localStorageIO( "/@type-r/react/examples" );

    static attributes = {
        id : "checklistTree", // Persistent record needs to have an id
        items : Collection.of( ChecklistItem )
    }
}

// @define should be places before every class definition, which uses react-mvx features.
const App = () => {
    const state = useModel( AppState );

    // Save and restore state.
    const isReady = useIO( async () => {
        window.onunload = () => state.save();
        
        await state.fetch();
    });

    return isReady ?
        <div>
            <div>Renders count: { ++_renders }
                <button onClick={ () => state.items.add({}) }>
                    Add children
                </button>
            </div>
            <List items={ state.items } />
        </div>
    : "Loading..."
}

const List =
    // Render the component only if the listed props have changed.
    pureRenderProps({
        items : Collection.of( ChecklistItem )
    },
    ({ items }) =>
        <div className='children'>
            { items.map( item => (
                /* models have globally unique cid - client id to be used as 'key' */
                <Item key={ item.cid } model={ item } />
            ))}
        </div>
);

const Item = ({ model }) => 
    <div className='checklist'>
        <div className='header'>
            <input type="checkbox"
                    { ...model.$.checked.props /* data binding */ }/>
            <span className="created">
                { model.created.toLocaleTimeString() }
            </span>
            <input { ...model.$.name.props /* data binding again */ } />
            <button onClick={ () => model.remove() }>
                Delete
            </button>
            <button onClick={ () => model.subitems.add({}) }>
                Add children
            </button>
        </div>
        <List items={ model.subitems } />
    </div>;

// That's really it! Let's render it.
ReactDOM.render( <App />, document.getElementById( 'app-mount-root' ) );