import './styles.css'
import React from 'react'
import ReactDOM from 'react-dom'

import { define, Model, Collection } from '@type-r/models'
import { localStorageIO } from '@type-r/endpoints'
import { useModel, useIO, pureRenderProps } from '@type-r/react'

// Import checklist model definition. "Model" is a class with serializable and observable attributes.
import { ChecklistItem } from './model'

// Local counter to help us count top-level renders.
let _renders = 0;

// Type-R model for the App state.
@define class AppState extends Model {
    // The state is persisted in localStorage
    static endpoint = localStorageIO( "/@type-r/react/examples" );

    static attributes = {
        id : "checklistTree", // Persistent model needs to have an id
        items : Collection.of( ChecklistItem )
    }
}

const App = () => {
    // Create the AppState model as a part of the local component state.
    // If anything will change inside (no matter how deep), the component will notice it and update itself.
    const state = useModel( AppState );

    // Save and restore state. Executed once after mount.
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
    // Render the component again only when the listed props changed.
    pureRenderProps({
        // it has to know the type of each prop. The "type" is a JS constructor or Type-R attribute type annotation.
        items : Collection.of( ChecklistItem )
    },
    ({ items }) =>
        <div className='children'>
            { items.map( item => (
                /* models have globally unique cid - client-side id to be used as 'key' */
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
