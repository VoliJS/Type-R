/**
 * Model core implementing transactional updates.
 * The root of all definitions. 
 */

import { define, definitions, isProduction, Logger, TheType, logger, LogLevel, mixinRules, tools } from '@type-r/mixture';
import { CollectionConstructor } from '../collection';
import { IOEndpoint } from '../io-tools';
import { CloneOptions, Owner, Transaction, Transactional, TransactionalDefinition, TransactionOptions } from '../transactions';
import { ChildrenErrors } from '../validation';
import { type } from './attrDef';
import { InferAttrs, ModelAttributes, AnonymousModelConstructor } from './define';
import { IOModel, IOModelMixin } from './io-mixin';
import { LinkedModelHash } from './linked-attrs';
import { AggregatedType, AnyType } from './metatypes';
import { AttributesConstructor, AttributesContainer, AttributesCopyConstructor, AttributesValues, setAttribute, shouldBeAnObject, unknownAttrsWarning, UpdateModelMixin } from './updates';

export interface MakeModelConstructor<T extends Model, A extends object> extends TheType<typeof Model>
{
    new ( attrs? : Partial<InferAttrs<A>>, options? : object ) : T
    prototype : T
    attributes : A
    Collection : CollectionConstructor<T>
}

const { assign, isEmpty } = tools;

/*******************************************************
 * Model core implementation
 */

export interface ConstructorOptions extends TransactionOptions{
    clone? : boolean
}

// Client unique id counter
let _cidCounter : number = 0;

/***************************************************************
 * Model Definition as accepted by Model.define( definition )
 */
export interface ModelDefinition extends TransactionalDefinition {
    idAttribute? : string
    attributes? : AttributesValues
    collection? : object
    Collection? : typeof Transactional
}

export type LinkedAttributes<M extends { attributes : object }> = LinkedModelHash<InferAttrs<M['attributes']>>
export type AttributesMixin<M extends { attributes : object }> = ModelAttributes<M['attributes']>

@define({
    // Default client id prefix 
    cidPrefix : 'm',

    // Name of the change event
    _changeEventName : 'change',

    // Default id attribute name
    idAttribute : 'id'
})
@definitions({
    defaults : mixinRules.merge,
    attributes : mixinRules.merge,
    collection : mixinRules.merge,
    Collection : mixinRules.value,
    idAttribute : mixinRules.protoValue
})
export class Model extends Transactional implements IOModel, AttributesContainer, Iterable<any> {
    /** @internal */
    static _metatype = AggregatedType;

    // Hack
    static onDefine( definition, BaseClass ){}

    static comparator<T extends typeof Model>( this : T, attr : keyof InstanceType<T>, asc = true ) : ( a : InstanceType<T>, b : InstanceType<T> ) => -1 | 0 | 1 {
        const { compare } = tools;
        return asc ? 
            ( a, b ) => compare( a[ attr ], b[ attr ] ) :
            ( a, b ) => -compare( a[ attr ], b[ attr ] ) as any;
    }

    static Collection : CollectionConstructor;
    static DefaultCollection : CollectionConstructor;
    
    // Attribute type for the record id.
    static id = type( String ).value( null );
    
    // Lazy object reference, serializable as id.
    static get ref(){
        return type( this )
            .toJSON( x => x ? x.id : null )
            .parse( x => {
                return { [ this.prototype.idAttribute ] : x };
            });
    }

    static extendAttrs<T extends typeof Model, A extends object>( this : T, attrs : A ) : AnonymousModelConstructor<T['attributes'] & A> {
        return this.defaults( attrs ) as any;
    }

    static defaults( attrs : AttributesValues ) : typeof Model {
        return this.extend({ attributes : attrs }) as any;
    }
    
    static attributes : AttributesValues


    _attributes$ : object = void 0
    __Attributes$ : new ( model : Model ) => object

    get $() : any {
        return this._attributes$ || ( this._attributes$ = new this.__Attributes$( this ) )
    }

    /********************
     * IO Methods
     */
    /** @internal */
     _endpoints : { [ name : string ] : IOEndpoint }

    /***********************************
     * Core Members
     */
    previousAttributes(){ return new this.AttributesCopy( this._previousAttributes ); } 

    // Polymorphic accessor for aggregated attribute's canBeUpdated().
    /** @internal */
    get __inner_state__(){ return this.attributes; }

    get changed(){
        let changed = this._changedAttributes;

        if( !changed ){
            const prev = this._previousAttributes;
            changed = {};

            const { attributes } = this;

            for( let attr of this._attributesArray ){
                const key = attr.name,
                    value = attributes[ key ];

                if( attr.isChanged( value, prev[ key ] ) ){
                    changed[ key ] = value;
                }
            }

            this._changedAttributes = changed;
        }

        return changed;    
    }

