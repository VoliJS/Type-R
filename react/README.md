# React bindings for Type-r models.

## Use Type-R model and collection in React functional component

```javascript
const StatefulComponent = () => {
    const user = useModel( User ),
        roles = useCollectionOf( Role );

    const isReady = useIO( () =>
        Promise.all([
            user.fetch(),
            roles.fetch()
        ]
    );

    useEffect( () => {
        user.fetch();
        roles.fetch();
    }, [] )

    return !user.hasPendingIO() && !roles.hasPendingIO() ?
        <ShowModel model={ user } roles={ roles } /> :
        <div> Loading... </div>
}
```

## StateRefs

Genious.

```javascript
user.$.name

const user$ = user.$
```

Stores
```javascript
const X = () => {
    const state = useModel( State );
    useUpperStore( state );
}
```
