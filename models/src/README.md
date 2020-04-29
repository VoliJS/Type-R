# Defining the model

## Overview

`Model` is a class with typed attributes which is automatically serializable to JSON and is as easy to use as a plain JS object.

Any model can be serialized to and restored from JSON. Model checks attribute types on assignment rejecting improper attribute updates. It adds safety to JS programming, and augment TypeScript with a dynamic type checks guarding the client-server protocol from errors on both ends. By default, model put warnings to console in case of type errors, which can be turned to exceptions in case of the unit test.

Model declarations looks close to the shape of JSON objects they describe.

```javascript
// Create Role model's constructor.
const Role = attributes({
    createdAt : Date, // date, represented as UTC string in JSON.
    name : String // A string. Guaranteed.
});

// Create Role model's constructor.
const User = attributes({
    name : String,

    isActive : Boolean, // always boolean, no matter what is assigned.

    // Nested collection of roles, represented as an array of objects in JSON.
    roles : [Role],
    
    // Nested model, represented as nested object in JSON.
    permissions : {
        canDoA : Boolean,
        canDoB : Boolean,
    }
});

const user = User.from( json, { parse : true });
user.permissions.canDoA = true;
console.log( user.toJSON() );
```

Models may have I/O endpoints attached. There are several endpoints awailable in `@type-r/endpoints` package, including the standard REST endpoint.

```javascript
// Use the class form of the model definition.
@define class User extends Model {
    // Bind the REST endpoint to enable I/O API.
    static endpoint = restfulIO( '/api/users' );

    // Define the attributes.
    static attributes = {
        name : String,
        // ...
    }
}

// Fetch the users list.
const users = await Collection.of( User ).create().fetch();
const firstUser = users.first();
firstUser.isActive = true;
await firstUser.save();
```

Model observe changes in its attributes, including the changes in nested models and collections. Listeners can subscribe and unsubscribe for change events, which makes it easy to integrate models with virtually any view layer.

```javascript
// Subscribe for the changes...
users.onChanges( () => console.log( 'changes!' ) );

users.first().name = "another name";
// changes!
```

All aspects of model behavior can be controlled on the attribute level through the attribute metadata. It makes it easy to define reusable attribute types with custom serialization, validation, and reactions on changes.

```javascript
 // Email attribute is a string...
const Email = type( String )
    // ...having @ symbol in it.
    .check( x => !x || x.indexOf( '@' ) >= 0, 'Must be an email' );

const User = attributes({
    email : Email.required // Has not be empty to be valid.
    
    // Date which is `null` by default, read it from JSON, but don't save it back.
    createdAt : type( Date ).null.dontSave,
    
    //...
})
```

There are four sorts of model attributes:

- **Primitive** types (Number, String, Boolen) mapped to JSON directly.
- **Immutable** types (Date, Array, Object, or custom immutable class).
- **Nested** models and collections represented as nested objects and arrays of objects in JSON.
- **Referenced** models and collections. References can be:
    - **serializable** to JSON as an ids of the referenced models, used to model one-to-many and many-to-many relashinships in JSON;
    - **observable**, which is a non-persistent run-time only reference, used to model temporary application state.

### attributes( attrDefs )

Create the Model class constructor from the attribute definitions.

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

## Nested models

Nested models are the part of the model represented in JSON as nested objects. Nested models **will** be copied, destroyed, and validated as a part of the parent.

Model has an exclusive ownership rights on its nested members. Nested model can't be assigned to another model's attribute unless the source attribute is cleared or the target attribute has a reference type.

Nested models are deeply observable. A change of the nested model's attributute will trigger the `change` event on its parent.

### `attribute` : ModelClass

Nested model. Describes an attribute represented in JSON as an object.

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

Convert attribute type to a _metatype_, which is a combination of type and metadata. Attribute's default value is the common example of the a metadata. Metadata can control all aspects of attribute behavior and. It's is added through a chain of calls after the `type( Type )` call.

Following values can be used as a `Type`:

- Constructor functions.
- Plain object, meaning the nested model with a given attributes.
- Array with either constructor or plain object inside, meaning the collection of models.

```javascript
import { define, type, Model }

const Role = attributes({
    name : String
})

const User = attributes({
    name : type( String ).value( 'change me' ),
    createdAt : type( Date ).dontSave
    
    permissions : type({
        canDoA : true,
        canDoB : true
    }),

    roles : type( [Role] ) // type( Collection.of( Role ) )

    flags : type( [{ // type( Collection.of( attributes({ name : String }) ) )
        name : String
    }])
});
```

Since the attribute definition is a regular JavaScript, attribute metatype definition can be shared and reused across the different models and projects.

```javascript
import { define, type, Model }

const AString = type( String ).value( "a" );

const Dummy = attributes({
    a : AString,
    b : type( String ).value( "b" )
});
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

### `attribute` : type(Constructor).null

Shorthand for `type(Constructor).value( null )`.

```javascript
@define class Person extends Model {
    static attributes = {
        phone : type( String ).null // String attribute which is null by default.
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

Attribute validation check.

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

Attribute validator checking that the attribute is not empty. Attribute value must be truthy to pass, `"Required"` string is used as validation error.

`required` validator always checked first, no matter in which order validators were attached.

### `attribute` : type(Type).get( ( value, attr ) => value )

Transform the value right _before it will be read_. The hook is executed in the context of the model.

### `attribute` : type(Type).set( ( value, attr ) => value )

Transform the value right _before it will be assigned_. The hook is executed in the context of the model.

If set hook will return `undefined`, the attribute won't be assigned.

### `metatype` type( Type ).dontSave

Do _not_ serialize the attribute.

### `metatype` type( Type ).toJSON( ( value, name, options ) => json )

Override the way how the attribute transforms to JSON. Attribute is not serialized when the function return `undefined`.

### `metatype` type( Type ).parse( ( json, name ) => value )

When restoring attribute from JSON, transform the value before it will be assigned.

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
