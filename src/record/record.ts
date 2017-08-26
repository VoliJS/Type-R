/**
 * Record core implementing transactional updates.
 * The root of all definitions. 
 */

import { tools, eventsApi, Mixable, definitions, mixinRules, define } from '../object-plus'

import { CloneOptions, Transactional, TransactionalDefinition, Transaction, TransactionOptions, Owner } from '../transactions'
import { ChildrenErrors } from '../validation'

import { Collection } from '../collection'

import { AnyType, AggregatedType, setAttribute, UpdateRecordMixin, AttributesValues, AttributesContainer, CloneAttributesCtor } from './attributes'

const { assign, isEmpty, log } = tools;

/*******************************************************
 * Record core implementation
 */

export interface ConstructorOptions extends TransactionOptions{
    clone? : boolean
}

// Client unique id counter
let _cidCounter : number = 0;

/***************************************************************
 * Record Definition as accepted by Record.define( definition )
 */
export interface RecordDefinition extends TransactionalDefinition {
    idAttribute? : string
    attributes? : AttributesValues
    collection? : object
    Collection? : typeof Transactional
}

@define({
    // Default client id prefix 
    cidPrefix : 'm',

    // Name of the change event
    _changeEventName : 'change',

    // Default id attribute name
    idAttribute : 'id',
    _keys : [ 'id' ]
})
@definitions({
    defaults : mixinRules.merge,
    attributes : mixinRules.merge,
    collection : mixinRules.merge,
    Collection : mixinRules.value,
    idAttribute : mixinRules.protoValue
})
export class Record extends Transactional implements AttributesContainer {
    // Hack
    static onDefine( definition, BaseClass ){}

    static Collection : typeof Collection
    static DefaultCollection : typeof Collection

    static from : ( collectionReference : any ) => any;
    
    static defaults( attrs : AttributesValues ) : typeof Record {
        return <any>this.extend({ attributes : attrs });
    }
    
    static attributes( attrs : AttributesValues ) : typeof Record {
        return <any>this.extend({ attributes : attrs });
    }

    /***********************************
     * Core Members
     */
    // Previous attributes
    _previousAttributes : {}

    previousAttributes(){ return new this.Attributes( this._previousAttributes ); } 

    // Current attributes    
    attributes : AttributesValues

    // Polymorphic accessor for aggregated attribute's canBeUpdated().
    get __inner_state__(){ return this.attributes; }

    // Lazily evaluated changed attributes hash
    _changedAttributes : AttributesValues

    get changed(){
        let changed = this._changedAttributes;

        if( !changed ){
            const prev = this._previousAttributes;
            changed = {};

            const { _attributes, attributes } = this;

            for( let key of this._keys ){
                const value = attributes[ key ];

                if( _attributes[ key ].isChanged( value, prev[ key ] ) ){
                    changed[ key ] = value;
                }
            }

            this._changedAttributes = changed;
        }

        return changed;    
    }

