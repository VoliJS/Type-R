# Record

Record is an optionally persistent class having the predefined set of attributes. Each attribute is the property of known type which is protected from improper assigments at run-time, is serializable to JSON by default, has deeply observable changes, and may have custom validation rules attached.

Records may have other records and collections of records stored in its attributes describing an application state of an arbitrary complexity. These nested records and collections are considered to be an integral part of the parent record forming an *aggregation tree* which can be serialized to JSON, cloned, and disposed of as a whole.

All aspects of an attribute behavior are controlled with attribute metadata, which (taken together with its type) is called *attribite metatype*. Metatypes can be declared separately and reused across multiple records definitions.

```javascript
import { define, type, Record } from 'type-r'

// ⤹ required to make magic work  
@define class User extends Record {
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

```typescript
import { define, attr, type, Record } from 'type-r'
import "reflect-metadata" // Required for @auto without arguments

// ⤹ required to make the magic work  
@define class User extends Record {
    // ⤹ attribute's declaration
    // IMPORTANT: attributes will be initialized even if no default value is provided.
    @auto lastName  : string // ⟵ @auto decorator extracts type from the Reflect metadata
    @auto createdAt : Date // ⟵ It works for any constructor.
    @auto('somestring') firstName : string //⟵ The custom default value must be passed to @auto decorator.
    @auto(null) updatedAt : Date 

    // You have to pass the type explicitly if reflect-metadata is not used.
    @type(String).as email : string

    // Or, you can tell Type-R to infer type from the default value.
    @value('').as email2 : string

    // Type cannot be inferred from null default values, and needs to be specified explicitly
    @type(String).value(null).as email3 : string 
        
    // You can attach ⤹ metadata to fine-tune attribute's behavior
    @type(Date).toJSON(false).as
        lastLogin : Date// ⟵ not serializable
}

const user = new User();
console.log(user.createdAt); // ⟵ this is an instance of Date created for you.

const users : Collection<User> = new User.Collection(); // ⟵ Collections are defined automatically.
users.on('changes', () => updateUI(users)); // ⟵ listen to the changes.

users.set(json, { parse : true }); // ⟵ parse raw JSON from the server.
users.updateEach( user => user.firstName = '' ); // ⟵ bulk update triggering 'changes' once
```

## Definition

Record definition is ES6 class extending `Record` preceeded by `@define` class decorator. 

Unlike in the majority of the JS state management framework, Record is <b>not the key-value hash</b>. Record has typed attributes with metadata controlling different aspects of attribute beavior. Therefore, developer needs to create the Record subclass to describe the data structure of specific shape, in a similar way as it's done in statically typed languages. The combination of an attribute type and metadata is called *metatype* and can be reused across record definitions.

The minimal record definition looks like this:

```javascript
@define class MyRecord extends Record {
    static attributes = {
        name : ''
    }
}
```

```typescript
@define class MyRecord extends Record {
    @auto name : string
}
```

### `static` attributes = { name : `attrDef`, ... }

Record's attributes definition. Lists attribute names along with their types, default values, and metadata controlling different aspects of attribute behavior.

```javascript
@define class User extends Record {
    static attributes = {
        name    : type( String ).value( 'John Dow' ),
        email   : 'john.dow@mail.com', // Same as type( String ).value( 'john.dow@mail.com' )
        address : String, // Same as type( String ).value( '' )
    }
}
```

```typescript
// You should not use `static attributes` in TypeScript. Use decorators instead.
@define class User extends Record {
    // Complete form of an attribute definition.
    @type( String ).value( 'John Dow' ).as name : string,

    // Attribute type is inferred from the default value.
    @value( 'john.dow@mail.com' ).as email : string , // Same as @type( String ).value( 'john.dow@mail.com' ).as

    // Attribute type is inferred from the TypeScript type declaration.
    @auto address : string, // Same as @type( String ).value( '' )

    // Same as above, but with a custom default value.
    @auto( 'john.dow@mail.com' ) email2 : string // Same as @value( 'john.dow@mail.com' ).as
}

