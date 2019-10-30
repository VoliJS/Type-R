# Release Notes

## 3.0.0

### Breaking changes

Changed semantic which needs to be refactored:

 | 2.x | 3.x
 -|-|-
Typeless attribute | `value(x)` | `type(null).value(x)`
Infer type from the value | `x` (except functions) | `value(x)`, or `x` (except functions)
record.parse() override | `record._parse(json)` | no such a method, remove it
record attributes iteration | `record.forEachAttr(obj, iteratee)` | `record.forEach(iteratee)`
Shared object | `User.shared` | `shared( User )`
one-to-many relationship | `RecordClass.from( ref )` | `memberOf( ref )`
many-to-many relationship | `CollectionClass.from( ref )` | `subsetOf( ref, CollectionClass? )`
construct from object/array | - | `RecordOrCollectionClass.from( json, options? )`

### New attribute definition notation

Starting from version 3.X, Type-R does not modify built-in global JS objects. New `type(T)` attribute definition notation is introduced to replace `T.has.`

There's `type-r/globals` package for compatibility with version 2.x which must be imported once with `import 'type-r/globals'`.
If this package is not used, the code must be refactored according to the rules below.

| 2.x | 3.x
 -|-|-
UNIX Timestamp | `Date.timestamp` | `import { Timestamp } from 'type-r/ext-types'`
Microsoft date | `Date.microsoft` | `import { MicrosoftDate } from 'type-r/ext-types'`
Integer | `Integer` and `Number.integer` | `import { Integer } from 'type-r/ext-types'`
Create metatype from constructor | `Ctor.has` | `type(Ctor)`
Typed attribute with default value | `Ctor.value(default)` | `type(Ctor).value(default)`
Attribute "Required" check | `Ctor.isRequired` | `type(Ctor).required`

### First-class TypeScript support

- `Infer<typeof Metatype>` infers TypeScript type from the Type-R attribute metatype.
- `InferAttrs<typeof attributes>` infers TypeScript type for the Type-R attributes definitions.
- `attributes({ attrDefs })` returns the properly typed TypeScript Record class.

TypeScript attributes definitions:

| 2.x | 3.x
 -|-|-
Extract Type-R type with Reflect.metadata | `@attr name : T` | `@auto name : T`
Extract Type-R type & specify the default value | not possible | `@auto(default) name : T`
Explicitly specify the type  | `@attr(T) name : T` | `@type(T).as name : T`
Infer Type-R type from default value | `@attr(default) name : T` | `@value(default).as name : T`
Specify type and default value | `@attr(T.value(default)) name : T` | `@type(T).value(default).as name : T`

### Other improvements

- `Collection` class now proxies ES6 Array methods
- New logger API which easy to override or turn off.
- Improved error messages.
- `Type.from( json, options? )` method to restore object from JSON with a strict type check and validation.

```typescript
@define class User extends Record {
    // There's an HTTP REST enpoint for users.
    static endpoint = restfulIO( '/api/users' );

    @auto name : string

    // Collection of Role records represented as an array of role.id in JSON.
    // When the "roles" attribute will be accessed for the first time,
    // User will look-up for a 'roles' attribute of the nearest store to resolve ids to actual Users.
    @subsetOf( '~roles' ).as roles : Collection<Role>
}

@define class Role extends Record {
    static endpoint = restfulIO( '/api/roles' );
    @auto name : string
}

// Store is the regular Record, nothing special.
@define class UsersDirectory extends Store {
    // When this record is fetched, fetch all the attributes instead.
    static endpoint = attributesIO();

    // '~roles' references from all aggregated collections
    // will point to here, because this is the nearest store.
    @type( User.Collection ).as users : Collection<User>
    @type( Role.Collection ).as roles : Collection<Role>
}

const directory = new UsersDirectory();
await directory.fetch();

for( let user of directory.users ){
    assert( user.roles.first().users.first() instanceOf User );
}
```

## 2.1.0

This release adds long-awaited HTTP REST endpoint.

