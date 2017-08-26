export * from './any'
export * from './owned'
export * from './date'
export * from './basic'
export * from './shared'
export * from './updates'
export * from './attrDef'

import { AnyType } from './any'

export function createSharedTypeSpec( Constructor : Function, Attribute : typeof AnyType ){
    if( !Constructor.hasOwnProperty( 'shared' ) ){
        Object.defineProperty( Constructor, 'shared', {
            get(){
                return new ChainableAttributeSpec({
                    value : null,
                    type : Constructor,
                    _attribute : Attribute
                });
            }
        });
    }
}

// Create attribute from the type spec.
import { toAttributeOptions } from './attrDef'

export function createAttribute( spec : any, name : string ) : AnyType {
    return AnyType.create( toAttributeOptions( spec ), name );
}

/**
 * Add date attribute subtypes
 */
import { ChainableAttributeSpec } from './attrDef'
import { TimestampType, MSDateType } from './date'

declare global {
    interface DateConstructor {
        microsoft : ChainableAttributeSpec
        timestamp :  ChainableAttributeSpec
    }
}

Object.defineProperties( Date, {
    microsoft : {
        get(){
            return new ChainableAttributeSpec({
                type : Date,
                _attribute : MSDateType
            })
        }
    },

    timestamp : {
        get(){
            return new ChainableAttributeSpec({
                type : Date,
                _attribute : TimestampType
            })
        }
    }
});

/**
 * Add Number.integer attrubute type
 */
import { NumericType } from './basic'

declare global {
    interface NumberConstructor {
        integer : Function
    }

    interface Window {
        Integer : Function;
    }
}

Number.integer = function( x ){ return x ? Math.round( x ) : 0; }
Number.integer._attribute = NumericType;

if( typeof window !== 'undefined' ){
    window.Integer = Number.integer;
}