```

The Record guarantee that _every attribute will retain the value of the declared type_. Whenever an attribute is being assigned with the value which is not compatible with its declared type, the type is being converted with an invocation of the constructor: `new Type( value )` (primitive types are treated specially).

### `static` idAttribute = 'attrName'

A record's unique identifier is stored under the pre-defined `id` attribute.
If you're directly communicating with a backend (CouchDB, MongoDB) that uses a different unique key, you may set a Record's `idAttribute` to transparently map from that key to id.

Record's `id` property will still be linked to Record's id, no matter which value `idAttribute` has.

```javascript
@define class Meal extends Record {
  static idAttribute =  "_id";
  static attributes = {
      _id : Number,
      name : ''
  }
}

const cake = new Meal({ _id: 1, name: "Cake" });
alert("Cake id: " + cake.id);
```
```typescript
@define class Meal extends Record {
  static idAttribute =  "_id";
  
  @auto _id : number
  @auto name : string
}

const cake = new Meal({ _id: 1, name: "Cake" });
alert("Cake id: " + cake.id);
```

### `attrDef` : Constructor

Constructor function is the simplest form of attribute definition. Any constructor function which behaves as _converting constructor_ (like `new Date( msecs )`) may be used as an attribute type.

```javascript
@define class Person extends Record {
    static attributes = {
        name : String, // String attribute which is "" by default.
        createdAt : Date, // Date attribute
        ...
    }
}
```

```typescript
// In typescript, @auto decorator will extract constructor function from the TypeScript type
@define class Person extends Record {
    @auto name : string // String attribute which is "" by default.
    @auto createdAt : Date // Date attribute

    // Or, it can be specified explicitly with @type decorator.
    @type( Date ).as updatedAt : Date // Date attribute
    ...
}
```

### `attrDef` : defaultValue

Any non-function value used as attribute definition is treated as an attribute's default value. Attribute's type is being inferred from the value.

Type cannot be properly inferred from the `null` values and functions.
Use the general form of attribute definition in such cases: `value( theFunction )`, `type( Boolean ).value( null )`.

```javascript
@define class GridColumn extends Record {
    static attributes = {
        name : '', // String attribute which is '' by default.
        render : value( x => x ), // Infer Function type from the default value.
        ...
    }
}
```

```typescript
// In typescript, @value decorator will extract constructor function from the default value.
@define class GridColumn extends Record {
    @value( '' ).as name : string // String attribute which is '' by default.
    @value( x => x ).as render : Function
    ...
}
```

### `attrDef` : type(Constructor).value(defaultValue)

Declare an attribute with type T having the custom `defaultValue`.

```javascript
@define class Person extends Record {
    static attributes = {
        phone : type( String ).value( null ) // String attribute which is null by default.
        ...
    }
}
```

```typescript
@define class Person extends Record {
    @type( String ).value( null ).as phone : string // String attribute which is null by default.

    // There's an easy way of doing that in TypeScript.
    @auto( null ).as phone : string
    ...
}
```

If record needs to reference itself in its attributes definition, `@predefine` decorator with subsequent `MyRecord.define()` needs to be used.

### `attrDef` : Date

Date attribute initialized as `new Date()`, and represented in JSON as UTC ISO string.

There are other popular Date serialization options available in `type-r/ext-types` package.

* `MicrosoftDate` - Date serialized as Microsoft's `"/Date(msecs)/"` string.
* `Timestamp` - Date serializaed as UNIX integer timestamp (`date.getTime()`).

```typescript
@define class Person extends Record {
    @auto justDate : Date
    // MicrosoftDate is an attribute metatype, not a real type, so you must pass it explictly.
    @type( Timestamp ).as createdAt : Date
    ...
}
```

### `static` Collection

The default record's collection class automatically defined for every Record subclass. Can be referenced as `Record.Collection`.

May be explicitly assigned in record's definition with custom collection class.

```javascript
// Declare the collection class.
@define class Comments extends Record.Collection {}