    changedAttributes( diff? : {} ) : boolean | {} {
        if( !diff ) return this.hasChanged() ? assign( {}, this.changed ) : false;

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

    unset( key, options? ) : this {
        return this.set({ [ key ] : void 0 }, options );
    }

    clear( options? ) : this {
        const nullify = options && options.nullify;

        this.transaction( () =>{
            this.forEachAttr( this.attributes, ( value, key ) => this[ key ] = nullify ? null : void 0 );
        }, options );

        return this;
    }

    // Returns Record owner skipping collections. TODO: Move out
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
    get id() : string | number { return this.attributes[ this.idAttribute ]; }
    set id( x : string | number ){ setAttribute( this, this.idAttribute, x ); }

    /***********************************
     * Dynamically compiled stuff
     */

    // Attributes specifications 
    _attributes : { [ key : string ] : AnyType }

    // Attribute keys
    _keys : string[]

    // Attributes object copy constructor
    Attributes : CloneAttributesCtor

    // forEach function for traversing through attributes, with protective default implementation
    // Overriden by dynamically compiled loop unrolled function in define.ts
    forEachAttr( attrs : {}, iteratee : ( value : any, key? : string, spec? : AnyType ) => void ) : void {
        const { _attributes } = this;
        let unknown : string[];

        for( let name in attrs ){
            const spec = _attributes[ name ];

            if( spec ){
                iteratee( attrs[ name ], name, spec );
            }
            else{
                unknown || ( unknown = [] );
                unknown.push( `'${ name }'` );
            }
        }

        if( unknown ){
            this._log( 'warn', `attributes ${ unknown.join(', ')} are not defined`, attrs );
        }

        // TODO: try this versus object traversal.
        /*
        const { _attributes, _keys } = this;
        
        for( let name of _keys ){
            const spec = _attributes[ name ],
                  value = attrs[ name ];

            value && iteratee( value, name, spec );
        }
        
        // TODO: Try using list of specs instead of _keys.
        // Try to inline this code to the hot spots.
        for( let spec = this._head; spec; spec = spec.next ){
            const value = attrs[ name ];
            value && iteratee( value, name, spec );
        }
        
        */
    }

    each( iteratee : ( value? : any, key? : string ) => void, context? : any ){
        const fun = context !== void 0 ? ( v, k ) => iteratee.call( context, v, k ) : iteratee,
            { attributes } = this;

        for( const key of this._keys ){
            const value = attributes[ key ];
            if( value !== void 0 ) fun( value, key );
        }
    }

    // Get array of attribute keys (Record) or record ids (Collection) 
    keys() : string[] {
        const keys = [],
            { attributes } = this;

        for( let key of this._keys ){
            attributes[ key ] === void 0 || keys.push( key );
        }

        return keys;
    }

    // Get array of attribute values (Record) or records (Collection)
    values() : any[] {
        return this.map( value => value );
    }

    // Attributes-level serialization
    _toJSON(){ return {}; }

    // Attributes-level parse
    _parse( data ){ return data; }

    // Create record default values, optionally augmenting given values.
    defaults( values? : {} ){ return {}; }

    /***************************************************
     * Record construction
     */
    // Create record, optionally setting an owner
    constructor( a_values? : {}, a_options? : ConstructorOptions ){
        super( _cidCounter++ );
        this.attributes = {};
        
        const options = a_options || {},
              values = ( options.parse ? this.parse( a_values, options ) :  a_values ) || {};

        // TODO: type error for wrong object.

        // TODO: We may use the same AssignDefaults constructor with transform function for cloning Attributes,
        // passing an empty object and different transform function. options.clone check will be moved inside of the loop.
        // So, we need the constructor with the "defaults" logic calling the transformation function.
        const attributes = options.clone ? cloneAttributes( this, values ) : this.defaults( values ); 

        // TODO: Here we have the loop for all attributes.
        // There's the safe way to make it way faster by moving this transformation to the unrolled loop we have in 'defaults'.
        // It should substantially improve loading time for collections.
        // Or
        // Think of creating the multimode constructor packing all the stuff inside. Measure the gain.
        /*
        function Attributes( values, record, options ){
            var clone = options.clone,
                _attributes = record._attributes,
                _a, v;

            _a = _attributes.${ key };
            v = values.${ key };
            if( clone ) v = _a.clone( v ) else if( v === void 0 ) v = ${ expr };
            v = this.${ key } = _a.transform( v, options, void 0, record );
            _a.handleChange( v, void 0, record );
            ...
        }
        */
        this.forEachAttr( attributes, ( value, key, attr ) => {
            const next = attributes[ key ] = attr.transform( value, options, void 0, this );
                  attr.handleChange( next, void 0, this );
        });

        this.attributes = this._previousAttributes = attributes;

        this.initialize( a_values, a_options );

        if( this._localEvents ) this._localEvents.subscribe( this, this );
    }

    // Initialization callback, to be overriden by the subclasses 
    initialize( values?, options? ){}

    // Deeply clone record, optionally setting new owner.
    clone( options : CloneOptions = {} ) : this {
        const copy : this = new (<any>this.constructor)( this.attributes, { clone : true } );
        
        if( options.pinStore ) copy._defaultStore = this.getStore();

        return copy;
    }

    // Deprecated, every clone is the deep one now.
    deepClone() : this { return this.clone() };

    // Validate attributes.
    _validateNested( errors : ChildrenErrors ) : number {
        var length    = 0;

        this.forEachAttr( this.attributes, ( value, name, attribute ) => {
            const error = attribute.validate( this, value, name );

            if( error ){
                errors[ name ] = error;
                length++;
            }
        } );

        return length;
    }

    // Get attribute by key
    get( key : string ) : any {
        return this[ key ];
    }

    /**
     * Serialization control
     */

    // Default record-level serializer, to be overriden by subclasses 
    toJSON() : Object {
        const json = {};

        this.forEachAttr( this.attributes, ( value, key : string, { toJSON } ) =>{
            // If attribute serialization is not disabled, and its value is not undefined...
            if( value !== void 0 ){
                // ...serialize it according to its spec.
                const asJson = toJSON.call( this, value, key );

                // ...skipping undefined values. Such an attributes are excluded.
                if( asJson !== void 0 ) json[ key ] = asJson; 
            }
        });

        return json;
    }
    
    // Default record-level parser, to be overriden by the subclasses.
    parse( data, options? : TransactionOptions ){
        // Call dynamically compiled loop-unrolled attribute-level parse function.
        return this._parse( data );
    }

    /**
     * Transactional control
     */

    deepSet( name : string, value : any, options? ){
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

        return this;
    }
            
    // Returns owner without the key (usually it's collection)
    get collection() : any {
        return this._ownerKey ? null : this._owner;
    }

    // Dispose object and all childrens
    dispose(){
        if( this._disposed ) return;
        
        this.forEachAttr( this.attributes, ( value, key, attribute ) => {
            attribute.dispose( this, value );
        });

        super.dispose();
    }

    _log( level : string, text : string, value ) : void {
        tools.log[ level ]( `[Model Update] ${ this.getClassName() }: ` + text, value, 'Attributes spec:', this._attributes );
    }

    getClassName() : string {
        return super.getClassName() || 'Model';
    }

    // Dummies to 
    _createTransaction( values : object, options : TransactionOptions ) : Transaction { return void 0; }
    // Simulate attribute change 
    forceAttributeChange : ( key : string, options : TransactionOptions ) => void
    _onChildrenChange : ( child : Transactional, options : TransactionOptions ) => void
};

assign( Record.prototype, UpdateRecordMixin );

/***********************************************
 * Helper functions
 */

// Deeply clone record attributes
function cloneAttributes( record : Record, a_attributes : AttributesValues ) : AttributesValues {
    const attributes = new record.Attributes( a_attributes );

    record.forEachAttr( attributes, function( value, name, attr ){
        attributes[ name ] = attr.clone( value, record );
    } );

    return attributes;
}

class BaseRecordAttributes {
    id : string | number

    constructor( x : AttributesValues ) {
        this.id = x.id;
    }
}

Record.prototype.Attributes = BaseRecordAttributes;

Record.prototype._attributes = { id : AnyType.create({ value : void 0 }, 'id' )};
Record.prototype.defaults = function( attrs : { id? : string } = {} ){ return { id : attrs.id } };
Record._attribute = AggregatedType;