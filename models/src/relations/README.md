# Stores and normalized data

## Normalized data

Type-R has first-class support for working with normalized data represented as a set of collections with cross-references by model id. References are represented as model ids in JSON, and being transparently resolved to model instances on the first access.

`Store` class is the special model class which serves as a placeholder for the set of interlinked collections of normalized models. Id-references are defined as model attributes of the special type representing the serializable reference to the models from the specified master collection.

### `metatype` memberOf( `sourceCollection` )

Serializable reference to the model from the particular collection.
Initialized as `null` and serialized as `model.id`. Is not recursively cloned, validated, or disposed. Used to model one-to-many relationships.

Changes in shared model are not detected.

`sourceCollection` may be:
- the JS variable pointing to the collection singleton;
- the function returning the collection;
- the string with the dot-separated _relative object path_ to the collection. It is resolved dynamically relative to the model's `this`. Following shortcuts may be used in path:
    - `owner.path` (or `^path`) works as `() => this.getOwner().path`.
    - `store.path` (or `~path`) works as `() => this.getStore().path`.

```javascript
    @define class State extends Model {
        static attributes = {
            items : Item.Collection,
            selected : memberOf( 'items' ) // Will resolve to `this.items`
        }
    }
```

<aside class="info">It's recommended to use ~paths and stores instead of ^paths.</aside>

### `metatype` subsetOf( `sourceCollection`, CollectionCtor? )

Serializable non-aggregating collection which is the subset of the existing collection. Serialized as an array of model ids. Used to model many-to-many relationships. `CollectionCtor` argument may be omitted unless you need it to be a sublass of the particular collection type.

The collection object itself is recursively created and cloned. However, its models are not aggregated by the collection thus they are not recursively cloned, validated, or disposed.

`sourceCollection` is the same reference as used by `memberOf( sourceCollection )`.

```javascript
@define class Role extends Model {
    static attributes = {
        name : String,
        ...
    }
}

@define class User extends Model {
    static attributes = {
        name : String,
        roles : subsetOf( '~roles', Role.Collection )
    }
}

@define class UsersDirectory extends Store {
    static attributes = {
        roles : Role.Collection,
        users : User.Collection // `~roles` references will be resolved against this.roles
    }
}
```

### recordOrCollection.clone({ pinStore : true })

Make the cloned object to preserve the reference to its original store.

Cloned objects don't have an owner by default, thus they loose the reference to their store as no ownership chain can be traversed. `pinStore` option should be used in such a cases.

## `class` Store

In Type-R, stores are the subclasses of models which can be referenced in base collection symbolic paths as `store`.
Stores are used as root models holding the collections of other models with serializable references.

For all models aggregated by store (no matter how deep) `store.attrName` baseCollection path will resolve to the `attrName` attribute of this store. If there are no such an attribute in the store, the next available store upper in aggregation tree will be checked (stores can be nested as regular models), or the default store if there are no more stores in the ownership chain.

<aside class="notice">Stores in Type-R are _very different_ to stores in other frameworks. Keep in mind, a store is just a subclass of the Model.</aside>

### store._defaultStore

Reference to the master store used for lookups if the current store doesn't have the required attribute and there are no other store found upper in the ownership chain.

Defaults to the `Store.global`. May be reassinged to create arbitrary store lookup chains.

### `static` Store.global

The default singleton store class. Is always the last store to lookup when resolving ~reference.

Use the default store for the _globally shared data only_. Each application page must have its local store.

```javascript
@define class MyStore extends Store {
    static attributes = {
        users : User.Collection,
        roles : Role.Collection
    }
}

Store.global = new MyStore();

// Now the reference '~users` will point to users collection from the MyStore.
```

### model.getStore()

Return the closest store. Used internally to resolve symbolic `store.attr` relative to the store.

Method looks for the `Store` subclass traversing the ownership chain of current aggregation tree upwards. If there are no store found this way, default Store from `Store.global` is returned.

## Layered application state

TODO