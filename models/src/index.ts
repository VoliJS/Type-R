// Dummy polyfill to prevent exception in IE.
if( typeof Symbol === 'undefined' ){
    Object.defineProperty( window, 'Symbol', { value : { iterator : 'Symbol.iterator' }, configurable : true  });
}

import { Events, Mixable as Class } from '@type-r/mixture';
// Define synonims for NestedTypes backward compatibility.
import { Record as Model } from './record';

/**
 * Export everything 
 */
export * from './collection';
export * from './io-tools';
export * from '@type-r/mixture';
export * from './record';
export * from './relations';
export * from './transactions';
export { Model, Class };
export { Linked } from '@linked/value'

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