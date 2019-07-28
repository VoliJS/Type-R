![overview](docs/images/overview.png)

# Type-R Overview

Type-R is a serializable type system for JS and TS. Data structures you describe with Type-R models are automatically and with zero effort:

- serializable to and from JSON;
- protected from improper assignments at run-time;
- deeply observable.

## Features 

Mapping of complex JS types to JSON (such as Date, classes, objects trees with cross-references) is automatic with Type-R which eliminates a possibility of programmer's mistakes and improves productivity. Less code to write means less things to unit test, less bugs to fix, and less code to read and understand when making changes.

Type-R models safeguard both frontend and backend from errors in JSON. Programmer's mistake on a frontend can't affect the JSON sent to the server. Wrong JSON received from the server will be validated, sanitized, and can't cause catastrophic failures on the frontend. Type-R guarantee that the data structures will retain the declared shape and it immediately reports improper assignments to the console.

There are virtually no point in unit-testing Type-R models as they are mostly declarative definitions. They are able to check the structural integrity themselves, and Type-R can be instructed to throw exceptions instead of console logging. It makes the unit tests of the data layer unnecessary, and greately reduces an effort when writing an integration test.

## React integration

Data structures defined with Type-R are deeply observable by default. They can be used to manage the state of React applications right out of box utilizing "unidirectional data flow" with no additional tooling. Type-R data structures support two-way data binding and attribute-level validation rules, making the a complex forms UI a trivial task. Normally, you don't change your UI code to add validation, just add the validation check to model's attributes.

## Example

The main Type-R building block is the `Model` class with attributes types declaration which behaves as a regular JS class. Models and collections of models can be nested indefinitely to define data structures of arbitrary complexity.

```javascript
import { define, Record, Collection } from '@type-r/models'
import { restfulIO } from '@type-r/endpoints'

@define class User extends Record {
    static attributes = {
        name  : '',
        email : ''
    }
}

@define class Message extends Record {
    static endpoint = restfulIO( '/api/messages', {
        // REST I/O is simulated when the mock data is present, that's how you start.
        mockData : [ { id : 0, createdAt : "1999-07-25T03:33:29.687Z", author : {}, to : [] }]
    } );

    static attributes = {
        createdAt : Date,
        author  : User, // aggregated User record.
        to      : Collection.of( User ), // aggregated collection of users
        subject : '',
        body    : ''
    }
}

const messages = Collection.of( Message ).create();

await messages.fetch({ params : { page : 0 }});

const msg = messages.first();
msg.author.name = 'Alan Poe';
msg.subject = 'Nevermore';

await msg.save();
```

## [API reference and docs](https://volijs.github.io/Type-R/)

## Installation and requirements

<aside class="success">IE10+, Edge, Safari, Chrome, and Firefox are supported</aside>

<aside class="warning">IE9 and Opera may work but has not been tested. IE8 won't work.</aside>

Install Type-R models and built-in set of I/O endpoints (restfulIO, localStorageIO, and memoryIO):

`npm install @type-r/models @type-r/endpoints`

Install React bindings:

`npm install @type-r/react`

Install extended data types (Email, URL, IP, Integer, Microsoft date, UNIX Timestamp date):

`npm install @type-r/ext-types`

## Monorepository packages structure

Core packages:

- `models` - Type-R framework core.
- `endpoints` - Type-R endpoints enabling models and collections I/O API.
- `react` - Type-R React bindings.
- `ext-types` - Extended data types.

- `globals` - provides backward compatibility for apps written with Type-R v2.

- `mixture` - Events, Mixins, and log router. Used by `@type-r/models`.
- `tests` - private package containing all the unit tests.
- `examples/*` - example `@type-r/react` apps.