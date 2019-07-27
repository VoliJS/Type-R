# I/O and Serialization

## Overview

Type-R implements generalized IO on top of the `IOEndpoint` interface,  with JSON serialization handled by Model and Collection classes.

IOEndpoint defines the set of CRUD + list methods operating on raw JSON.
Attachment of an endpoint to the model or collection enables I/O API.  There are few endpoints bundled with Type-R, for instance `memoryIO()` which can be used for mock testing.

```javascript
@define class User extends Model {
    static endpoint = memoryIO();

    static attributes = {
        name : '',
        email : ''
    }
}

const users = new User.Collection();
users
    .add({ name : 'John' })
    .save()
    .then( () => console.log( user.id );
```

## I/O API

### `static` endpoint

I/O endpoint declaration which should be used in Model or Collection definition to enable I/O API.

If an endpoint is defined for the `MyRecord`, it's automatically defined for the corresponding `MyRecord.Collection` as well.

### `metatype` type( Type ).endpoint( `endpoint` )

Override or define an I/O endpoint for the specific model's attribute.

### obj.getEndpoint()

Returns an object's IO endpoint. Normally, this is an endpoint which is defined in object's `static endpoint = ...` declaration, but it might be overridden by the parent's model using `type( Type ).endpoint( ... )` attribute declaration.

```javascript
@define class User extends Model {
    static endpoint = restfulIO( '/api/users' );
    ...
}

@define class UserRole extends Model {
    static endpoint = restfulIO( '/api/roles' );
    static attributes = {
        // Use the relative path '/api/roles/:id/users'
        users : type( User.Collection ).endpoint( restfulIO( './users' ) ),
        ...
    }
}
```

### model.fetch( options? )

Asynchronously fetch the model using `endpoint.read()` method. Returns an abortable ES6 promise.

An endpoint must be defined for the model in order to use that method.

### model.save( options? )

Asynchronously save the model using `endpoint.create()` (if there are no id) or `endpoint.update()` (if id is present) method. Returns an abortable ES6 promise.

An endpoint must be defined for the model in order to use that method.

### model.destroy( options? )

Asynchronously destroy the model using `endpoint.destroy()` method. Returns an abortable ES6 promise. The model is removed from the aggregating collection upon the completion of the I/O request.

An endpoint must be defined for the model in order to use that method.

### collection.fetch( options? )

Fetch the collection. Returns an abortable promise.

`options` accepts an optional `liveUpdates` parameter. When `true`, collection subscribes for the live updates when I/O is finished.

### collection.liveUpdates( true | false )

Subscribe for the live data updates if an I/O endpoint supports it (`subscribe()`/`unsubscribe()` IOEndpoint methods).

<aside class="notice">
No built-in I/O enpoints support that functionality yet.
</aside>

### obj.hasPendingIO()

Returns an abortable promise if there's any I/O pending with the object, or `null` otherwise.

Can be used to check for active I/O in progress or to abort pending I/O operation. Please note, that all pending I/O is aborted automatically when new I/O operation is started or an object is disposed. When I/O is aborted, the promise is rejected.

```javascript
const promise = users.hasPendingIO();
if( promise && promise.abort ) promise.abort();
```

## I/O endpoints

### restfulIO( url, options? )

HTTP REST client endpoint. Requires `window.fetch` available natively or through the polyfill. Implements standard BackboneJS REST semantic.

All I/O methods append an optional `options.params` object to the URL parameters translating them to string with `JSON.stringify()`.

- `model.save()` makes:
    - `POST url`, if the model has no id. Expects to receive `{ id : recordId }`.
    - `PUT url/:id`, if the model has an id.
- `collection.fetch()` makes `GET url`.
- `model.destroy()` makes `DELETE url`.

Supports URI relative to owner (`./relative/url` resolves as `/owner/:id/relative/url/:id` ).

```javascript
import { restfulIO } from 'type-r/endpoints/restful'

@define class Role extends Model {
    static endpoint = restfulIO( '/api/roles' );
    ...
}

@define class User extends Model {
    static endpoint = restfulIO( '/api/users' );
    
    static attributes = {
        // Roles collection here has relative url /api/users/:user_id/roles/
        roles : type( Role.Collection ).endpoint( restfulIO( './roles' ) ), 
        ...
    }
}
```

### memoryIO( mockData?, delay? )

Endpoint for mock testing. Takes optional array with mock data, and optional `delay` parameter which is the simulated I/O delay in milliseconds.