@define class Comment extends Record{
    static Collection = Comments; // Make it the default Comment collection.

    static attributes = {
        text : String,
        replies : Comments
    }
}
```

```typescript
// Declare the collection class.
@define class Comments extends Collection<Comment> {}

@define class Comment extends Record{
    static Collection = Comments; // Make it the default Comment collection.

    @auto text : String
    @auto replies : Comments
}
```

### `attrDef` type(Type)

Attribute definition can have different metadata attached which affects various aspects of attribute's behavior. Metadata is attached with
a chain of calls after the `type( Ctor )` call. Attribute's default value is the most common example of such a metadata and is the single option which can be applied to the constructor function directly.

```javascript
import { define, type, Record }

@define class Dummy extends Record {
    static attributes = {
        a : type( String ).value( "a" )
    }
}
```

```typescript
import { define, type, Record }

@define class Dummy extends Record {
    @type( String ).value( "a" ).as a : string
}
```

## Definitions in TypeScript

Type-R supports several options to define record attributes.

### `decorator` @auto

Turns TypeScript class property definition to the record's attribute, automatically extracting attribute type from the TypeScript type annotation. Requires `reflect-metadata` npm package and `emitDecoratorMetadata` option set to true in the `tsconfig.json`.

`@auto` may take a single parameter as an attribute default value. No other attribute metadata can be attached.

```typescript
import { define, auto, Record } from 'type-r'

@define class User extends Record {
    @auto name : string
    @auto( "john@verizon.com" ) email : string
    @auto( null ) updatedAt : Date
}
```

### `decorator` @`attrDef`.as

Attribute definition creates the TypeScript property decorator when being appended with `.as` suffix. It's an alternative syntax to `@auto`.

```typescript
import { define, type, Record } from 'type-r'

