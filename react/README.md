# Getting Started

## Local state and models

### const State = attributes({...attrs})

`attributes()` function creates the "model" class out of the attributes definition, which is (in a simplest case) an object filled with default values. The shape of the generated class will repeat the shape of the attributes definition object.

```javascript
const State = attributes({
    counters : {
        a : 0,
        b : 1
    }
})
```

### const state = useModel(State)

Then, you can use it as a component's local state calling the `useModel` hook. When anything will change inside of the state, the component will be rendered. The state behaves like a plain mutable object with deeply observable changes.

```javascript
const StatefulComponent = () => {
    const state = useModel( State );
    
    return (
        <button onClick={ () => state.counters.a++ }>
            { state.counters.a }
        </button>
    );
}
```

Attribute definition can be either:

- Default value (`0`, `""`, `false`)
- Object `{ ...attrs }`, defining the nested model.
- JS constructor designating the type (`Number`, `String`, `Boolean`, `Date`, other model's constructor, etc)
- Array, meaning the collection of models `[{ ...attrs }]` or `[ModelConstructor]`.
- Type and `null` default value (`type(Number).null`)
- Arbitrary value and type (`type(Number).value(null)`)

All attributes are typed, and all attributes have default values. If the default value is provided its constructor is being inferred from the value, and, in turn, if the constructor alone is given it's invoked to get the default value when the model is created. The following definitions have identical meaning: `0`, `Number`, `value(0)`, `type(Number)`, `type(Number).value(0)`. However, the type cannot be inferred from the `null` default value, which makes definitions like `type(Date).null` useful.

Attribute types **are always checked and converted on assignment**. `Boolean` attribute value will remain boolean no matter which value was assigned. The same applies to `String`, `Number`, and all other types. The model is garanteed to preserve its shape at run-time under any circumstances.

## Linking state to inputs

### Linked attributes

The writable reference to the attribute ("linked attribute") is obtained by prefixing its name with `$.`.
This reference is the instance of `Linked` class encapsulating the attribute's `value` and `set` function to update the value. Linked attributes can be passed to children as a single prop and used to create the data-bound input controls.

```javascript
const State = attributes({
    post : {
        title : '',
        body : ''
    }
});

const Form = () => {
    const state = useModel( State );

    return (
        ...
        <Input type="text" $value={state.post.$.title}/>
        ...
    )
}

const Input = ({ $value, ...rest }) =>
    <input
        value={$value.value}
        onChange={ e => $value.set( e.target.value )}
    />
```
### Ad-hoc data binding

Custom components are not required to use data binding. `Linked` class has the `.props` helper to create `value` and `onChange` props consumed by standard HTML inputs:

```javascript
<input type="text" {...state.post.$.title.props}/>
```

However, custom input component are highly useful to encapsulate styles, and are recommended.

### Validation in components

`Linked` class contains `error` property which is populated by the `check` method. Checks have a form of asserts, and they can be chained. The first failing check will populate the error, skipping all the rest.

Error value in the linked attribute can be displayed by the custom input controls.

```javascript
const State = attributes({
    name : '',
    email : ''
})

const Page = () => {
    const state = useState( State );

    // Validate linked attributes.
    state.$.name
        .check( x => x, 'Required' );

    state.$.email
        .check( x => x, 'Required' )
        .check( x => x.indexOf('@') > 0, 'Should contain @' );

    return (
        <div>
            <label>Name:
                <Input $value={state.$.name}/>
            </label>
            <label>Email:
                <Input $value={state.$.email}/>
            </label>
        </div>
    )
}

// Input component indicating the validation error.
const Input = ({ $value, className = "", ...rest }) =>
    <input
        className={ $value.error ? className + ' error' : className }
        value={$value.value}
        onChange={ e => $value.set( e.target.value )}
    />
```

### Validation in state

Validation checks can be attached directly to the attributes. To do that, wrap the attribute's default value in `value('')`, or the attribute's type in `type(String)`. Validation is attached with a similar `check()` call, or a pre-defined `required` shortcut checking for falsy values. This technique can be combined with validation in the React components described above.

```javascript
const State = attributes({
    name : value('').required,
    email : value('')
        .required
        .check( x => x.indexOf('@') > 0, 'Email must contain @' )
})
```

In this case, validation will happen transarently in the moment when the attribute is accessed though `$` and the error will be attached to the linked attribute. The validation result is cached together with the `Linked` class, and the validation won't happen again unless the attribute value will change.

Also, it's easy to check if the whole state or its part is valid calling the `isValid()` method on state or it's nested object. In this case, the cosserponding state part will be validated recursively checking all the attributes.

Attribute's validation can be reused in a variety of ways. Validation function can encapsulate the error message and used in `check`.

```javascript
function isEmail( x ){
    return x => x.indexOf('@') > 0;
}

isEmail.error = 'Email must contain @';

const State = attributes({
    name : value('').required,
    email : value('').check( isEmail )
})
```

Or, a developer can reuse the whole attribute definition.

```javascript
const Email = value('')
        .required
        .check( x => x.indexOf('@') > 0, 'Email must contain @' );

const State = attributes({
    name : value('').required,
    email : Email
})
```

## Rendering lists and collections

Attribute is a collection if it's definition is an object enclosed in an array.

```javascript
const State = attributes({
    users : [{ // Collection of users.
        name : '',
        email : ''
    }]
})
```

When the state will be created, the collection will be represented with a `Collection` class having the most popular methods of `Array` class (`map`, `reduce`, `filter`, `push`, `slice`...) and BackboneJS collections API (`get`, `set`, `add`, `remove`, `groupBy`).

Model instances have a unique auto-generated `cid` ("client id") property which is helpful when rendering lists.

```javascript
const Users = () => {
    const state = useModel(State);

    return (
        <div>
            { state.users.map( user =>
                <User key={user.cid} model={user} />
            )}
        </div>
    )
}
```

Collection items, as well all nested models and collections, can be passed to children components as values. No wrapping in linked $-attributes is needed. Assuming that we're using out data-bound `Input` component from the previous section, it will look like this:

```javascript
const User = ({ user }) =>
    <div>
        <label>
            Name:
            <Input $value={user.$.name}/>
        </label>
        <label>
            Email:
            <Input $value={user.$.email}/>
        </label>
    </div>
```

> Internally, collection is a combination of models array (`models`) and the hash-map index by the model's `id` and `cid` attributes used internally by the `get(id)` and other methods. As it proxies popular `Array` methods, accessing the `models` directly is rarely needed.

## Managing the complex state

TODO: move the info about attribute types here.

When the state becomes complex, it's definition grows and parts of it often repeats itself. When it will happen, you can split the state definition to parts and compose your state out of them.
These parts can be reused across different components and in different contexts.

To do that, simply use the generated model class in place of the attribute's default value.

```javascript
// models.js
export const User = attributes({
    name : '',
    email: ''
})

export const Post = attributes({
    author : User
    title : '',
    body : ''
})

// page.js
import { User } from './models'

class State = attributes({
    posts : [User]
});

const Page = () => {
    const state = useModel(State);
    return (
        <div>
            { state.posts.map( x => <EditPost key={x.cid} post={x} /> )}
        </div>
    )
}
```

## Fetching the data

### Defining the endpoints

```javascript
import { attributes, metadata } from '@type-r/models'
import { restfulIO } from '@type-r/endpoints'

export const Users = attributes({
    name : '',
    email : '',
    
    [metadata] : {
        endpoint : restfulIO('/api/users')
    }
})
```

### Doing the I/O

```javascript
const State = attributes({
    users : [Users]
})

const Page = () => {
    const state = useModel(State);

    const isReady = useIO(async () =>{
        await state.users.fetch();
    });

    return isReady ?
            <UsersList users={state.users}/>
        :
            <div>Loading...</div>
}
```

### TODO: Bearer Auth

## Managing the simple state

### useLinked( value )

```javascript
const StatefulDataBound = () => {
    // Obtain linked local state.
    const $name = useLinked( '' );

    return (
        <div>
            <input {...$name.props} />
        </div>
    )
}
 
```

### useCollection.of( ModelClass )

```javascript
class Counter = attributes({
    counter : 0
});

const StatefulComponent = () => {
    const counters = useCollection.of( Counter );

    const selected = useCollection.subsetOf( counters );
    
    return (
        <div>
            <div>{ user.counter }</div>
            <button onClick={ () => user.counter++ }>Add</button>
        </div>
}
```

## REMOVE Normalized data and stores

`Store` is the subclass of `Model` used as a root to resolve id-references in 'normalized data structures', when 
the data is represented as a set of collections with items referencing each other by id. If you don't have normalized data structures, you don't need `Store`.

Attributes of types `Model.memberOf( 'store.someCollection' )` and `Collection.subsetOf( 'store.someCollection' )`
will resolve model ids to the models taken from `someCollection` belonging to the closest `Store` model. The closest
store is located as follows:

1) The first `Store` from the model's owners chain is taken first.
2) If there are no such a collection in it, the next `Store` class in ownership chain is taken.
3) If there are no stores left in the ownerhip chain, the `Store.global` is used.

From the particular model's view, there's a single `store` namespace which is defined by `Store.global` and
extended by upper stores in its ownership chain.

In `@type-r/react`, you can create the store as a local component state, and expose it down to the component subtree
so its children can opt to use this context store for id resolutions in their local state models.

That leads to a multi-tier store achitecture where the next tier store may override upper store collections and extend it with new collections.

- Tier 1. `Store.global` holds the state which is shared across all SPA pages.
- Tier 2. Page component stores holds the state which is related to particular pages.
- Tier 3. Particular components might add their local stores extending the namespace created by upper stores.

Stores
```javascript
const X = () => {
    const state = useModel( State );
    useContextStore( state );
}
```
