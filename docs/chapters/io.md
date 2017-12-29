# I/O and Serialization

## Overview

Type-R implements generalized IO on top of the `IOEndpoint` interface,  with JSON serialization handled by Record and Collection classes.

IOEndpoint defines the set of CRUD + list methods operating on raw JSON.
Attachment of an endpoint to the record or collection enables I/O API.  There are few endpoints bundled with Type-R, for instance `memoryIO()` which can be used for mock testing.

```javascript
@define class User extends Record {
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

## IOEndpoint

An endpoint represents the persistent collection of records serialized to JSON. It has CRUD methods used by the Record, list method used by the collection, and an optional methods to subscribe for the data changes which are used by collection's live updates API. There are several pre-defined endpoints bundled with Type-R which can be used for mock testing, working with localStorage, and IO composition.

All IOEndpoint methods must return abortable promises (created with `createIOPromise()`). An IOEndpoint instance is shared by all of the class instances it's attached to and therefore it's normally *must be stateless*.

### `endpoint` memoryIO( mockData?, delay? )

Endpoint for mock testing. Takes optional array with mock data, and optional `delay` parameter which is the simulated I/O delay in milliseconds.

```javascript
import { memoryIO } from 'type-r/endpoints/memory'

@define class User extends Record {
    static endpoint = memoryIO();
    ...
}
```

### `endpoint` localStorageIO( key )

Endpoint for localStorage. Takes `key` parameter which must be unique for the persistent record's collection.

```javascript
import { localStorageIO } from 'type-r/endpoints/localStorage'

@define class User extends Record {
    static endpoint = localStorageIO( '/users' );
    ...
}
```

### `endpoint` attributesIO()

Endpoint for I/O composition. Redirects record's `fetch()` request to its attributes and returns the combined abortable promise. Does not enable any other I/O methods and can be used with `record.fetch()` only.

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

### `endpoint` httpRestIO( url )

<aside class="warning">
Not implemented yet, is scheduled for v2.1
</aside>

Simple HTTP REST endpoint.

- `create()` makes `POST url`, expecting to receive `{ id : recordId }` or other object used to update the record.
- `read()` makes `GET url/:id`.
- `update()` makes `PUT url/:id`.
- `destroy()` makes `DELETE url/:id`.
- `list()` makes `GET url`.

All I/O methods append an optional `options.params` object to the URL parameters translating them to string using `JSON.stringify()`.

### endpoint.read( id, options, record )

Reads an object with a given id. Used by `record.fetch()` method. Must return JSON wrapped in abortable promise.

### endpoint.update( id, json, options, record )

Updates or creates an object with a given id. Used by `record.save()` method when record *already has* an id. Must return abortable promise.

### endpoint.create( json, options, record )

Creates an object. Used by `record.save()` method when record *does not* have an id. Must return abortable promise.

### endpoint.destroy( id, options, record )

Destroys the object with the given id. Used by `record.destroy()` method. Must return abortable promise.

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

## Record and Collection

Record and Collection has a portion of common API related to the I/O and serialization.

### `static` endpoint

I/O endpoint declaration which should be used in Record or Collection definition to enable I/O API.

If an endpoint is defined for the `MyRecord`, it's automatically defined for the corresponding `MyRecord.Collection` as well.

### obj.hasPendingIO()

Returns an abortable promise if there's any I/O pending with the object, or `null` otherwise.

Can be used to check for active I/O in progress or to abort pending I/O operation. Please note, that all pending I/O is aborted automatically when new I/O operation is started or an object is disposed. When I/O is aborted, the promise is rejected.

```javascript
const promise = users.hasPendingIO();
if( promise ) promise.abort();
```

### obj.getEndpoint()

Returns an object's IO endpoint. Normally, this is an endpoint which is defined in object's `static endpoint = ...` declaration, but it might be overridden by the parent's record using `Type.has.endpoint( ... )` attribute declaration.

```javascript
@define class User extends Record {
    static endpoint = httpRestIO( '/api/users' );
    ...
}

@define class UserRole extends Record {
    static endpoint = httpRestIO( '/api/roles' );
    static attributes = {
        // Use the relative path '/api/roles/:id/users'
        users : User.Collection.has.endpoint( httpRestIO( './users' ) ),
        ...
    }
}

const role = new UserRole();
console.assert( role.users.getEndpoint().rootUrl !== '/api.users' );
```

<aside class="warning">
httpRestIO endpoint is not available yet and is planned to be implemented in v2.1
</aside>

### obj.toJSON()

Serialize record or collection to JSON. Used internally by I/O methods. Can be overridden to customize serialization.

Produces the JSON for the given record or collection and its aggregated members. Aggregation tree is serialized as nested JSON. Record corresponds to an object in JSON, while the collection is represented as an array of objects.

If you override `toJSON()`, it usually means that you must override `parse()` as well, and vice versa.

<aside class="notice">
Serialization can be controlled on per-attribute level with <b>Type.has.toJSON()</b> declaration.
</aside>

```javascript
@define class Comment extends Record {
    static attributes = {
        body : ''
    }
}

