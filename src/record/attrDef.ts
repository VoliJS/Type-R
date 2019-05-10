/**
 * Type spec engine. Declare attributes using chainable syntax,
 * and returns object with spec.
 */
import { IOEndpoint } from '../io-tools';
import { definitionDecorator, EventMap, EventsDefinition, tools } from '../object-plus';
import { Transactional } from '../transactions';
import { AttributeOptions, Parse, AnyType, getMetatype, SharedType } from './metatypes';
import { AttributesContainer } from './updates';

const { assign } = tools;

export interface AttributeCheck {
    ( value : any, key : string ) : boolean
    error? : any
}

// Infer the proper TS type from a Type-R attribute spec.
export type Infer<A> =
    A extends ChainableAttributeSpec<infer F> ? TrueReturnType<F> :
    A extends Function ? TrueReturnType<A> :
    A;
 
// Extract the proper TS return type for a function or constructor.
type TrueReturnType<F extends Function> =
    F extends DateConstructor ? Date :
    F extends ( ...args : any[] ) => infer R ? R :
    F extends new ( ...args : any[] ) => infer R ? R :
    void;

export class ChainableAttributeSpec<F extends Function>{
    options : AttributeOptions & { type? : F };

    constructor( options : AttributeOptions ) {
        // Shallow copy options, fill it with defaults.
        this.options = { getHooks : [], transforms : [], changeHandlers : []};
        if( options ) assign( this.options, options );
    }

    check( check : AttributeCheck, error? : any ) : this {
        function validate( model, value, name ){
            if( !check.call( model, value, name ) ){
                const msg = error || check.error || name + ' is not valid';
                return typeof msg === 'function' ? msg.call( model, name ) : msg;
            }
        }

        const prev = this.options.validate;

        return this.metadata({
            validate : prev ? (
                            function( model, value, name ){
                                return prev( model, value, name ) || validate( model, value, name );
                            }
                       ) : validate
        });
    }

    get as() : PropertyDecorator {
        return definitionDecorator( 'attributes', this );
    }

    get isRequired() : this {
        return this.required;
    }

    get required() : this {
        return this.metadata({ isRequired : true }); 
    }

    endpoint( endpoint : IOEndpoint ) : this {
        return this.metadata({ endpoint });
    }

    watcher( ref : string | ( ( value : any, key : string ) => void ) ) : this {
        return this.metadata({ _onChange : ref });
    }

    // Attribute-specific parse transform
    parse( fun : Parse ) : this {
        return this.metadata({ parse : fun });
    }

    toJSON( fun ) : this {
        return this.metadata({
            toJSON : typeof fun === 'function' ? fun : ( fun ? ( x, k, o ) => x && x.toJSON( o ) : emptyFunction ) 
        });
    }

    // Attribute get hook.
    get( fun ) : this {
        return this.metadata({
            getHooks : this.options.getHooks.concat( fun )
        });
    }

    // Attribute set hook.
    set( fun ) : this {
        function handleSetHook( next, prev, record : AttributesContainer, options ) {
            if( this.isChanged( next, prev ) ) {
                const changed = fun.call( record, next, this.name );
                return changed === void 0 ? prev : this.convert( changed, prev, record, options );
            }

            return prev;
        }

        return this.metadata({
            transforms : this.options.transforms.concat( handleSetHook )
        });
    }

    changeEvents( events : boolean ) : this {
        return this.metadata({ changeEvents : events });
    }

    // Subsribe to events from an attribute.
    events( map : EventsDefinition ) : this {
        const eventMap = new EventMap( map );

        function handleEventsSubscribtion( next, prev, record : AttributesContainer ){
            prev && prev.trigger && eventMap.unsubscribe( record, prev );

            next && next.trigger && eventMap.subscribe( record, next );
        }

        return this.metadata({
            changeHandlers : this.options.changeHandlers.concat( handleEventsSubscribtion )
        });
    }

    properties( props : object ) : this {
        return this.metadata({properties: props});
    }

    // Creates a copy of the spec.
    get has() : this {
        return this;
    }

    metadata( options : object ) : this {
        const cloned = new ChainableAttributeSpec( this.options );
        assign( cloned.options, options );
        return cloned as any;
    }

    value( x ) : this {
        return this.metadata({ value : x, hasCustomDefault : true });
    }

    static from( spec : any ) : ChainableAttributeSpec<any> {
        // Pass metatype through untouched...
        if( spec && spec instanceof ChainableAttributeSpec ) {
            return spec;
        }

        return typeof spec === 'function' ? type( spec ) : value( spec );
    }
}

function emptyFunction(){}

export function type<F extends Function>( this : void, Type : ChainableAttributeSpec<F> | F, value? : any ) : ChainableAttributeSpec<F> {
    if( Type instanceof ChainableAttributeSpec ) return Type;

    const attrDef = new ChainableAttributeSpec<F>({ type : Type }),
          defaultValue = Type && value === void 0 ? getMetatype( Type ).defaultValue : value;

    return defaultValue === void 0 ? attrDef : attrDef.value( defaultValue );
}

export function shared<C extends Function>( this : void, Constructor : C ) : ChainableAttributeSpec<C> {
    return new ChainableAttributeSpec<C>({
        value : null,
        type : Constructor,
        _metatype : SharedType
    });
}

// Create attribute metatype inferring the type from the value.
export function value( this : void, x : any ) : ChainableAttributeSpec<any> {
    const Type = inferType( x ),
        // Transactional types inferred from values must have shared type. 
        AttrDef = Type && Type.prototype instanceof Transactional ? shared( Type ) :
                  type( Type );

    return AttrDef.value( x );
}

function inferType( value : any ) : Function {
    switch( typeof value ) {
        case 'number' :
            return Number;
        case 'string' :
            return String;
        case 'boolean' :
            return Boolean;
        case 'function' :
            return Function;
        case 'undefined' :
            return void 0;
        case 'object' :
            return value ? <any> value.constructor : void 0;
    }
}