    changedAttributes( diff? : {} ) : boolean | {} {
        if( !diff ) return this.hasChanged() ? { ...this.changed } : false;

        var val, changed : {} | boolean = false,
            old          = this._transaction ? this._previousAttributes : this.attributes,
            attrSpecs    = this._attributes;

        for( var attr in diff ){
            if( !attrSpecs[ attr ].isChanged( old[ attr ], ( val = diff[ attr ] ) ) ) continue;
            (changed || (changed = {}))[ attr ] = val;
        }

        return changed;        
    }

    hasChanged( key? : string ) : boolean {
        const { _previousAttributes } = this;
        if( !_previousAttributes ) return false;

        return key ?
                this._attributes[ key ].isChanged( this.attributes[ key ], _previousAttributes[ key ] ) :
                !isEmpty( this.changed );
    }

    previous( key : string ) : any {
        if( key ){
            const { _previousAttributes } = this;
            if( _previousAttributes ) return _previousAttributes[ key ];
        }
        
        return null;
    }

    isNew() : boolean {
        return this.id == null;
    }

    has( key : string ) : boolean {
        return this[ key ] != void 0;
    }

    // Return attribute value, setting an attribute to undefined.
    // TODO: If attribute was aggregated, don't dispose it.
    unset( key : string, options? ) : any {
        const value = this[ key ];
        this.set({ [ key ] : void 0 }, { unset : true, ...options });
        return value;
    }

    // Undocumented. Move to NestedTypes?
    clear( options? ) : this {
        const nullify = options && options.nullify;

        this.transaction( () =>{
            this.forEach( ( value, key ) => this[ key ] = nullify ? null : void 0 );
        }, options );

        return this;
    }

    // Returns Model owner skipping collections. TODO: Move out
    getOwner() : Owner {
        const owner : any = this._owner;

        // If there are no key, owner must be transactional object, and it's the collection.
        // We don't expect that collection can be the member of collection, so we're skipping just one level up. An optimization.
        return this._ownerKey ? owner : owner && owner._owner;
    }

    /***********************************
     * Identity managements
     */

    // Id attribute name ('id' by default)
    idAttribute : string;

    // Fixed 'id' property pointing to id attribute
    get id() : string { return this.attributes[ this.idAttribute ]; }
    set id( x : string ){ setAttribute( this, this.idAttribute, x ); }

    /***********************************
     * Dynamically compiled stuff
     */

    // Attributes specifications
    /** @internal */
    _attributes : { [ key : string ] : AnyType }

    /** @internal */
    _attributesArray : AnyType[]

    // Attributes object copy constructor
    Attributes : AttributesConstructor
    AttributesCopy : AttributesCopyConstructor

    // Create record default values, optionally augmenting given values.
    defaults( values = {} ){
        const defaults = {},
            { _attributesArray } = this;

        for( let attr of _attributesArray ){
            const key = attr.name,
            value = values[ key ];

            defaults[ key ] = value === void 0 ? attr.defaultValue() : value;
        }

        return defaults;
    }

    /***************************************************
     * Model construction
     */
    // Create record, optionally setting an owner
    constructor( a_values? : any, a_options? : ConstructorOptions ){
        super( _cidCounter++ );
        this.attributes = {};
        
        const options = a_options || {},
              values = ( options.parse ? this.parse( a_values, options ) :  a_values ) || {};

        isProduction || typeCheck( this, values, options );

        this._previousAttributes = this.attributes = new this.Attributes( this, values, options );

        this.initialize( a_values, a_options );

        if( this._localEvents ) this._localEvents.subscribe( this, this );
    }

    // Initialization callback, to be overriden by the subclasses 
    initialize( values? : Partial<this>, options? ){}

    // Deeply clone record, optionally setting new owner.
    clone( options : CloneOptions = {} ) : this {
        const copy : this = new (<any>this.constructor)( this.attributes, { clone : true } );
        
        if( options.pinStore ) copy._defaultStore = this.getStore();

        return copy;
    }

    /** @internal */
    _validateNested( errors : ChildrenErrors ) : number {
        var length    = 0;

        const { attributes } = this;

        for( let attribute of this._attributesArray ){
            const { name } = attribute,
                error = attribute.validate( this, attributes[ name ], name );

            if( error ){
                errors[ name ] = error;
                length++;
            }
        }

        return length;
    }

    // Get attribute by key
    get( key : string ) : any {
        return this[ key ];
    }

    // Apply bulk in-place object update in scope of ad-hoc transaction 
    set( values : any, options? : TransactionOptions ) : this {
        if( values ){ 
            const transaction = this._createTransaction( values, options );
            transaction && transaction.commit();
        }

        return this;
    }

    /**
     * Serialization control
     */

    // Default record-level serializer, to be overriden by subclasses 
    toJSON( options? : TransactionOptions ) : any {
        const json = {},
            { attributes } = this;

        for( let attribute of this._attributesArray ){
            const { name } = attribute,
                value = attributes[ name ];

            if( value !== void 0 ){
                // ...serialize it according to its spec.
                const asJson = attribute.toJSON.call( this, value, name, options );

                // ...skipping undefined values. Such an attributes are excluded.
                if( asJson !== void 0 ) json[ name ] = asJson; 
            }
        }

        return json;
    }
    
