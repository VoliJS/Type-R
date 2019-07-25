# React bindings for Type-r models.

## Use Type-R model as local component state

```javascript
class State = attributes({
    counter : 0
});

const StatefulComponent = () => {
    const state = useModel( State /* any model class */ );
    
    return (
        <button onClick={ () => state.counter++ }>
            { state.counter }
        </button>
    );
}
```

## Use Type-r collections as local component state

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

## Data binding

Genious.

```javascript
user.$.name

const user$ = user.$
```

## Normalized data and stores

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
