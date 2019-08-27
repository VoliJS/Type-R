import { Integer, MicrosoftDate, Timestamp } from '@type-r/ext-types';
import { type, ChainableAttributeSpec } from '@type-r/models';

/*
 * dates
 */
declare global {
    // Legacy has-notation
    interface Function{
        value : ( x : any ) => ChainableAttributeSpec<any>;
        isRequired : ChainableAttributeSpec<any>;
        asProp : PropertyDecorator
        has : ChainableAttributeSpec<any>;
    }

    // Date type extensions
    interface DateConstructor {
        microsoft : ChainableAttributeSpec<this>
        timestamp : ChainableAttributeSpec<this>
    }

    // Integer type
    interface Window {
        Integer : Function;
    }

    interface NumberConstructor {
        integer : typeof Integer
    }
}

Function.prototype.value = function( x ) {
    return new ChainableAttributeSpec( { type : this, value : x, hasCustomDefault : true } );
};

Object.defineProperty( Function.prototype, 'isRequired', {
    get() { return this._isRequired || this.has.isRequired; },
    set( x ){ this._isRequired = x; }
});

Object.defineProperty( Function.prototype, 'asProp', {
    get() { return this.has.asProp; },
});

Object.defineProperty( Function.prototype, 'has', {
    get() {
        // workaround for sinon.js and other libraries overriding 'has'
        return this._has || type( this );
    },

    set( value ) { this._has = value; }
} );


Object.defineProperties( Date, {
    microsoft: {
        value: MicrosoftDate
    },

    timestamp: {
        value: Timestamp
    }
} );


/*
 * integer
 */

Number.integer = Integer;

if( typeof window !== 'undefined' ) {
    window.Integer = Integer;
}