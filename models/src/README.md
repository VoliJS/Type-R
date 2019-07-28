# Defining the model

## Overview

The `Model` class is a main building block of Type-R representing serializable and observable object. Models are mapped to objects in JSON according to the types in attributes definition. Model asserts attribute types on assignment and guarantee that these types will be preserved at run time, continuously checking the client-server protocol and guarding it from errors on both ends.

There are four sorts of model attributes:

- **Primitive** types (Number, String, Boolen) mapped to JSON directly.
- **Immutable** types (Date, Array, Object, or custom immutable class).
- **Aggregated** models and collections represented as nested objects and arrays of objects in JSON.
- **References** to models and collections. References can be either:
    - **serializable** to JSON as an ids of the referenced models, used to model one-to-many and many-to-many relashinships in JSON;
    - **observable**, which is a non-persistent run-time only reference, used to model temporary application state.

Model is an observable state container efficiently detecting changes in all of its attributes, including the deep changes in aggregated and observable reference attributes. Type-R models follow BackboneJS change events model which makes it a straightforward task to integrate with virtually any view layer.

Model attribute definitions have extended metadata to control all aspects of model behavior on the particular attribute's level, making it easy to define reusable attribute types with custom serialization, validation, and reactions on changes.

Type-R models are almost as easy to use as plain JS objects, and much easier when more complex data types and serialization scenarios are involved. 

```javascript
// We have `/api/users` endpoint on the server. Lets describe what it is with a model.
import { define, Model, Collection, value, type } from '@type-r/models'
import { restfulIO } from '@type-r/endpoints'
import { Role } from './roles' // <- That's another model definition.

@define class User extends Model {
    // Tell this model that it has a REST endpoint on the server to enable I/O API.
    static endpoint = restfulIO( '/api/users' );

    static attributes = {
        name : '', // type is inferred from the default value as String
        email : '', // String
        isActive : false, // Boolean

        // nested array of objects in JSON, collection of Role models in JS
        roles : Collection.of( Role ) 

        // Add metadata to a Number attribute.
        // Receive it from the server, but don't send it back on save.
        failedLoginCount : value( 0 ).toJSON( false ), // Number

        // ISO UTC date string in JSON, `Date` in JS. Read it as Date, but don't save it.
        createdAt : type( Date ).toJSON( false ), // Date
    }
}

// Somewhere in other code...

// Fetch the users list from the server...
const users = await Collection.of( User ).create().fetch();

// Subscribe for the changes...
users.onChanges( () => console.log( 'changes!' ) );

// ...and make the first user active.
const firstUser = users.first();
firstUser.isActive = true; // Here we'll got the 'changes!' log message
await firstUser.save();
```

Model is defined by extending the `Model` class with attributes definition and applying the `@define` decorator.

### `decorator` @define

Class decorator which must preceede the `Model` subclass declaration. `@define` is a mixin which will read attribute definitions from the Model's `static attributes` and generate class properties accessors accordingly.

`@define` assembles attribute's update pipeline for each attribute individually depending on its type and employs a number of JIT-friendly optimizations. As a result, Type-R models handle updates about 10 times faster than frameworks like BackboneJS in all popular browsers making a collections of 10K objects a practical choice on a frontend.

### `static` attributes

Attributes must be defined in `static attributes`. In a majority of cases, an attribute definition is a constructor function or the default value.

If the function is used as attribute definition, it's assumed to be am attributes constructor and designates attribute type. If it's not a function, it's treated as an attribute's default value and type is being determened from this value type. The following attribute definitions are equivalent:

```javascript
@define class User extends Model {
    static attributes = {
        name : String, // Same as ''
        email : '' // Same as String
    }
}
```

To assign `null` as a default value both attribute type and value need to be specified, as the type cannot be inferred from `null`. It's done through the attribute's metadata like this:

    nullStringAttr : type( String ).value( null )

### `static` idAttribute = 'attrName'

A model's unique identifier is stored under the pre-defined `id` attribute.
If you're directly communicating with a backend (CouchDB, MongoDB) that uses a different unique key, you may set a Model's `idAttribute` to transparently map from that key to id.

Model's `id` property will still be linked to Model's id, no matter which value `idAttribute` has.

```javascript
@define class Meal extends Model {
  static idAttribute =  "_id";
  static attributes = {
      _id : Number,
      name : ''
  }
}

const cake = new Meal({ _id: 1, name: "Cake" });
alert("Cake id: " + cake.id);
```