@define class User extends Record {
    @value( "5" ).as name : string
    @type( String ).toJSON( false ).as email : string
}
```

## Create and dispose

Record behaves as regular ES6 class with attributes accessible as properties.

### new Record()

Create an instance of the record with default attribute values taken from the attributes definition.

When no default value is explicitly provided for an attribute, it's initialized as `new Type()` (just `Type()` for primitives). When the default value is provided and it's not compatible with the attribute type, it's converted with `new Type( defaultValue )` call.

### new Record({ attrName : value, ... }, options?)

When creating an instance of a record, you can pass in the initial attribute values to override the defaults.

If `{parse: true}` option is used, `attrs` is assumed to be the JSON.

If the value of the particular attribute is not compatible with its type, it's converted to the declared type invoking the constructor `new Type( value )` (just `Type( value )` for primitives).

```javascript
@define class Book extends Record {
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

```typescript
@define class Book extends Record {
    @auto title : string
    @auto author : string
}

const book = new Book({
  title: "One Thousand and One Nights",
  author: "Scheherazade"
});
```

### record.clone()

Create the deep copy of the aggregation tree, recursively cloning all aggregated records and collections. References to shared members will be copied, but not shared members themselves.

### `callback` record.initialize(attrs?, options?)

Called at the end of the `Record` constructor when all attributes are assigned and the record's inner state is properly initialized. Takes the same arguments as
a constructor.

### record.dispose()

Recursively dispose the record and its aggregated members. "Dispose" means that elements of the aggregation tree will unsubscribe from all event sources. It's crucial to prevent memory leaks in SPA.

The whole aggregation tree will be recursively disposed, shared members won't.

## Read and Update

### record.cid

Read-only client-side record's identifier. Generated upon creation of the record and is unique for every record's instance. Cloned records will have different `cid`.

### record.id

Predefined record's attribute, the `id` is an arbitrary string (integer id or UUID). `id` is typically generated by the server. It is used in JSON for id-references.

Records can be retrieved by `id` from collections, and there can be just one instance of the record with the same `id` in the particular collection.

### record.isNew()

Has this record been saved to the server yet? If the record does not yet have an `id`, it is considered to be new.

### record.attrName

Record's attributes may be directly accessed as `record.name`.

<aside class="warning">Please note, that you *have to declare all attributes* in `static attributes` declaration.</aside>

```javascript
@define class Account extends Record {
    static attributes = {
        name : String,
        balance : Number
    }
}

const myAccount = new Account({ name : 'mine' });
myAccount.balance += 1000000; // That works. Good, eh?
```

### record.attrName = value

Assign the record's attribute. If the value is not compatible with attribute's type from the declaration, it is converted:

- with `Type( value )` call, for primitive types;
- with `record.attrName.set( value )`, for existing record or collection (updated in place);
- with `new Type( value )` in all other cases.

Record triggers events on changes:
- `change:attrName` *( record, value )*.
- `change` *( record )*.

```javascript
@define class Book extends Record {
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

### record.set({ attrName : value, ... }, options? : `options`)

Bulk assign record's attributes, possibly taking options.

If the value is not compatible with attribute's type from the declaration, it is converted:

- with `Type( value )` call, for primitive types.
- with `record.attrName.set( value )`, for existing record or collection (updated in place).
- with `new Type( value )` in all other cases.

Record triggers events after all changes are applied:

1. `change:attrName` *( record, val, options )* for any changed attribute.
2. `change` *(record, options)*, if there were changed attributes.


### RecordClass.from(attrs, options?)

Create `RecordClass` from attributes. Similar to direct record creation, but supports additional option for strict data validation.
If `{ strict : true }` option is passed the validation will be performed and an exception will be thrown in case of an error.

Please note, that Type-R always perform type checks on assignments, convert types, and reject improper updates reporting it as error. It won't, however, execute custom validation
rules on every updates as they are evaluated lazily. `strict` option will invoke custom validators and will throw on every error or warning instead of reporting them and continue.

```javascript
// Fetch record with a given id.
const book = await Book.from({ id : 5 }).fetch();

// Validate the body of an incoming HTTP request.
// Throw an exception if validation fails.
const body = MyRequestBody.from( ctx.request.body, { parse : true, strict : true });
```

```typescript
// Fetch record with a given id.
const book = await Book.from({ id : 5 }).fetch();

// Validate the body of an incoming HTTP request.
// Throw an exception if validation fails.
const body = MyRequestBody.from( ctx.request.body, { parse : true, strict : true });
```

### record.assignFrom(otherRecord)

Makes an existing `record` to be the full clone of `otherRecord`, recursively assigning all attributes.
In contracts to `record.clone()`, the record is updated in place.

```javascript
// Another way of doing the bestSeller.clone()
const book = new Book();
book.assignFrom(bestSeller);
```

### record.transaction(fun)

Execute the all changes made to the record in `fun` as single transaction triggering the single `change` event.

All record updates occurs in the scope of transactions. Transaction is the sequence of changes which results in a single `change` event.
Transaction can be opened either manually or implicitly with calling `set()` or assigning an attribute.
Any additional changes made to the record in `change:attr` event handler will be executed in the scope of the original transaction, and won't trigger additional `change` events.


```javascript
some.record.transaction( record => {
    record.a = 1; // `change:a` event is triggered.
    record.b = 2; // `change:b` event is triggered.
}); // `change` event is triggered.
```

Manual transactions with attribute assignments are superior to `record.set()` in terms of both performance and flexibility.

### `attrDef` : type(Type).get(`hook`)

Attach get hook to the record's attribute. `hook` is the function of signature `( value, attr ) => value` which is used to transform the attribute's value _before it will be read_. Hook is executed in the context of the record.

### `attrDef` : type(Type).set(`hook`)

Attach the set hook to the record's attribute. `hook` is the function of signature `( value, attr ) => value` which is used to transform the attribute's value _before it will be assigned_. Hook is executed in the context of the record.

If set hook will return `undefined`, it will cancel attribute update.

## Nested records and collections

Record's attributes can hold other Records and Collections, forming indefinitely nested data structures of arbitrary complexity.
To create nested record or collection you should just mention its constructor function in attribute's definition.

```javascript
import { Record } from 'type-r'

@define class User extends Record {
    static attributes = {
        name : String,
        email : String,
        isActive : true
    }
}

@define class UsersListState extends Record {
    static attributes = {
        users : User.Collection
    }
}
```

All nested records and collections are *aggregated* by default and behave as integral parts of the containing record. Aggregated attributes are _exclusively owned_ by the record, and taken with it together form an _ownership tree_. Many operations are performed recursively on aggregated elements:

- They are created when the owner record is created.
- They are cloned when the record is cloned.
- They are disposed when the record is disposed.
- They are validated as part of the record.
- They are serialized as nested JSON.

The nature of aggregation relationship in OO is explained in this [article](https://medium.com/@gaperton/nestedtypes-2-0-meet-an-aggregation-and-the-rest-of-oo-animals-a9fca7c36ecf).

### `attrDef` : RecordOrCollection

Aggregated record or collection. Represented as nested object or array in record's JSON. Aggregated members are owned by the record and treated as its _integral part_ (recursively created, cloned, serialized, validated, and disposed).
One object can have single owner. The record with its aggregated attributes forms an _aggregation tree_.

All changes in aggregated record or collections are detected and cause change events on the containing record.

### record.getOwner()

Return the record which is an owner of the current record, or `null` there are no one.

Due to the nature of _aggregation_, an object may have one and only one owner.

### record.collection

Return the collection which aggregates the record, or `null` if there are no one.

### `attrDef` : shared(RecordOrCollection)

Non-serializable reference to the record or collection possibly from the different aggregation tree. Initialized with `null`. Is not recursively cloned, serialized, validated, or disposed.

All changes in shared records or collections are detected and cause change events of the containing record.

<aside class="notice">The type of <code>attrDef</code>{ name : defaultValue } is inferred as `shared( Type )` if it extends Record or Collection</aside>

```javascript
@define class UsersListState extends Record {
    static attributes = {
        users : User.Collection,
        selected : shared( User ) // Can be assigned with the user from this.users
    }
}
```

```typescript
@define class UsersListState extends Record {
    @type( User.Collection ).as users : Collection<User>,
    @shared( User ).as selected : User // Can be assigned with the user from this.users
}
```

### `attrDef` : Collection.Refs

Non-aggregating collection. Collection of references to shared records which itself is _aggregated_ by the record, but _does not aggregate_ its elements. In contrast to the `shared( Collection )`, `Collection.Refs` is an actual constructor and creates an instance of collection which _is the part the parent record_.

The collection itself is recursively created and cloned. However, its records are not aggregated by the collection thus they are not recursively cloned, validated, serialized, or disposed.

All changes in the collection and its elements are detected and cause change events of the containing record.

<aside class="notice"><code>Collection.Refs</code> is the constructor and can be used to create non-aggregating collection with `new` operator.</aside>

```javascript
    @define class MyRecord extends Record {
        static attributes = {
            notCloned : shared( SomeCollection ), // Reference to the _shared collection_ object.
            cloned : SomeCollection.Refs // _Aggregated_ collection of references to the _shared records_.
        }
    }
```

```typescript
    @define class MyRecord extends Record {
        // Reference to the _shared collection_ object.
        @shared( SomeCollection ).as notCloned : Collection<Some>

        // _Aggregated_ collection of references to the _shared records_.
        @type( SomeCollection.Refs ).as cloned : SomeCollection
    }
```

### `decorator` @predefine

Make forward declaration for the record to define its attributes later with `RecordClass.define()`. Used instead of `@define` for recursive record definitions.

Creates the default `RecordClass.Collection` type which can be referenced in attribute definitions.

### `static` define({ attributes : { name : `attrDef`, ... }})

May be called to define attributes in conjunction with `@predefine` decorator to make recursive record definitions.

```javascript
@predefine class Comment extends Record{}

Comment.define({
    attributes : {
        text : String,
        replies : Comment.Collection
    }
});
```
