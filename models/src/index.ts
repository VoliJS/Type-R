// Dummy polyfill to prevent exception in IE.
if( typeof Symbol === 'undefined' ){
    Object.defineProperty( window, 'Symbol', { value : { iterator : 'Symbol.iterator' }, configurable : true  });
}

import { Events, Mixable as Class } from '@type-r/mixture';
import { CollectionConstructor } from './collection';
// Define synonims for NestedTypes backward compatibility.
import { attributes, ChainableAttributeSpec, Model, ModelConstructor, type as _type } from './model';

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