@define class BlogPost extends Record {
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

### `callback` obj.parse( json )

Optional hook called to transform the JSON when it's passes to the record or collection with `set( json, { parse : true })` call. Used internally by I/O methods.

If you override `toJSON()`, it usually means that you must override `parse()` as well, and vice versa.

<aside class="notice">
Parsing can be controlled on per-attribute level with <b>Type.has.parse()</b> declaration.
</aside>

## Record's attribute definitions

All aspects of I/O and serialization may be controlled on per-attribute level.

### `attrDef` : Type.has.endpoint( `endpoint` )

Override or define an I/O endpoint for the attribute.

### `attrDef` : Type.has.toJSON( false )

Do _not_ serialize the specific attribute.

### `attrDef` : Type.has.toJSON( ( value, name ) => json )

Override the default serialization for the specific record's attribute.

Attribute is not serialized when the function return `undefined`.

### `attrDef` : Type.has.parse( ( json, name ) => value )

Transform the data before it will be assigned to the record's attribute.

Invoked when the `{ parse : true }` option is set.

```javascript
// Define custom boolean attribute type which is serialized as 0 or 1.
const MyWeirdBool = Boolean.has
                      .parse( x => x === 1 )
                      .toJSON( x => x ? 1 : 0 );
```

### `attrDef` : Record.from( `sourceCollection` )

Serializable reference to the record from the particular collection.
Initialized as `null` and serialized as `record.id`. Is not recursively cloned, validated, or disposed. Used to model one-to-many relationships.

Changes in shared record are not detected.

`sourceCollection` may be:
- the JS variable pointing to the collection singleton;
- the function returning the collection;
- the string with the dot-separated _relative object path_ to the collection. It is resolved dynamically relative to the record's `this`. Following shortcuts may be used in path:
    - `owner.path` (or `^path`) works as `() => this.getOwner().path`.
    - `store.path` (or `~path`) works as `() => this.getStore().path`.

```javascript
    @define class State extends Record {
        items : Item.Collection,
        selected : Record.from( 'items' ) // Will resolve to `this.items`
    }
```

<aside class="info">It's recommended to use ~paths and stores instead of ^paths.</aside>

### `attrDef` : Collection.subsetOf( `sourceCollection` )

Serializable non-aggregating collection which is the subset of the particular collection. Serialized as an array of record ids. Used to model many-to-many relationships.

The collection itself is recursively created and cloned. However, its records are not aggregated by the collection thus they are not recursively cloned, validated, or disposed.

`sourceCollection` is the same reference as used by `Record.from()`.

## Record

### `static` create( attrs, options )

Static factory function used internally by Type-R to create instances of the record.

May be redefined in the abstract Record base class to make it serializable type.

```javascript
@define class Widget extends Record {
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

### rec.fetch( options? )

Asynchronously fetch the record using `endpoint.read()` method. Returns an abortable ES6 promise.

An endpoint must be defined for the record in order to use that method.

### rec.save( options? )

Asynchronously save the record using `endpoint.create()` (if there are no id) or `endpoint.update()` (if id is present) method. Returns an abortable ES6 promise.

An endpoint must be defined for the record in order to use that method.

### rec.destroy( options? )

Asynchronously destroy the record using `endpoint.destroy()` method. Returns an abortable ES6 promise. The record is removed from the aggregating collection upon the completion of the I/O request.

An endpoint must be defined for the record in order to use that method.

## Collection

### collection.createSubset( records?, options? )

Create an instance of `Collection.subsetOf( collection )` type (non-aggregating serializable collection) which is the subset of the given collection. Takes the same arguments as the collection's constructor.

<aside class="notice">
Records in the collection must have an `id` attribute populated to work properly with subsets.
</aside>

### col.fetch( options? )

Fetch the collection. Returns an abortable promise.

`options` accepts an optional `liveUpdates` parameter. When `true`, collection subscribes for the live updates when I/O is finished.

### col.liveUpdates( true | false )

Subscribe for the live data updates if an I/O endpoint supports it (`subscribe()`/`unsubscribe()` IOEndpoint methods).

<aside class="notice">
No built-in I/O enpoints support that functionality yet.
</aside>

## Store

`Store` is the special kind of record which serves as a root for ~references.

For all records inside of the store's aggregation tree `~attrName` will resolve to the attribute of the store class found with `record.getStore()` method. If there are no such an attribute in the store, the next available store upper in aggregation tree will be used (as regular records stores can be nested), or the default store if there are no one.

<aside class="notice">Stores in Type-R is _very different_ to stores in other framework. Pay attention.</aside>

Store is the subclass of the Record. It's defined extending the `Store` abstract base class. It behaves as a regular record in most aspects.

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

## id-references

Id-reference is the special Record attribute type representing nested Record or Collection which is represented in JSON as `record.id` or array of ids respectively. The reference to locally available "master" collection must be attached to the type in order to resolve id-references properly.

Master collection reference is the string with an object path which is resolved relative to the record.

Id-references are being resolved to the real Records "lazily", on the moment of first attribute read. Therefore, cross-references can be handled right.

### `attrDef` : Record.from( '~collectionFromStore' )

Serializable reference to the record from the collection taken from the closest store found with `this.getStore()` call.

### `attrDef` : Collection.subsetOf( `~collectionFromStore` )

Serializable collection of references to the records from the collection taken from the closest store found with `this.getStore()` call.

```javascript
@define class Role extends Record {
    static attributes = {
        name : String,
        ...
    }
}

@define class User extends Record {
    static attributes = {
        name : String,
        roles : Role.Collection.subsetOf( '~roles' )
    }
}

@define class UsersDirectory extends Store {
    static attributes = {
        roles : Role.Collection,
        users : User.Collection // `~roles` references will be resolved against this.roles
    }
}
```

### recordOrCollection.getStore()

Return the closest store. Used internally to resolve symbolic `~reference` relative to the store.

Method looks for the `Store` subclass traversing the ownership chain of current aggregation tree upwards. If there are no store found this way, default Store from `Store.global` is returned.

### recordOrCollection.clone({ pinStore : true })

Make the cloned object to preserve the reference to its original store.

Cloned objects don't have an owner by default, thus they loose the reference to their store as no ownership chain can be traversed. `pinStore` option should be used in such a cases.