# Core Data Structires
## Overview

## Aggregation Tree

## Definitions

Model definition must:

- be the class extending the `Model`;
- be preceded with the `@define` decorator;
- have `static attributes` definition.

### `decorator` @define

_Must_ be placed before model class definition.

```javascript
import { define, Model } from 'type-r'

@define class X extends Model {
    ...    
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

### `metatype` Type

When the function is used as `metatype`, it's treated as the constructor function. Any constructor function which behaves as _converting constructor_ (like `new Date( msecs )`) may be used as an attribute type.

```javascript
@define class Person extends Model {
    static attributes = {
        name : String // String attribute which is "" by default.
        createdAt : Date // Date attribute
        ...
    }
}
```

### `metatype` defaultValue

When value of other type than function is used as `metatype` it's treated as attribute's default value. Attribute's type is being inferred from the value.

Use the general form of attribute definition for attributes of `Function` type: `type( Function ).value( theFunction )`.

```javascript
@define class GridColumn extends Model {
    static attributes = {
        name : '', // String attribute which is '' by default.
        render : type( Function ).value( x => x ),
        ...
    }
}
```

### `metatype` type( Type ).value( defaultValue )

Declare attribute with custom default value.

```javascript
@define class Person extends Model {
    static attributes = {
        phone : type( String ).value( null ) // String attribute which is null by default.
        ...
    }
}
```

The model is _recursive_ if it's uses the type of itself in its attribute definition.

### `metatype` Date

Date attribute initialized as `new Date()`. Represented in JSON as string or number depending on the type:

* `Date` - as ISO date string.
* `Date.microsoft` - as Microsoft's `"/Date(msecs)/"` string.
* `Date.timestamp` - as UNIX integer timestamp.

### `static` Collection

The default model's collection class automatically defined for every Model subclass. Can be referenced as `Model.Collection`.

May be explicitly assigned in model's definition with custom collection class.

```javascript
// Declare the collection class.
@define class Comments extends Model.Collection {}

@define class Comment extends Model({
    static Collection = Comments; // Make it the default Comment collection.

    attributes : {
        text : String,
        replies : Comments
    }
});
```

## Model

Model behaves as regular ES6 class with attributes accessible as properties.

### new Model()

Create an instance of the model with default attribute values taken from the attributes definition.

When no default value is explicitly provided for an attribute, it's initialized as `new Type()` (just `Type()` for primitives). When the default value is provided and it's not compatible with the attribute type, it's converted with `new Type( defaultValue )` call.

### new Model({ attrName : value, ... }, options? )

When creating an instance of a model, you can pass in the initial attribute values to override the defaults.

If `{parse: true}` option is used, `attrs` is assumed to be the JSON.

If the value of the particular attribute is not compatible with its type, it's converted to the declared type invoking the constructor `new Type( value )` (just `Type( value )` for primitives).

```javascript
@define class Book extends Model {
    static attributes = {
        title  : '',
        author : ''
    }
}

const book = new Book({
  title: "One Thousand and One Nights",
  author: "Scheherazade"
});
```

### model.clone()

Create the deep copy of the aggregation tree, recursively cloning all aggregated models and collections. References to shared members will be copied, but not shared members themselves.

### `callback` model.initialize( attrs?, options? )

Called at the end of the `Model` constructor when all attributes are assigned and the model's inner state is properly initialized. Takes the same arguments as
a constructor.

### model.dispose()

Recursively dispose the model and its aggregated members. "Dispose" means that elements of the aggregation tree will unsubscribe from all event sources. It's crucial to prevent memory leaks in SPA.

The whole aggregation tree will be recursively disposed, shared members won't.

### model.cid

Read-only client-side model's identifier. Generated upon creation of the model and is unique for every model's instance. Cloned models will have different `cid`.

### model.id

Predefined model's attribute, the `id` is an arbitrary string (integer id or UUID). `id` is typically generated by the server. It is used in JSON for id-references.

Records can be retrieved by `id` from collections, and there can be just one instance of the model with the same `id` in the particular collection.

### model.isNew()

Has this model been saved to the server yet? If the model does not yet have an `id`, it is considered to be new.

### model.attrName

Model's attributes may be directly accessed as `model.name`.

<aside class="warning">Please note, that you *have to declare all attributes* in `static attributes` declaration.</aside>

```javascript
@define class Account extends Model {
    static attributes = {
        name : String,
        balance : Number
    }
}

const myAccount = new Account({ name : 'mine' });
myAccount.balance += 1000000; // That works. Good, eh?
```

### model.attrName = value

Assign the model's attribute. If the value is not compatible with attribute's type from the declaration, it is converted:

- with `Type( value )` call, for primitive types;
- with `model.attrName.set( value )`, for existing model or collection (updated in place);
- with `new Type( value )` in all other cases.

Model triggers events on changes:
- `change:attrName` *( model, value )*.
- `change` *( model )*.

```javascript
@define class Book extends Model {
    static attributes = {
        title : String,
        author : String
        price : Number,
        publishedAt : Date,
        available : Boolean
    }
}