```javascript
import { memoryIO } from 'type-r/endpoints/memory'

@define class User extends Model {
    static endpoint = memoryIO();
    ...
}
```

### localStorageIO( key )

Endpoint for localStorage. Takes `key` parameter which must be unique for the persistent model's collection.

```javascript
import { localStorageIO } from 'type-r/endpoints/localStorage'

@define class User extends Model {
    static endpoint = localStorageIO( '/users' );
    ...
}
```

### attributesIO()

Endpoint for I/O composition. Redirects model's `fetch()` request to its attributes and returns the combined abortable promise. Does not enable any other I/O methods and can be used with `model.fetch()` only.

It's common pattern to use attributesIO endpoint in conjunction with Store to fetch all the data required by SPA page.

```javascript
import { localStorageIO } from 'type-r/endpoints/attributes'

@define class PageStore extends Store {
    static endpoint = attributesIO();
    static attributes = {
        users : User.Collection,
        roles : UserRole.Collection,
    }
}
...
const store = new PageStore();
store.fetch().then( () => renderUI() );
```

### proxyIO( RecordCtor )

Create IO endpoint from the Model class. This endpoint is designed for use on the server side with a data layer managed by Type-R.

Assuming that you have Type-R models with endpoints working with the database, you can create an endpoint which will use
an existing Model subclass as a transport. This endpoint can be connected to the RESTful endpoint API on the server side which will serve JSON to the restfulIO endpoint on the client.

An advantage of this approach is that JSON schema will be transparently validated on the server side by the Type-R.

```javascript
    import { proxyIO } from 'type-r/endpoint/proxy'
    
    ...

    const usersIO = proxyIO( User );
```

## IOEndpoint Interface

An IO endpoint is an "plug-in" abstraction representing the persistent collection of JSON objects, which is required to enable models and collections I/O API. There are several pre-defined endpoints included in Type-R package which can be used for HTTP REST I/O, mock testing, working with localStorage, and IO composition.

You will need to define custom endpoint if you would like to implement or customize serialization transport for Type-R objects. Use built-in endpoints as an example and the starting boilerplate.

All IOEndpoint methods might return standard Promises or abortable promises (created with `createIOPromise()`). An IOEndpoint instance is shared by all of the class instances it's attached to and therefore it's normally *must be stateless*.

### endpoint.read( id, options, model )

Reads an object with a given id. Used by `model.fetch()` method. Must return JSON wrapped in abortable promise.

### endpoint.update( id, json, options, model )

Updates or creates an object with a given id. Used by `model.save()` method when model *already has* an id. Must return abortable promise.

### endpoint.create( json, options, model )

Creates an object. Used by `model.save()` method when model *does not* have an id. Must return abortable promise.

### endpoint.destroy( id, options, model )

Destroys the object with the given id. Used by `model.destroy()` method. Must return abortable promise.

### endpoint.list( options, collection )

Fetch an array of objects. Used by `collection.fetch()` method. Must returns abortable promise.

### endpoint.subscribe( `callbacks`, collection )

Optional method to enable the live updates subscription. Used by `collection.liveUpdates( true )` method. Must returns abortable promise.

Method `callbacks` argument is an object of the following shape:

```javascript
{
    // Endpoint must call it when an object is created or updated.
    updated( json ){}

    // Endpoint must call it when an object is removed.
    removed( json ){}
}
```

### endpoint.unsubscribe( `callbacks`, collection )

Unsubscribe from the live updates. Used by `collection.liveUpdates( false )` method. Takes the same `callbacks` object as `subscribe()`.

### createIOPromise( init )

Service function to create an abortable version of ES6 promise (with `promise.abort()` which meant to stop pending I/O and reject the promise).

`init` function takes the third `onAbort` argument to register an optional abort handler. If no handler is registered, the default implementation of `promise.abort()` will just reject the promise.

```javascript
import { createIOPromise } from 'type-r'

const abortablePromise = createIOPromise( ( resolve, reject, onAbort ) =>{
    ...
    onAbort( () => {
        reject( 'I/O Aborted' );
    });
});
```

## Serialization

Model and Collection has a portion of common API related to the I/O and serialization.

### obj.toJSON( options? )

Serialize model or collection to JSON. Used internally by `save()` I/O method (`options.ioMethod === 'save'` when called from within `save()`). Can be overridden to customize serialization.

Produces the JSON for the given model or collection and its aggregated members. Aggregation tree is serialized as nested JSON. Model corresponds to an object in JSON, while the collection is represented as an array of objects.

