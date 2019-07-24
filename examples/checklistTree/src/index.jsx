import './styles.css'

// You should import React from react-mvx, and use it as drop-in replacement.
// It's 100% compatible.
import React, { define } from 'react-mvx'
import ReactDOM from 'react-dom'
import { Record } from 'type-r'
import { localStorageIO } from 'type-r/endpoints/localStorage'

// Import checklist model definition. Think of "model" as of an observable serializable class.
import { ChecklistItem } from './model'

// Local counter to help us count top-level renders.
let _renders = 0;

// React-r state definition.
@define class AppState extends Record {
    // The state is persisted in localStorage
    static endpoint = localStorageIO( "/react-mvx/examples" );

    static attributes = {
        id : "checklistTree", // Persistent record needs to have an id

        // 'items' is a collection of ChecklistItem model.
        items : ChecklistItem.Collection // <- It's type annotation. Constructor function designates type.
    }
}

// @define should be places before every class definition, which uses react-mvx features.
@define class App extends React.Component {
    static State = AppState;

    // Save and restore state.
    componentWillMount(){
        // Fetch state from the local storage.
        this.state.fetch();

        // Save state to the local storage on unload.
        window.onunload = () => this.state.save();
    }

    render(){
        const { items } = this.state;

        return (
            <div>
                <div>Renders count: { _renders++ }
                    <button onClick={ () => items.add({}) }>
                        Add children
                    </button>
                </div>
                <List items={ items } />
            </div>
        );
    }
}

// Simple pure component to render the list of checklist items.
// They must _not_ be prefixed with @define. No magic here, just raw React.
const List = ({ items }) => (
    <div className='children'>
        { items.map( item => ( /* <- collections have 'map' method as an array */
            /* models have cid - unique client id to be used in 'key' */
            <Item key={ item.cid } model={ item } />
        ))}
    </div>
);

@define class Item extends React.Component{
    // react-mvx props definition. Same syntax as for the 'state'.
    static props = {
        model : ChecklistItem // <- Type annotation, using constructor function. No default value.
    };

    static pureRender = true; // <- that's all you should do to enable pure render optimization.

    render(){
        const { model } = this.props,
              // Two way data binding! Using our advanced value links.
              // First, prepare the links.
              links = model.linkAll( 'checked', 'name' );

        return (
            <div className='checklist'>
                <div className='header'>
                    <input type="checkbox"
                           { ...links.checked.props /* We use links instead of values... */ }/>
                    <span className="created">
                        { model.created.toLocaleTimeString() }
                    </span>
                    <input { ...links.name.props /* ...as if they would be values */ } />
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
}

// That's really it! Let's render it.
ReactDOM.render( <App />, document.getElementById( 'app-mount-root' ) );