const myBook = new Book({ title : "State management with Type-R" });
myBook.author = 'Vlad'; // That works.
myBook.price = 'Too much'; // Converted with Number( 'Too much' ), resulting in NaN.
myBook.price = '123'; // = Number( '123' ).
myBook.publishedAt = new Date(); // Type is compatible, no conversion.
myBook.publishedAt = '1678-10-15 12:00'; // new Date( '1678-10-15 12:00' )
myBook.available = some && weird || condition; // Will always be Boolean. Or null.
```

### model.set( { attrName : value, ... }, options? : `options` )

Bulk assign model's attributes, possibly taking options.

If the value is not compatible with attribute's type from the declaration, it is converted:

- with `Type( value )` call, for primitive types.
- with `model.attrName.set( value )`, for existing model or collection (updated in place).
- with `new Type( value )` in all other cases.

Model triggers events after all changes are applied:

1. `change:attrName` *( model, val, options )* for any changed attribute.
2. `change` *(model, options)*, if there were changed attributes.

### model.assignFrom( otherRecord )

Makes an existing `model` to be the full clone of `otherRecord`, recursively assigning all attributes.

```javascript
// Another way of doing the bestSeller.clone()
const book = new Book();
book.assignFrom( bestSeller );
```

### model.transaction( fun )

Execute the all changes made to the model in `fun` as single transaction triggering the single `change` event.

All model updates occurs in the scope of transactions. Transaction is the sequence of changes which results in a single `change` event.
Transaction can be opened either manually or implicitly with calling `set()` or assigning an attribute.
Any additional changes made to the model in `change:attr` event handler will be executed in the scope of the original transaction, and won't trigger additional `change` events.


```javascript
some.model.transaction( model => {
    model.a = 1; // `change:a` event is triggered.
    model.b = 2; // `change:b` event is triggered.
}); // `change` event is triggered.
```

Manual transactions with attribute assignments are superior to `model.set()` in terms of both performance and flexibility.

### `metatype` type( Type ).get( `hook` )

Attach get hook to the model's attribute. `hook` is the function of signature `( value, attr ) => value` which is used to transform the attribute's value _before it will be read_. Hook is executed in the context of the model.

### `metatype` type( Type ).set( `hook` )

Attach the set hook to the model's attribute. `hook` is the function of signature `( value, attr ) => value` which is used to transform the attribute's value _before it will be assigned_. Hook is executed in the context of the model.

If set hook will return `undefined`, it will cancel attribute update.

## Collection

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

### `metatype` RecordOrCollection

Aggregated model or collection. Represented as nested object or array in model's JSON. Aggregated members are owned by the model and treated as its _integral part_ (recursively created, cloned, serialized, validated, and disposed).
One object can have single owner. The model with its aggregated attributes forms an _aggregation tree_.

All changes in aggregated model or collections are detected and cause change events on the containing model.

### model.getOwner()

Return the model which is an owner of the current model, or `null` there are no one.

Due to the nature of _aggregation_, an object may have one and only one owner.

### model.collection

Return the collection which aggregates the model, or `null` if there are no one.

### `metatype` shared( RecordOrCollection )

Non-serializable reference to the model or collection possibly from the different aggregation tree. Initialized with `null`. Is not recursively cloned, serialized, validated, or disposed.

All changes in shared models or collections are detected and cause change events of the containing model.

<aside class="notice">The type of <code>attrDef</code>{ name : defaultValue } is inferred as `shared( Type )` if it extends Model or Collection</aside>

```javascript
@define class UsersListState extends Model {
    static attributes = {
        users : User.Collection,
        selected : shared( User ) // Can be assigned with the user from this.users
    }
}
```

### `metatype` Collection.Refs

Non-aggregating collection. Collection of references to shared models which itself is _aggregated_ by the model, but _does not aggregate_ its elements. In contrast to the `shared( Collection )`, `Collection.Refs` creates an instance of collection which _is the part the parent record_.

The collection itself is recursively created and cloned. However, its models are not aggregated by the collection thus they are not recursively cloned, validated, serialized, or disposed.

All changes in the collection and its elements are detected and cause change events of the containing model.

<aside class="notice"><code>Collection.Refs</code> is the constructor and can be used to create non-aggregating collection with `new` operator.</aside>

```javascript
    @define class MyRecord extends Model {
        static attributes = {
            notCloned : shared( SomeCollection ), // Reference to the _shared collection_ object.
            cloned : SomeCollection.Refs // _Aggregated_ collection of references to the _shared models_.
    }
```

### `decorator` @predefine

Make forward declaration for the model to define its attributes later with `RecordClass.define()`. Used instead of `@define` for recursive model definitions.

Creates the default `RecordClass.Collection` type which can be referenced in attribute definitions.

### `static` define({ attributes : { name : `metatype`, ... } })

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