### `static` endpoint

Enable model's I/O API by specifying an I/O endpoint. There are the list of endpoints in `@type-r/enpoints` package to work with browsers local storage, REST, and mock data.

## Primitive attributes

Primitive attribute types are directly mapped to their values in JSON.
Assigned value is being converted to the declared attribute type at run time. I.e. if an email is declared to be a string, it's guaranteed that it will always remain a string.

```javascript
@define class User extends Model {
    static attributes = {
        name : '',
        email : String, // ''
        isActive : Boolean, // false
        failedLoginCount : Number // 0
    }
}
```

### `attribute` : Number

JS `number` primitive type. Assigned value (except `null`) is automatically converted to `number` with a constructor call `Number( value )`.

If something other than `null`, number, or a proper string representation of number is being assigned, the result of the convertion is `NaN` and the warning
will be displayed in the console. Models with `NaN` in their `Number` attributes will fail the validation check.

### `attribute` : Boolean

JS `boolean` primitive type. Assigned value (except `null`) is automatically converted to `true` or `false` with a constructor call `Boolean( value )`.

This attribute type is always valid.

### `attribute` : String

JS `string` primitive type. Assigned value (except `null`) is automatically converted to `string` with a constructor call `String( value )`.

This attribute type is always valid.

## Immutable attributes

### `attribute` : Date

JS `Date` type represented as ISO UTC date string in JSON. If assigned value is not a `Date` or `null`, it is automatically converted to `Date` with a constructor call `new Date( value )`.

If something other than the integer timestamp or the proper string representation of date is being assigned, the result of the convertion is `Invalid Date` and the warning
will be displayed in the console. Models with `Invalid Date` in their `Date` attributes will fail the validation check.

Note that the changes to a `Date` attribute are not observable; dates are treated as immutables and need to be replaced for the model to notice the change.

```javascript
@define class User extends Model {
    static attributes = {
        name : '',
        email : String, // ''
        createdAt : Date
    }
}
```

### `attribute` : Array

Immutable JS Array mapped to JSON as is. Type-R assumes that an Array attribute contains a raw JSON with no complex data types in it. 

`Array` type is primarily used to represent a list of primitives. It's recommended to use aggregated collections of models for the array of objects in JSON.

If an assigned value is not an `Array`, the assignment will be ignored and a warning will be displayed in the console.
Array attributes are always valid.

Note that the changes to an `Array` attribute are not observable; arrays need to be replaced with an updated copy for the model to notice the change. Type-R uses `Linked` class proxying popular array methods from `@linked/value` package to simplify manipulations with immutable arrays.

```javascript
@define class User extends Model {
    static attributes = {
        name : String,
        roles : [ 'admin' ]
    }
}

user.$.roles.push( 'user' );
```

### `attribute` : Object

Immutable JS Object mapped to JSON as is. Type-R assumes that an Object attribute contains a raw JSON with no complex data types in it. 

Plain JSON object type primarily used to represent dynamic hashmaps of primitives. It's recommended to use aggregated models for the complex nested objects in JSON.

If an assigned value is not a plain object, the assignment will be ignored and the warning will be displayed in the console. Object attributes are always valid.

Changes in Object attribute are not observable, object needs to be copied for the Type-R to notice the change. Type-R uses `Linked` class from `@linked/value` package to simplify manipulations with immutable objects.

```javascript
@define class User extends Model {
    static attributes = {
        name : String,
        roles : { admin : true }
    }
}

user.$.roles.at( 'user' ).set( false );
```

### `attribute` : Function

Function as an attribute value. Please note that functions are not serializable.

Function attributes are initialized with an empty function by default. If something other than function will be assigned, it will be ignored with a error in a console.

### `attribute` : ClassConstructor

If the class constructor used as an attribute type and it's not a model or collection subclass, it is considered to be an **immutable attribute**. Type-R has following assumptions on immutable attributes class:

- It has `toJSON()`
- Its constructor can take JSON as a single argument.

Changes in immutable attributes *are not observable*, object needs to be replaced with its updated copy for the model to notice the change. The class itself doesn't need to be immutable, though, as Type-R makes no other assumptions.

## Aggregated models

Aggregated models are the part of the model represented in JSON as nested objects. Aggregated models **will** be copied, destroyed, and validated together with the parent.

