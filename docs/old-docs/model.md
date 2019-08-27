# Model

Model is an optionally persistent class having the predefined set of attributes. Each attribute is the property of known type which is protected from improper assigments at run-time, is serializable to JSON by default, has deeply observable changes, and may have custom validation rules attached.

Records may have other models and collections of models stored in its attributes describing an application state of an arbitrary complexity. These nested models and collections are considered to be an integral part of the parent model forming an *aggregation tree* which can be serialized to JSON, cloned, and disposed of as a whole.

All aspects of an attribute behavior are controlled with attribute metadata, which (taken together with its type) is called *attribite metatype*. Metatypes can be declared separately and reused across multiple models definitions.

```javascript
import { define, type, Model } from 'type-r'

// ⤹ required to make magic work  
@define class User extends Model {
    // ⤹ attribute's declaration
    static attributes = {
        firstName : '', // ⟵ String type is inferred from the default value
        lastName  : String, // ⟵ Or you can just mention its constructor
        email     : type(String).value(null), //⟵ Or you can provide both
        createdAt : Date, // ⟵ And it works for any constructor.
        // And you can attach ⤹ metadata to fine-tune attribute's behavior
        lastLogin : type(Date).value(null).toJSON(false) // ⟵ not serializable
    }
}

const user = new User();
console.log( user.createdAt ); // ⟵ this is an instance of Date created for you.

const users = new User.Collection(); // ⟵ Collections are defined automatically.
users.on( 'changes', () => updateUI( users ) ); // ⟵ listen to the changes.

users.set( json, { parse : true } ); // ⟵ parse raw JSON from the server.
users.updateEach( user => user.firstName = '' ); // ⟵ bulk update triggering 'changes' once
```

## Definition

Model definition is ES6 class extending `Model` preceeded by `@define` class decorator. 

Unlike in the majority of the JS state management framework, Model is <b>not the key-value hash</b>. Model has typed attributes with metadata controlling different aspects of attribute beavior. Therefore, developer needs to create the Model subclass to describe the data structure of specific shape, in a similar way as it's done in statically typed languages. The combination of an attribute type and metadata is called *metatype* and can be reused across model definitions.

The minimal model definition looks like this:

```javascript
@define class MyRecord extends Model {
    static attributes = {
        name : ''
    }
}
```

### `static` attributes = { name : `metatype`, ... }

Model's attributes definition. Lists attribute names along with their types, default values, and metadata controlling different aspects of attribute behavior.

```javascript
@define class User extends Model {
    static attributes = {
        name    : type( String ).value( 'John Dow' ),
        email   : 'john.dow@mail.com', // Same as type( String ).value( 'john.dow@mail.com' )
        address : String, // Same as type( String ).value( '' )
    }
}
```

The Model guarantee that _every attribute will retain the value of the declared type_. Whenever an attribute is being assigned with the value which is not compatible with its declared type, the type is being converted with an invocation of the constructor: `new Type( value )` (primitive types are treated specially).


### Constructor

Constructor function is the simplest form of attribute definition. Any constructor function which behaves as _converting constructor_ (like `new Date( msecs )`) may be used as an attribute type.

```javascript
@define class Person extends Model {
    static attributes = {
        name : String, // String attribute which is "" by default.
        createdAt : Date, // Date attribute
        ...
    }
}
```

### `metatype` defaultValue

Any non-function value used as attribute definition is treated as an attribute's default value. Attribute's type is being inferred from the value.

Type cannot be properly inferred from the `null` values and functions.
Use the general form of attribute definition in such cases: `value( theFunction )`, `type( Boolean ).value( null )`.

```javascript
@define class GridColumn extends Model {
    static attributes = {
        name : '', // String attribute which is '' by default.
        render : value( x => x ), // Infer Function type from the default value.
        ...
    }
}
```

If model needs to reference itself in its attributes definition, `@predefine` decorator with subsequent `MyRecord.define()` needs to be used.

### `metatype` Date

Date attribute initialized as `new Date()`, and represented in JSON as UTC ISO string.

There are other popular Date serialization options available in `type-r/ext-types` package.

