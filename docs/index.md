---
title: Type-R 2.1 API Reference

toc_footers:
  - <a href="https://github.com/Volicon/Type-R">GitHub repository</a>
  - <a href="https://github.com/Volicon/Type-R/issues">Report the bug</a>
  - <a href="https://groups.google.com/forum/#!forum/volicon-open-source">Ask the question</a>
  - <a href="http://www.volicon.com/">Supported by <img style="vertical-align: middle" src="images/volicon_verizon_dm.png"/></a>

includes:
  - record
  - collection
  - observable
  - validation
  - io
  - react-binding
  - mixins
  - releasenotes

search: true
---

# Getting started

Type-R is the modern JS state framework supporting observable changes, state validation, JSON serialization and promised I/O. It's designed to meet the requirements of the complex JS data layer on both front-end and back-end.

Features:

- *Deeply observable changes*
    - The series of updates can be grouped to transactions emitting the single change event.
    - There are fine-grained change events allowing the cascade of reactions executed as a single transaction.
- *Serialization and persistence*
    - Type-R data structures are serializable to JSON by default.
    - Support for both nested JSON and relationship by id.
    - JSON mapping can be customized for every particular attribute or class.
    - I/O endpoints abstract out the persistence protocol.
- *Lazily evaluated validation*
    - The validation is performed on the first access to the validation error field.
    - Validation results are cached and never computed twice for unchanged data.
- *Dynamic type safety*
    - Types are asserted every 
    - The shape of both data structures and generated JSON is guaranteed to match the definitions.
- *Performance*
    - Type-R data structures are designed to handle large collections (10K elements and more) with sub-second delays.
    - Updates are about 10 times more efficient than BackboneJS models and collections.

![overview](images/overview.png)

Type-R is completely unopinionated on the client-server transport protocol and the view layer technology. It's your perfect M and VM in modern MVVM or MVC architecture.

```javascript
import { define, Record } from 'type-r'

// Define email attribute type with encapsulated validation check.
const Email = String.has.check( x => x! || x.indexOf( '@' ) >= 0, 'Invalid email' );

@define class User extends Record {
    static attributes = {
        name  : String.isRequired, // should not be empty for the record to be valid.
        email : Email.isRequired
    }
}

@define class Message extends Record {
    static attributes = {
        created : Date //  = new Date()
        author  : User, // aggregated User record.
        to      : User.Collection, // aggregating collection of users
        subject : '',
        body    : ''
    }
}

const msg = new Message();
assert( !msg.isValid() ); // Is not valid because msg.author has empty attributes

// Listen for the changes in aggregation tree...
msg.on( 'change', () => console.log( 'change!!!' ) );

msg.transaction( () => { // Prepare to make the sequence of changes on msg
    msg.author.name = 'John Dee'; // No 'change' event yet as we're in the transaction. 
    msg.author.email = 'dee@void.com'; 

    assert( msg.isValid() ); // Now msg is valid as all of its attributes are valid.
}); // Got single 'change!!!' message in the console.
```

## Installation and requirements

Is packed as UMD and ES6 module. No peer dependencies are required.

`npm install type-r --save-dev`

<aside class="success">IE10+, Edge, Safari, Chrome, and Firefox are supported</aside>

<aside class="warning">IE9 and Opera may work but has not been tested. IE8 won't work.</aside>

## How the Type-R compares with X?

Type-R started to develop in 2014 as the modern substitution for BackboneJS, which would retain the spirit of the BackboneJS simplicity but would be an order of magnitude faster and superior to Ember Data in its capabilities to describe complex data.

The closest things to the Type-R are [Ember Data](https://guides.emberjs.com/v2.2.0/models/), [BackboneJS models and collections](http://backbonejs.org/#Model), and [mobx](https://github.com/mobxjs/mobx).

There are both similarities and differences:

- In contrast to mobx, Type-R detects _deeply nested changes_.
- Records and Collections resembles Backbone's Models/Collections, but Record is _not an object hash_ but class and it's updates are ~10 times faster.
- Data validation is comparable to one in Ember Data, but it's lazily evaluated and cached.
- id-relationship resembles one in [Ember Data](https://guides.emberjs.com/v2.2.0/models/relationships/), which was used a source of inspiration. But Type-R supports the first-class aggregation as well.
- Like Ember Data, Type-R supports abstract data adapters (I/O endpoints).
- Unlike Ember and Backbone, Type-R is unopinionated on the view layer and routing. Like in mobx, there are React bindings.

Speaking of the distinguishing differences,

- Type-R encourages using of the _layered application state_ instead of the global singleton store. In Type-R, the stores are the special kind of records which can participate in dynamically configured lookup chains. There might be as many dynamically created and disposed stores as you need, starting with no stores at all.
- Type-R's records are protected from improper assignment with run-time type assertions and conversions.
- Type-R distinguishes aggregation and the plain association operating with _aggregation trees_ formed by nested records and collections. Aggregation tree is serialized as nested JSON. Operations like `clone()`, `dispose()`, `isValid()` and `toJSON()` are performed recursively on elements of aggregation tree gracefully handling the references to shared objects.

Feature | Type-R | Backbone Models | Ember Data | mobx
-|-|-|-|-
Observable changes in object graph | ✓ | - | - | ✓
JSON Serialization | ✓ | ✓ | ✓ | -
Validation | ✓ | ✓ | ✓ | -
Dynamic Type Safety | ✓ | - | for serialization only | -
Aggregation | ✓ | - | - | -
Relations by id | ✓ | - | ✓ | - 
Generalized I/O | ✓ | sync function | ✓ | - 