Model has an exclusive ownership rights on its aggregated attributes. Aggregated models can't be assigned to another model's attribute unless the source attribute is cleared or the target attribute is a reference.

Aggregated models are deeply observable. A change of the aggregated model's attributute will trigger the `change` event on its parent.

### `attribute` : ModelClass

Model attribute containing another model. Describes an attribute represented in JSON as an object.

- Attribute **is** serializable as `{ attr1 : value1, attr2 : value2, ... }`
- Changes of enclosed model's attributes **will not** trigger change of the model.

```javascript
static attributes = {
    users : Collection.of( User ),
    selectedUser : memberOf( 'users' )
}
```

### `attribute` : Collection.of( ModelClass )

Collection containing models. The most popular collection type describing JSON array of objects.

- Collection **is** serializable as `[ { ...user1 }, { ...user2 }, ... ]`
- All changes to enclosed model's attributes are treated as a change of the collection.

```javascript
static attributes = {
    users : Collection.of( User )
}
```

## Serializable model references

Model attribute with reference to existing models or collections. Referenced objects **will not** be copied, destroyed, or validated as a part of the model.

References can be either deeply observable **or** serializable.

Serializable id-references is a Type-R way to describe many-to-one and many-to-many relashionship in JSON. Models must have an id to have serializable references. Serializable id-references are not observable.

Id references represented as model ids in JSON and appears as regular models at run time. Ids are being resolved to actual model instances with lookup in the base collection **on first attribute access**, which allows the definition of a complex serializable object graphs consisting of multiple collections of cross-referenced models fetched asynchronously.

### baseCollection parameter

`baseCollection` argument could be:

- a direct reference to the singleton collection object
- a function returning the collection which is called in a context of the model
- a symbolic path, which is a string with a dot-separated path resolved relative to the model's `this`.

### `attribute` : ModelClass.memberOf( baseCollection )

Model attribute holding serializable id-reference to a model from the base collection. Used to describe one-to-may relashioship with a model attribute represented in JSON as a model id.

- Attribute **is** serializable as `model.id`
- Changes of enclosed model's attributes **will not** trigger the change of the attribute.

Attribute can be assigned with either the model from the base collection or the model id. If there are no such a model in the base collection **on the moment of first attribute access**, the attribute value will be `null`.

```javascript
static attributes = {
    // Nested collection of users.
    users : Collection.of( User ),

    // Model from `users` serializable as `user.id`
    selectedUser : memberOf( 'users' )
}
```

### `attribute` : Collection.subsetOf( baseCollection )

Collection of id-references to models from base collection. Used to describe many-to-many relationship with a collection of models represented in JSON as an array of model ids. The subset collection itself **will be** be copied, destroyed, and validated as a part of the owner model, but not the models in it.

- Collection **is** serializable as `[ user1.id, user2.id, ... ]`.
- Changes of enclosed model's attributes **will not** trigger change of the collection.

If some models are missing in the base collection **on the moment of first attribute access**, such a models will be removed from a subset collection.

```javascript
static attributes = {
    // Nested collection of users.
    users : Collection.of( User ),

    // Collection with a subset of `users` serializable as an array of `user.id`
    selectedUsers : Collection.subsetOf( 'users' ) // 'users' == function(){ return this.users }
}
```

### `class` Store

In Type-R, stores are the subclasses of models which can be referenced in base collection symbolic paths as `store`.
Stores are used as root models holding the collections of other models with serializable references.

When a symbolic path to the base collection starts with `store`, store is being resolved as follows:

TODO

## Observable references

Non-serializable run time reference to models or collections. Used to describe a temporary observable application state.

### `attribute` : refTo( ModelOrCollection )

Model attribute holding a reference to a model or collection.

- Attribute **is not** serializable.
- Changes of enclosed model's attributes **will** trigger change of the model.

```javascript
static attributes = {
    users : refTo( Collection.of( User ) ),
    selectedUser : refTo( User )
}
```

### `attribute` : Collection.ofRefsTo( User )

Collection of references to models. The collection itself **will be** be copied, destroyed, and validated as a part of the model, but not the models in it.

- Collection **is not** serializable.
- Changes of enclosed model's attributes **will** trigger change of the collection.

```javascript
static attributes = {
    users : Collection.of( User ),
    selectedUsers : Collection.ofRefsTo( User )
}
```

