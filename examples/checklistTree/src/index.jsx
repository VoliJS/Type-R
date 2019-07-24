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

// React-r state definition.
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

// Simple pure component to render the list of checklist items.
// They must _not_ be prefixed with @define. No magic here, just raw React.
const List = 
    pureRenderProps({
        items : Collection.of( ChecklistItem )
    },
    ({ items }) =>
        <div className='children'>
            { items.map( item => ( /* <- collections have 'map' method as an array */
                /* models have cid - unique client id to be used in 'key' */
                <Item key={ item.cid } model={ item } />
            ))}
        </div>
);

const Item = ({ model }) => {
    // Two way data binding! Using our advanced value links.
    // First, prepare the links.
    const model$ = model.$;

    return (
        <div className='checklist'>
            <div className='header'>
                <input type="checkbox"
                        { ...model$.checked.props /* We use links instead of values... */ }/>
                <span className="created">
                    { model.created.toLocaleTimeString() }
                </span>
                <input { ...model$.name.props /* ...as if they would be values */ } />
                <button onClick={ () => model.remove() /* custom model method to remove it from the collection */}>
                    Delete
                </button>
                <button onClick={ () => model.subitems.add({}) }>
                    Add children
                </button>
            </div>
            <List items={ model.subitems /* Render the nested checklist */ } />
        </div>
    );
}

// That's really it! Let's render it.
ReactDOM.render( <App />, document.getElementById( 'app-mount-root' ) );