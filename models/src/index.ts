// Dummy polyfill to prevent exception in IE.
if( typeof Symbol === 'undefined' ){
    Object.defineProperty( window, 'Symbol', { value : { iterator : 'Symbol.iterator' }, configurable : true  });
}

import { Events, Mixable as Class, log } from '@type-r/mixture';
import { CollectionConstructor } from './collection';
// Define synonims for NestedTypes backward compatibility.
import { attributes, ChainableAttributeSpec, Model, ModelConstructor, type as _type, value } from './model';
import { isEmpty } from '@type-r/mixture/lib/tools';

/**
 * Export everything 
 */
export { Linked } from '@linked/value';
export * from '@type-r/mixture';
export * from './collection';
export * from './io-tools';
export * from './model';
export * from './relations';
export * from './transactions';
export { Model as Record, Class };


export const { on, off, trigger, once, listenTo, stopListening, listenToOnce } = <any>Events;

/** Wrap model or collection method in transaction. */
export function transaction< F extends Function >( method : F ) : F {
    return <any>function( ...args ){
        let result;
        
        this.transaction( () => {
            result = method.apply( this, args );
        });
        
        return result;
    }
}

export function type<T extends new ( ...args : any ) => Model>( t : T[] ) : ChainableAttributeSpec<CollectionConstructor<InstanceType<T>>>;
export function type<T extends object>( t : T[] ) : ChainableAttributeSpec<CollectionConstructor<InstanceType<ModelConstructor<T>>>>;
export function type<T extends Function>( t : T | ChainableAttributeSpec<T> ) : ChainableAttributeSpec<T>;
export function type<T extends object>( t : T ) : ChainableAttributeSpec<ModelConstructor<T>>;
export function type<T>( t : T ){
    return Array.isArray( t ) ?
        _type( _toModel( t[ 0 ] ).Collection ) :
        _type( _toModel( t ) );
}

const _toModel = t =>
    t != null && Object.getPrototypeOf( t ) === Object.prototype ?
        attributes( t ) :
        t;

ChainableAttributeSpec.from = ( spec : any ) : ChainableAttributeSpec<any> => {
    // Pass metatype through untouched...
    if( spec && spec instanceof ChainableAttributeSpec ) {
        return spec;
    }

    if( typeof spec === 'function' ) return type( spec );

    if( Array.isArray( spec ) ){
        if( spec.length !== 1 ||
            !spec[ 0 ] || (
                typeof spec[ 0 ] !== 'function' &&
                Object.getPrototypeOf( spec[ 0 ] ) !== Object.prototype
            )
        ) {
            log( 'error', 'Type-R:WrongDeclaration', `Since v4.1, [ ModelType ] and [{ attr1, attr2, }] declares collection of models. Use Array or value([ 1, 2, ... ]) to declare plain array attributes.` );
            return value( spec );
        }

        return type( spec );
    }

    if( spec && typeof spec === 'object' ){
        if( Object.getPrototypeOf( spec ) !== Object.prototype ){
            log( 'error', 'Type-R:WrongDeclaration', `Since v4.1, non-primitive values must be wrapped in value(...). All objects are treated as attribute specs and define nested models.` );
            return value( spec )
        }

        if( isEmpty( spec ) ){
            log( 'error', 'Type-R:WrongDeclaration', `Since v4.1, objects are treated as attribute specs and define nested models. Use Object or value({...}) for an object attribute type.` );
            return value( spec )
        }

        return type( spec )
    }

    return value( spec );
}
    