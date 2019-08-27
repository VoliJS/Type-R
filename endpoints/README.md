# I/O endpoints

## Overview

Type-R uses IO abstraction represented by `IOEndpoint` interface, with JSON serialization handled by Model and Collection classes.

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