## Attribute metadata

### `attribute` : type(Type)

In Type-R, every aspect of a model behavior can be customized on the attribute level through the attaching metadata to the attribute definitions. Since the attribute definition is a regular JavaScript, an attribute definition with metadata can be shared and reused across the different models and projects. Such an object is called *attribute metatype*.

Metadata is attached through a chain of calls after the `type( Ctor )` call. Attribute's default value is the most common example of such a metadata.

```javascript
import { define, type, Model }

const AString = type( String ).value( "a" );

@define class Dummy extends Model {
    static attributes = {
        a : AString,
        b : type( String ).value( "b" )
    }
}
```

### `attribute` : type(Constructor).value(defaultValue)

Declare an attribute with type Constructor having the custom `defaultValue`. Normally, all attributes are initialized with a default constructor call.

```javascript
@define class Person extends Model {
    static attributes = {
        phone : type( String ).value( null ) // String attribute which is null by default.
        ...
    }
}
```

### `attribute` : value( defaultValue )

Similar to `type( T ).value( x )`, but infers the type from the default value. So, for instance, `type( String )` is equivalent to `value("")`.

```javascript
import { define, type, Model }

@define class Dummy extends Model {
    static attributes = {
        a : value( "a" )
    }
}
```

### `metatype` type( Type ).check( predicate, errorMsg? )

Attribute-level validator.

- `predicate : value => boolean` is the function taking attribute's value and returning `true` whenever the value is valid.
- optional `errorMsg` is the error message which will be passed in case if the validation fail.

If `errorMsg` is omitted, error message will be taken from `predicate.error`. It makes possible to define reusable validation functions.

```javascript
function isAge( years ){
    return years >= 0 && years < 200;
}

isAge.error = "Age must be between 0 and 200";
```

Attribute may have any number of checks attached which are being executed in a sequence. Validation stops when first check in sequence fails.
It can be used to define reusable attribute types as demonstrated below:

```javascript
// Define new attribute metatypes encapsulating validation checks.
const Age = type( Number )
                .check( x => x == null || x >= 0, 'I guess you are a bit older' )
                .check( x => x == null || x < 200, 'No way man can be that old' );

const Word = type( String ).check( x => indexOf( ' ' ) < 0, 'No spaces allowed' );

@define class Person extends Model {
    static attributes = {
        firstName : Word,
        lastName : Word,
        age : Age
    }
}
```

### `metatype` type( Type ).required

The special case of attribute-level check cutting out empty values. Attribute value must be truthy to pass, `"Required"` is used as validation error.

`isRequired` is the first validator to check, no matter in which order validators were attached.

### `attribute` : type(Type).get(`hook`)

Attach get hook to the model's attribute. `hook` is the function of signature `( value, attr ) => value` which is used to transform the attribute's value right _before it will be read_. Hook is executed in the context of the model.

### `attribute` : type(Type).set(`hook`)

Attach the set hook to the model's attribute. `hook` is the function of signature `( value, attr ) => value` which is used to transform the attribute's value _before it will be assigned_. Hook is executed in the context of the model.

If set hook will return `undefined`, it will cancel attribute update.

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

### `metatype` type( Type ).watcher( watcher )

Attach custom reaction on attribute change. `watcher` can either be the model's method name or the function `( newValue, attr ) => void`. Watcher is executed in the context of the model.

```javascript
@define class User extends Model {
    static attributes = {
        name : type( String ).watcher( 'onNameChange' ),
        isAdmin : Boolean,
    }

    onNameChange(){
        // Cruel. But we need it for the purpose of the example.
        this.isAdmin = this.name.indexOf( 'Admin' ) >= 0;
    }
}
```

### `metatype` type( ModelOrCollection ).changeEvents( false )

Turn off observable changes for the attribute.

Model automatically listens to change events of all nested models and collections triggering appropriate change events for its attributes. This declaration turns it off for the specific attribute.

### `metatype` type( Type ).events({ eventName : handler, ... })

Automatically manage custom event subscription for the attribute. `handler` is either the method name or the handler function. `Type` needs to be a `Messenger` subclass from `@type-r/mixture` or include it as a mixin.

Both `Model` and `Collection` includes `Messenger` as a mixin.

### `metatype` type( Type ).endpoint( `endpoint` )

Override or define an I/O endpoint for the specific model's attribute.
