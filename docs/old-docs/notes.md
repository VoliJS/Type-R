# class Model

The `Model` class is a main building block of Type-R representing serializable observable objects. Models are mapped to objects in JSON according to the types in attributes definition. Model asserts attribute types on assignment and guarantee that these types will be preserved at run time, continuously checking the client-server protocol and guarding it from errors on both ends.

There are four sorts of model attributes:

- **Primitive** (Number, String, Boolen).
- **Immutable** (Date, Array, Object, or custom immutable class).
- **Aggregated**, used to describe nested JSON objects and arrays with typed models and collections.
- **Reference**, used to model one-to-many and many-to-many relashinships, which can be either:
    - **serializable** to JSON as an ids of the referenced models;
    - **observable**, which is excluded from JSON serialization.

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

#### `attrDef` : Number

JS `number` primitive type. Assigned value (except `null`) is automatically converted to `number` with a constructor call `Number( value )`.

If something other than `null`, number, or a proper string representation of number is being assigned, the result of the convertion is `NaN` and the warning
will be displayed in the console. Models with `NaN` in their `Number` attributes will fail the validation check.

#### `attrDef` : Boolean

JS `boolean` primitive type. Assigned value (except `null`) is automatically converted to `true` or `false` with a constructor call `Boolean( value )`.

This attribute type is always valid.

#### `attrDef` : String

JS `string` primitive type. Assigned value (except `null`) is automatically converted to `string` with a constructor call `String( value )`.

This attribute type is always valid.

#### `attrDef` : Date

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

#### `attrDef` : Array

Plain JSON `Array` type primarily used to represent lists of primitives (use nested collections for arrays of objects). If an assigned value is not an `Array`, the assignment will be ignored and a warning will be displayed in the console.

Array attributes are always valid.

Note that the changes to an `Array` attribute are not observable; arrays are treated as immutables and need to be replaced for the model to notice the change.

```javascript
@define class User extends Model {
    static attributes = {
        name : '',
        email : String, // ''
        createdAt : Date
    }
}
```

#### `attrDef` : Object

Plain JSON object type primarily used to represent hashmaps of primitives (use nested collection with custom serialization for a hashmap of objects). If an assigned value is not a plain object, the assignment will be ignored and the warning will be displayed in the console.

Object attributes are always valid.

Note that the changes to an `Object` attribute are not observable; objects are treated as immutables and need to be replaced for the model to notice the change.

```javascript
@define class User extends Model {
    static attributes = {
        name : '',
        email : String, // ''
        createdAt : Date
    }
}
```

## Aggregating attributes

Aggregated attributes are the part of the model. Nested models and collections **will** be copied, destroyed, and validated together with the containing model. Aggregating attribute has an exclusive ownership on its value, it can't be assigned to another attribute unless the source attribute is cleared or the target attribute has a reference type.

Aggregated attributes are serializable as nested JSON **and** deeply observable.

### `attrDef` : Model

Model attribute containing another model. Describes an attribute represented in JSON as an object.

- Attribute **is** serializable as `{ attr1 : value1, attr2 : value2, ... }`
- Changes of enclosed model's attributes **will not** trigger change of the model.

```javascript
static attributes = {
    users : Collection.of( User ),
    selectedUser : memberOf( 'users' )
}
```

### `attrDef` : Collection.of( User )

Collection containing models. The most popular collection type describing JSON array of objects.

- Collection **is** serializable as `[ { ...user1 }, { ...user2 }, ... ]`
- All changes to enclosed model's attributes are treated as a change of the collection.

```javascript
static attributes = {
    users : Collection.of( User )
}
```

## Attribute w/immutable data types


### Immutable class attributes

Not observable

## Reference attributes

Model attribute with reference to existing models or collections. Referenced objects **will not** be copied, destroyed, or validated as a part of the model.

References can be either deeply observable **or** serializable.

### Serializable id-references

Serializable id-references is a Type-R way to describe many-to-one and many-to-many relashionship in JSON. Models must have an id to have serializable references. Serializable id-references are not observable.

Id references represented as model ids in JSON and appears as regular models at run time. Ids are being resolved to actual model instances with lookup in the base collection **on first attribute access**, which allows the definition of a complex serializable object graphs consisting of multiple collections of cross-referenced models fetched asynchronously.

`collection` argument could be:

- a direct reference to the singleton collection object
- a function returning the collection which is called in a context of the model
- a string with a dot-separated path resolved relative to the model's `this`.

### `attrDef` attr : memberOf( baseCollection )

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

#### Collection.subsetOf( baseCollection )

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

### `attrDef` attr : refTo( ModelOrCollection )

Model attribute holding a reference to a model or collection.

- Attribute **is not** serializable.
- Changes of enclosed model's attributes **will** trigger change of the model.

```javascript
static attributes = {
    users : refTo( Collection.of( User ) ),
    selectedUser : refTo( User )
}
```

#### Collection.ofRefsTo( User )

Collection of references to models. The collection itself **will be** be copied, destroyed, and validated as a part of the model, but not the models in it.

- Collection **is not** serializable.
- Changes of enclosed model's attributes **will** trigger change of the collection.

```javascript
static attributes = {
    users : Collection.of( User ),
    selectedUsers : Collection.ofRefsTo( User )
}
```