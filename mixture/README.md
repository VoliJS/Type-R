# Mixture

## Getting started

Type-R Mixture is the toolkit combining React-style mixins, Backbone-style events, and minimal set of Underscore-style object manipulation functions.

Written in TypeScript, works with ES5, ES6, and TypeScript.

### Installation

`npm install @type-r/mixture`

### Features

- `Mixable`, React-style mixins.
    - Fine-grained control over member merge rules.
    - Can mix both classes and plain objects.
    - Works with and without ES6 class decorators.
- `Messenger`, synchronous events.
    - Can be used as mixin and as a base class.
    - 100% backward API compatibility with [Backbone Events](http://backbonejs.org/#Events) (passes Backbone 1.2.x unit test)
    - Much faster than Backbone events.
- `Logger`, thin but powerful logging abstraction build on top of `Messenger`. Defaults to the `console`.
- Minimal set of speed-optimized underscore-style object manipulation tools (`assign`, `defaults`, `mapObject`, etc).

## Mixins

Both plain JS object and class constructor may be used as mixins. In the case of the class constructor, missing static members will copied over as well.

You need to import `mixins` decorator to use mixins:

```javascript
import { mixins } from '@type-r/mixture'

...

@mixins( plainObject, MyClass, ... )
class X {
    ...
}
```

### Merge Rules and React Compatibility

Mixture implements _configurable_ merge rules, which allows to add standard React mixins functionality to the ES6 React Components.

```javascript
import React from 'react'
import { Mixable } from '@type-r/mixture'

// Make React.Component mixable...
Mixable.mixTo( React.Component );

// Define lifecycle methods merge rules...
React.Component.mixinRules({
    componentWillMount : 'reverse',
    componentDidMount : 'reverse',
    componentWillReceiveProps : 'reverse',
    shouldComponentUpdate : 'some',
    componentWillUpdate : 'reverse',
    componentDidUpdate : 'reverse',
    componentWillUnmount : 'sequence',
});
```

Mixin merge rules can be extented in any subclass using the `@mixinRules({ attr : rule })` class decorator. Rule is the string from the following list.

- *merge* - assume property to be an object, which members taken from mixins must be merged.
- *pipe* - property is the function `( x : T ) => T` transforming the value. Multiple functions joined in pipe.
- *sequence* - property is the function. Multiple functions will be called in sequence.
- *reverse* - same as *sequence*, but functions called in reverse sequence.
- *mergeSequence* - merge the object returned by functions, executing them in sequence.
- *every* - property is the function `( ...args : any[] ) => boolean`. Resulting method will return true if every single function returns true.
- *some* - same as previous, but method will return true when at least one function returns true.

If merge rule is an object, the corresponding member is expected to be an object and the rule defines the merge rules for its members.

### Usage Example

Here we adding [Events](http://backbonejs.org/#Events) support (on, off, trigger, listenTo, etc.):

```javascript
import React from 'react'
import { mixins, Events } from '@type-r/mixture'

const UnsubscribeMixin = {
    componentWillUnmount(){
        this.off();
        this.stopListening();
    }
}

@mixins( Events, UnsubscribeMixin )
class EventedComponent extends React.Component {
    // ...
}
```

## Events

Mixture is an alternative implementation of [Backbone API for Events](http://backbonejs.org/#Events) heavily optimized for modern JIT engines. Here's the results of the typical
run of the [performance tests](https://github.com/Volicon/mixturejs/tree/master/tests).

![performance](https://raw.githubusercontent.com/Volicon/mixturejs/master/perf-chart.jpg)

Mixture Events implements the complete semantic and API of [Backbone 1.1.x Events](http://backbonejs.org/#Events), with the following exceptions:

- `source.trigger( 'ev1 ev2 ev3' )` is not supported. Use `source.trigger( 'ev1' ).trigger( 'ev2' ).trigger( 'ev3' )` instead.
- `source.trigger( 'ev', a, b, ... )` doesn't support more than 5 event parameters.
- `source.on( 'ev', callback )` - callback will _not_ be called in the context of `source` by default.

Events passes the BackboneJS tests suite.

## Logger

`Logger` doesn't compete with your logging libraries, it helps you to utilize them. It works like that.

You write to the logs as shown below:

```javascript
import { log } from '@type-r/mixture'

...

log( 'info', 'feature:and:topic', textMessage, { someRelatedData, someOtherData, ... });
```

What really happens there is that you're sending an event. There's a singlton `logger` acting as a router for log events. There could be many listeners to the log events, and the one which is listening by default is the console listener, so you get pretty standard logging out of box.

However, here's the list of things you can do which you can't do with a standard console logging:

- When you're writing the unit test,
    - you can easily turn console errors and warnings into exceptions, or
    - you can turn on log event counter to be used in asserts.
- You can selectively turn logging off removing the listeners for the specific log levels. `Logger` does it by default muting all events except `error` and `warn` in production build, but you can override that.
- You can add as many custom log event listeners as you want, which simplifies replacement of the logging library.

### Turning off the default logger

```javascript
import { logger } from "@type-r/mixture"

logger.off(); // Mute it completely
logger.off( 'warn' ); // Mute warn (log levels correspons to the console[level]( msg ))
```

### Selectively turn on logging

```javascript
import { logger } from "@type-r/mixture"

logger.off().logToConsole( 'error' ).logToConsole( 'warn', /^myfeature:/ );
```

### Throw exceptions on log messages

```javascript
import { logger } from "@type-r/mixture"

logger.off().throwOn( 'error' ).throwOn( 'warn', /^myfeature:/ );
```

### Count specific log messages by level

```javascript
import { logger } from "@type-r/mixture"

logger.off().count( 'error' ).throwOn( 'warn', /^myfeature:/ );;

....

assert( !logger.counter.errors && !logger.counter.warn)
```

### Add a new log event listener

```javascript
import { logger } from "@type-r/mixture"

logger.on( 'error', ( subject, message, data ) => {
    console.log( 'There was an error, you know?' );
});
```