If you override `toJSON()`, it usually means that you must override `parse()` as well, and vice versa.

<aside class="notice">
Serialization can be controlled on per-attribute level with <b>type( Type ).toJSON()</b> declaration.
</aside>

```javascript
@define class Comment extends Model {
    static attributes = {
        body : ''
    }
}

@define class BlogPost extends Model {
    static attributes = {
        title : '',
        body : '',
        comments : Comment.Collection
    }
}

const post = new BlogPost({
    title: "Type-R is cool!",
    comments : [ { body : "Agree" }]
});

const rawJSON = post.toJSON()
// { title : "Type-R is cool!", body : "", comments : [{ body : "Agree" }] }
```

### `option` { parse : true }

`obj.set()` and constructor's option to force parsing of the raw JSON. Is used internally by I/O methods to parse the data received from the server.

```javascript
// Another way of doing the bestSeller.clone()
// Amazingly, this is guaranteed to work by default.
const book = new Book();
book.set( bestSeller.toJSON(), { parse : true } );
```

### `callback` obj.parse( json, options? )

Optional hook called to transform the JSON when it's passes to the model or collection with `set( json, { parse : true })` call. Used internally by I/O methods (`options.ioMethod` is either "save" or "fetch" when called from I/O method).

If you override `toJSON()`, it usually means that you must override `parse()` as well, and vice versa.

<aside class="notice">
Parsing can be controlled on per-attribute level with <b>type( Type ).parse()</b> declaration.
</aside>

### `metatype` type( Type ).toJSON( false )

Do _not_ serialize the specific attribute.

### `metatype` type( Type ).toJSON( ( value, name, options ) => json )

Override the default serialization for the specific model's attribute.

Attribute is not serialized when the function return `undefined`.

### `metatype` type( Type ).parse( ( json, name ) => value )

Transform the data before it will be assigned to the model's attribute.

Invoked when the `{ parse : true }` option is set.

```javascript
// Define custom boolean attribute type which is serialized as 0 or 1.
const MyWeirdBool = type( Boolean )
                      .parse( x => x === 1 )
                      .toJSON( x => x ? 1 : 0 );
```

### `static` create( attrs, options )

Static factory function used internally by Type-R to create instances of the model.

May be redefined in the abstract Model base class to make it serializable type.

```javascript
@define class Widget extends Model {
    static attributes = {
        type : String
    }

    static create( attrs, options ){
        switch( attrs.type ){
            case "typeA" : return new TypeA( attrs, options );
            case "typeB" : return new TypeB( attrs, options );
        }
    }
}

@define class TypeA extends Widget {
    static attributes = {
        type : "typeA",
        ...
    }
}

@define class TypeB extends Widget {
    static attributes = {
        type : "typeB",
        ...
    }
}
```

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

### sourceCollection.createSubset( models?, options? )

Create an instance of `subsetOf( sourceCollection, CollectionCtor )` type (non-aggregating serializable collection) which is the subset of the given collection. Takes the same arguments as the collection's constructor.

<aside class="notice">
Records in the collection must have an `id` attribute populated to work properly with subsets.
</aside>

### `class` Store

`Store` is the special kind of model which serves as a root for id references.

For all models inside of the store's aggregation tree `~attrName` will resolve to the attribute of the store class found with `model.getStore()` method. If there are no such an attribute in the store, the next available store upper in aggregation tree will be used (as regular models stores can be nested), or the default store if there are no one.

<aside class="notice">Stores in Type-R is _very different_ to stores in other framework. Pay attention.</aside>

Store is the subclass of the Model. It's defined extending the `Store` abstract base class. It behaves as a regular model in most aspects.

### store._defaultStore

Reference to the master store used for lookups if the current store doesn't have the required attribute and there are no other store found upper in the ownership chain.

Defaults to the `Store.global`. May be explicitly defined to create custom store lookup chains across the ownership hierarchy.

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

### recordOrCollection.getStore()

Return the closest store. Used internally to resolve symbolic `~reference` relative to the store.

Method looks for the `Store` subclass traversing the ownership chain of current aggregation tree upwards. If there are no store found this way, default Store from `Store.global` is returned.

### recordOrCollection.clone({ pinStore : true })

Make the cloned object to preserve the reference to its original store.

Cloned objects don't have an owner by default, thus they loose the reference to their store as no ownership chain can be traversed. `pinStore` option should be used in such a cases.