- IO endpoints moved outside of the man sources tree. Creation of the custom endpoints is easier than ever.
- Added HTTP REST endpoint `restfulIO` with relative urls support (https://volijs.github.io/Type-R/#endpoint-restfulio-url-options-).
- Added proxyIO endpoint for creating endpoints from records on the server side (https://volijs.github.io/Type-R/#endpoint-proxyio-recordctor-).

## 2.0.0

This release brings new features which fixes problems with component's inheritance in React bindings and implements long-awaited generic IO implementation based on ES6 promises.

There shouldn't be breaking changes _unless_ you're using custom logger or React bindings (formerly known as React-MVx, with a name changed to React-R in new release).

### Generic IO support

New [IOEndpoint]() concept is introduced, making it easy to create IO abstractions. To enable `Record` and `Collection` IO API, you need to assign IO endpoint in the class definition.

Endpoint is the class defining CRUD and list operations on JSON data, as well as the methods to subscribe for the data changes. There are two endpoints included with 2.0 release, `memoryIO` which is suitable for mock testing and `localStorageIO` which could be used in demos and prototypes. They can be used as a references as starting points to define your own IO endpoints.

```javascript
@define class User extends Record {
    static endpoint = memoryIO();
    static attributes = {
        name : String,
        ...
    }
}
```

There are three Record IO methods (`save()`, `fetch()`, and `destroy()`) and two collection IO method (`fetch()` and `liveUpdates()`) ). All IO methods returns ES6 promises, so you either must have the runtime supporting ES6 or use the ES6 promise polyfill. The promises are modified to be _abortable_ (all of them have `abort()` method).

```javascript
const user = new User({ name : 'John' });
user.save().then( () => {
    console.log( `new user is added ${ user.id }` )
});
```

There's the special `attributesIO()` endpoint to fetch all of attributes independently and return the combined promise. This is the recommended way of fetching the data required by SPA page.

```javascript
@define class PageStore extends Store {
    static endpoint = attributesIO();
    static attributes = {
        users : User.Collection,
        roles : UserRole.Collection,
        ...
    }
}

const store = new PageStore();
store.fetch().then( () =>{
    // render your page
});
```

It's possible to define or override the defined endpoint for the nested model or collection using `type().endpoint()` type-R attribute annotation.

```javascript
@define class PageStore extends Store {
    static endpoint = attributesIO();
    static attributes = {
        users : type( User.Collection ).endpoint( restful( '/api/users' ) ),
        roles : type( UserRole.Collection ).endpoint( restful( '/api/userroles' ) ),
        ...
    }
}
```

<aside class="notice">
Please note, that `restful` endpoint is not included with 2.0 release but is planned for the future 2.x releases.
</aside>

### New mixins engine

Type-R metaprogramming system built on powerful mixins composition with configurable member merge rules. In 2.0 release, mixins engine was rewritten to properly apply merge rules on inheritance. This feature is heavily used in Type-R React's bindings and is crucial to prevent errors when extending the `React.Component` subclasses.

An example illustrating the principle:

```javascript
@define
// Define the class with 
@mixinRules({
    componentWillMount : mixinRules.classLast,
    componentWillUnmount : mixinRules.classFirst
})
class Component {
    componentWillMount(){
        console.log( 1 );
    }
    
    componentWillUnmount(){
        console.log( 3 );
    }
}

@define
@mixins({
    componentWillMount(){
        console.log( 2 );
    },
    
    componentWillUnmount(){
        console.log( 2 );
    }
})
class MyBaseComponent extends Component {
    componentWillMount(){
        console.log( 3 );
    }
    
    componentWillUnmount(){
        console.log( 1 );
    }
}
```

In this example, all of the methods defined in the mixin, base class, and subclass will be called in the order specified in the `console.log`.

### Other changes

- Update pipeline was rewritten to improve record's initialization speed (collection's fetch speed is improved by 30%).
- Fixed bug causing dynamic type checks to be disabled in records constructors.
- New implementation of the `Collection.subsetOf` which both fixes some edge case bugs and is more efficient.
- New logger handling NODE_ENV variable setting.