    // Default record-level parser, to be overriden by the subclasses.
    parse( data, options? : TransactionOptions ){
        return data;
    }

    /**
     * Transactional control
     */
    deepSet( name : string, value : any, options? : any ){
        // Operation might involve series of nested object updates, thus it's wrapped in transaction.
        this.transaction( () => {
            const path  = name.split( '.' ),
                l     = path.length - 1,
                attr  = path[ l ];

            let model = this;

            // Locate the model, traversing the path.
            for( let i = 0; i < l; i++ ){
                const key = path[ i ];

                // There might be collections in path, so use `get`.
                let next    = model.get ? model.get( key ) : model[ key ];

                // Create models, if they are not exist.
                if( !next ){
                    const attrSpecs = model._attributes;
                    if( attrSpecs ){
                        // If current object is model, create default attribute
                        var newModel = attrSpecs[ key ].create();

                        // If created object is model, nullify attributes when requested
                        if( options && options.nullify && newModel._attributes ){
                            newModel.clear( options );
                        }

                        model[ key ] = next = newModel;
                    }
                    // Silently fail in other case.
                    else return;
                }
                
                model = next;
            }

            // Set model attribute.
            if( model.set ){
                model.set({ [ attr ] : value }, options );
            }
            else{
                model[ attr ] = value;
            }
        });

        return this
    }
            
    // Returns owner without the key (usually it's collection)
    get collection() : any {
        return this._ownerKey ? null : this._owner;
    }

    // Dispose object and all childrens
    dispose(){
        if( this._disposed ) return;

        const { attributes } = this;

        for( let attr of this._attributesArray ){
            attr.dispose( this, attributes[ attr.name ] );
        }
        
        super.dispose();
    }

    /** @internal */
    _log( level : LogLevel, topic: string, text : string, props : object, a_logger? : Logger ) : void {
        ( a_logger || logger ).trigger( level, topic, this.getClassName() + ' ' + text, {
            ...props,
            'Model' : this,
            'Attributes definition' : this._attributes
        });
    }

    getClassName() : string {
        return super.getClassName() || 'Model';
    }

    /** @internal */
    _createTransaction( values : object, options : TransactionOptions ) : Transaction { return void 0; }
    // Simulate attribute change 
    forceAttributeChange : ( key : string, options : TransactionOptions ) => void

    /** @internal */
    _onChildrenChange : ( child : Transactional, options : TransactionOptions ) => void


    /**
     * Map methods
     */

    forEach( iteratee : ( value? : any, key? : string ) => void, context? : any ){
        const fun = context !== void 0 ? ( v, k ) => iteratee.call( context, v, k ) : iteratee,
            { attributes } = this;

        for( const key in this.attributes ){
            const value = attributes[ key ];
            if( value !== void 0 ) fun( value, key );
        }
    }

    mapObject( a_fun : ( value, key ) => any, context? : any ) : object {
        const fun = context === void 0 ? a_fun : a_fun.bind( context );
        return tools.transform( {}, this.attributes, fun );
    }

    [ Symbol.iterator ](){
        return new ModelEntriesIterator( this );
    }

    entries(){
        return new ModelEntriesIterator( this );
    }

    // Get array of attribute keys (Model) or record ids (Collection) 
    keys() : string[] {
        const keys : string[] = [];

        this.forEach( ( value, key ) => keys.push( key ) );

        return keys;
    }
};

export interface Model extends IOModel {}
export interface Model extends AttributesContainer {}


assign( Model.prototype, UpdateModelMixin, IOModelMixin );

/***********************************************
 * Helper functions
 */

class BaseModelAttributes {
    id : string

    constructor( record : Model, x : AttributesValues, options : TransactionOptions ) {
        this.id = x.id;
    }
}

Model.prototype.Attributes = BaseModelAttributes;

class BaseModelAttributesCopy {
    id : string

    constructor( x : AttributesValues ) {
        this.id = x.id;
    }
}

Model.prototype.AttributesCopy = BaseModelAttributesCopy;

const IdAttribute = AnyType.create({ value : void 0 }, 'id' );
Model.prototype._attributes = { id : IdAttribute };
Model.prototype._attributesArray = [ IdAttribute ];

function typeCheck( record : Model, values : object, options ){
    if( shouldBeAnObject( record, values, options ) ){
        const { _attributes } = record;
        let unknown : string[];

        for( let name in values ){
            if( !_attributes[ name ] ){
                unknown || ( unknown = [] );
                unknown.push( `'${ name }'` );
            }
        }

        if( unknown ){
            unknownAttrsWarning( record, unknown, { values }, options );
        }
    }
}

export class ModelEntriesIterator implements Iterator<[string, any]> {
    private idx = 0;
    
    constructor( private readonly record : Model){}

    next() : IteratorResult<[string, any]> {
        const { record } = this,
            metatype = record._attributesArray[ this.idx++ ];

        return {
            done : !metatype,
            value : metatype ? [ metatype.name, record[ metatype.name ] ] : void 0
        };
    }
}