* `MicrosoftDate` - Date serialized as Microsoft's `"/Date(msecs)/"` string.
* `Timestamp` - Date serializaed as UNIX integer timestamp (`date.getTime()`).

### `static` Collection

The default model's collection class automatically defined for every Model subclass. Can be referenced as `Model.Collection`.

May be explicitly assigned in model's definition with custom collection class.

```javascript
// Declare the collection class.
@define class Comments extends Model.Collection {}

@define class Comment extends Model{
    static Collection = Comments; // Make it the default Comment collection.

    static attributes = {
        text : String,
        replies : Comments
    }
}
```

## Nested models and collections

Model's attributes can hold other Records and Collections, forming indefinitely nested data structures of arbitrary complexity.
To create nested model or collection you should just mention its constructor function in attribute's definition.

```javascript
import { Model } from 'type-r'

@define class User extends Model {
    static attributes = {
        name : String,
        email : String,
        isActive : true
    }
}

@define class UsersListState extends Model {
    static attributes = {
        users : User.Collection
    }
}
```

All nested models and collections are *aggregated* by default and behave as integral parts of the containing model. Aggregated attributes are _exclusively owned_ by the model, and taken with it together form an _ownership tree_. Many operations are performed recursively on aggregated elements:

- They are created when the owner model is created.
- They are cloned when the model is cloned.
- They are disposed when the model is disposed.
- They are validated as part of the model.
- They are serialized as nested JSON.

The nature of aggregation relationship in OO is explained in this [article](https://medium.com/@gaperton/nestedtypes-2-0-meet-an-aggregation-and-the-rest-of-oo-animals-a9fca7c36ecf).

### `metatype` RecordOrCollection

Aggregated model or collection. Represented as nested object or array in model's JSON. Aggregated members are owned by the model and treated as its _integral part_ (recursively created, cloned, serialized, validated, and disposed).
One object can have single owner. The model with its aggregated attributes forms an _aggregation tree_.

All changes in aggregated model or collections are detected and cause change events on the containing model.

### `metatype` refTo( Record_or_Collection )

Non-serializable reference to the model or collection possibly from the different aggregation tree. Initialized with `null`. Is not recursively cloned, serialized, validated, or disposed.

All changes in shared models or collections are detected and cause change events of the containing model.

<aside class="notice">The type of <code>attrDef</code>{ name : defaultValue } is inferred as `shared( Type )` if it extends Model or Collection</aside>

```javascript
@define class UsersListState extends Model {
    static attributes = {
        users : User.Collection,
        selected : refTo( User ) // Can be assigned with the user from this.users
    }
}
```

### `constructor` Collection.ofRefsTo( ModelClass )

Non-aggregating collection. Collection of references to shared models which itself is _aggregated_ by the model, but _does not aggregate_ its elements. In contrast to the `refTo( Collection.of( Model ) )`, `Collection.ofRefsTo( Model )` is an actual constructor and creates an instance of collection which _is the part the parent record_.

The collection itself is recursively created and cloned. However, its models are not aggregated by the collection thus they are not recursively cloned, validated, serialized, or disposed.

All changes in the collection and its elements are detected and cause change events of the containing model.

<aside class="notice"><code>Collection.Refs</code> is the constructor and can be used to create non-aggregating collection with `new` operator.</aside>

```javascript
    @define class MyRecord extends Model {
        static attributes = {
            notCloned : refTo( Collection.of( SomeModel ) ), // Reference to the _shared collection_ object.
            cloned : Collection.ofRefsTo( SomeModel ) // _Aggregated_ collection of references to the _shared models_.
        }
    }
```

### `decorator` @predefine

Make forward declaration for the model to define its attributes later with `RecordClass.define()`. Used instead of `@define` for recursive model definitions.

Creates the default `RecordClass.Collection` type which can be referenced in attribute definitions.

### `static` define({ attributes : { name : `metatype`, ... }})

May be called to define attributes in conjunction with `@predefine` decorator to make recursive model definitions.

```javascript
@predefine class Comment extends Model{}

Comment.define({
    attributes : {
        text : String,
        replies : Comment.Collection
    }
});
```
