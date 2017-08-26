# Class definitions and mixins

## Class Definitions

Type-R mechanic is based on class transformations at the moment of module load. These transformations are controlled by _definitions_ in static class members.

### `decorator` @definitions({ propName : `rule`, ... })

Treat specified static class members as _definitions_. When `@define` decorator is being called, definitions are extracted from static class members and mixins and passed as an argument to the `Class.onDefine( definition )`.

Class definitions are intended to use in the abstract base classes and they are inherited by subclasses. You don't need to add any new definitions to existing Type-R classes unless you want to extend the library, which you're welcome to do.

### `rule` mixinRules.value

Merge rule used to mark class definitions. The same rule is also applied to all mixin members if other rule is not specified.

```javascript
@define
@definitions({
    urlRoot : mixinRules.value
})
class X {
    static urlRoot = '/api';

    static onDefine( definition ){
        this.prototype.urlRoot = definition.urlRoot;
    }
}
```

### `rule` mixinRules.protoValue

Same as `mixinRules.value`, but the value is being assigned to the class prototype.

```javascript
@define
@definitions({
    urlRoot : mixinRules.protoValue
})
class X {
    static urlRoot = '/api';
}

assert( X.prototype.urlRoot === '/api' );
```

### `rule` mixinRules.merge

Assume the property to be the key-value hash. Properties with the same name from mixins are merged.

```javascript
const M = {
    attributes : {
        b : 1
    }
};

@define
@mixins( M )
@definitions({
    attributes : mixinRules.merge
})
class X {
    static attributes = {
        a : 1
    };

    onDefine( definitions ){
        const { attributes } = definitions;
        assert( attributes.a === attributes.b === 1 );
    }
}
```

### `decorator` @define

Extract class definitions, call class definition hooks, and apply mixin merge rules to inherited class members.

1. Call static `onExtend( BaseClass )` hook.
2. Extract definitions from static class members and all the mixins applied, and pass them to `onDefine( definitions, BaseClass )` hook.
4. Apply _merge rules_ for overriden class methods.

All Type-R class definitions must be precedeed with the `@define` (or `@predefine`) decorator.

```javascript
@define
@definitions({
    attributes : mixinRules.merge
})
class Record {
    static onDefine( definitions, BaseClass ){
        definitions.attributes && console.log( JSON.stringify( definitions.attributes ) );
    }
}

// Will print "{ "a" : 1 }"
@define class A extends Record {
    static attributes = {
        a : 1
    }
}

// Will print "{ "b" : 1 }"
@define class B extends Record {
    static attributes = {
        b : 1
    }
}
```

### `decorator` @define( mixin )

When called with an argument, `@define` decorator applies the given mixin as if it would be the first mixin applied.
In other aspects, it behaves the same as the `@default` decorator without argument.

### `static` Class.onExtend( BaseClass )

Called from the `@predefine` or as the first action of the `@define`. Takes base class constructor as an argument.

### `static` Class.onDefine( definition, BaseClass )

Called from the `@define` or `Class.define()` method. Takes class definition (see the `@definitions` decorator) as the first argument.

### `decorator` @predefine

The sequence of `@predefine` with the following `Class.define()` call is equivalent to `@define` decorator. It should be used in the case if the class definition must reference itself, or multiple definitions contain circular dependency. 

It calls static `onExtend( BaseClass )` function if it's defined. It assumes that the `Class.define( definitions )` method will be called later, and attaches `Class.define` method to the class if it was not defined.

### `static` Class.define( definitions? )

Finalized the class definition started with `@predefine` decorator. Has the same effect as the `@define` decorator excepts it assumes that `Class.onExtend()` static function was called already.

## Mixins



### `decorator` @mixins( mixinA, mixinB, ... ) class X ...

Merge specified mixins to the class definition. Both plain JS object and class constructor may be used as mixin. In the case of the class constructor, missing static members will copied over as well.

```javascript
    import { mixins, Events } from 'type-r'
    ...

    @define
    @mixins( Events, plainObject, MyClass, ... )
    class X {
        ...
    }
```

### `static` Class.mixins

Class member holding the state of the class mixins.

<aside class="warning">
This is an experimental API which may change in future.
</aside>

## Merge rules

### `decorator` @mixinRules({ propName : `rule`, ... }) 

The `rule` is the reducer function which is applied when there are several values for the particular class members are defined in different mixins or the class, or if the class member is overriden by the subclass.

<aside class="warning">
This is an experimental feature to support React-style mixins. Should be used with an extreme care.
</aside>

### `rule` mixinRules.classFirst

Assume the property to be the function. Call functions from mixins in sequence: `f1.apply( this, arguments ); f2.apply( this, arguments );...`

### `rule` mixinRules.classLast
Same as sequence, but functions are called in the reverse sequence.

```javascript
@define
@mixinRules({
    componentWillMount : mixinRules.classLast
})
class Component {
    componentWillMount(){
        console.log( 1 );
    }
}

const M = {
    componentWillMount(){
        console.log( 2 );
    }
}

@define
@mixins( M )
class X extends Component {
    componentWillMount(){
        console.log( 3 );
    }
}

const x = new X();
x.componentWillMount();
// Will print 1, 2, 3

```

### `rule` mixinRules.pipe

Assume the property to be the function with a signature `( x : T ) => T`. Join functions from mixins in a pipe: `f1( f2( f3( x ) ) )`.

### `rule` mixinRules.defaults

Assume the property to be the function returning object. Merge objects returned by functions from mixins, executing them in sequence.

### `rule` mixinRules.every

Assume property to be the function returning boolean. Return `true` if all functions from mixins return truthy values.

### `rule` mixinRules.some

Same as `every`, but return true when at least one function from mixins returns true.
