import { abortIO, IOEndpoint, IONode, IOPromise } from './io-tools';
import { EventCallbacks, define, definitions, eventsApi, Logger, LogLevel, Messenger, MessengerDefinition, MessengersByCid, mixinRules, mixins, MixinsState, throwingLogger } from '@type-r/mixture';
import { resolveReference, Traversable } from './traversable';
import { ChildrenErrors, Validatable, ValidationError } from './validation';
import { Linked } from '@linked/value/lib';

const { trigger3, on, off } = eventsApi;
/***
 * Abstract class implementing ownership tree, tho-phase transactions, and validation. 
 * 1. createTransaction() - apply changes to an object tree, and if there are some events to send, transaction object is created.
 * 2. transaction.commit() - send and process all change events, and close transaction.
 */

/** @private */
export interface TransactionalDefinition extends MessengerDefinition {
    endpoint? : IOEndpoint
}

export enum ItemsBehavior {
    share       = 0b0001,
    listen      = 0b0010,
    persistent  = 0b0100
}

// Transactional object interface

export interface Transactional extends Messenger {}

@define
@definitions({
    endpoint : mixinRules.value
})
@mixins( Messenger )
export abstract class Transactional implements Messenger, IONode, Validatable, Traversable {
    // Mixins are hard in TypeScript. We need to copy type signatures over...
    // Here goes 'Mixable' mixin.
    static endpoint : IOEndpoint;
    
    /** @internal */
    static __super__ : object;
    
    static mixins : MixinsState;
    static define : ( definition? : TransactionalDefinition, statics? : object ) => typeof Transactional;
    static extend : <T extends TransactionalDefinition>( definition? : T, statics? : object ) => any;

    static onDefine( definitions : TransactionalDefinition, BaseClass : typeof Transactional ){
        if( definitions.endpoint ) this.prototype._endpoint = definitions.endpoint;
        Messenger.onDefine.call( this, definitions, BaseClass );
    };

    static onExtend( BaseClass : typeof Transactional ) : void {
        // Make sure we don't inherit class factories.
        if( BaseClass.create === this.create ) {
            this.create = Transactional.create;
        }
    }

    // Define extendable mixin static properties.
    static create<M extends new ( ...args ) => any>( this : M, a? : any, b? : any ) : InstanceType<M> {
        return new (this as any)( a, b );
    }

    // State accessor.
    /** @internal */
    readonly __inner_state__ : any;

    // Shared modifier (used by collections of shared models)
    /** @internal */
    _shared? : number; 
    
    dispose() : void {
        if( this._disposed ) return;
        
        abortIO( this );
        this._owner = void 0;
        this._ownerKey = void 0;
        this.off();
        this.stopListening();
        this._disposed = true;
    }
    
    cidPrefix : string

    // Unique version token replaced on change
    /** @internal */
    _changeToken : {} = {}

    // true while inside of the transaction
    /** @internal */
    _transaction : boolean = false;

    // Holds current transaction's options, when in the middle of transaction and there're changes but is an unsent change event
    /** @internal */
    _isDirty  : TransactionOptions = null;

    // Backreference set by owner (Model, Collection, or other object)
    /** @internal */
    _owner : Owner = void 0;

    // Key supplied by owner. Used by record to identify attribute key.
    // Only collections doesn't set the key, which is used to distinguish collections.
    /** @internal */ 
    _ownerKey : string = void 0;

    // Name of the change event
    /** @internal */
    _changeEventName : string

    /**
     * Subsribe for the changes.
     */
    onChanges( handler : Function, target? : Messenger ){
        on( this, this._changeEventName, handler, target );
    }

    /**
     * Unsubscribe from changes.
     */
    offChanges( handler? : Function, target? : Messenger ){
        off( this, this._changeEventName, handler, target );
    }

    /**
     * Listen to changes event. 
     */
    listenToChanges( target : Transactional, handler ){
        this.listenTo( target, target._changeEventName, handler );
    }

    constructor( cid : string | number ){
        this.cid = this.cidPrefix + cid;
    }

    // Deeply clone ownership subtree
    abstract clone( options? : CloneOptions ) : this
    
    // Execute given function in the scope of ad-hoc transaction.
    transaction( fun : ( self : this ) => void, options : TransactionOptions = {} ) : void{
        const isRoot = transactionApi.begin( this );
        const update = fun.call( this, this );
        update && this.set( update );
        isRoot && transactionApi.commit( this );
    }

    // Assign transactional object "by value", copying aggregated items.
    assignFrom( a_source : Transactional | Object | Linked<Transactional> ) : this {
        // Unpack linked value.
        const source = a_source instanceof Linked ? a_source.value : a_source;

        // pin the store of the source.
        if( !this.hasOwnProperty( '_defaultStore' ) && ( source as any )._changeToken ){
            this._defaultStore = ( source as any ).getStore();
        }

        // Need to delay change events until change token will by synced.
        this.transaction( () =>{
            this.set( ( source as any).__inner_state__ || source, { merge : true } );

            // Synchronize change tokens
            const { _changeToken } = source as any;
    
            if( _changeToken ){
                this._changeToken = _changeToken;
            }    
        });

        return this;
    }

    // Create object from JSON. Throw if validation fail.
    static from<T extends new ( a?, b? ) => Transactional >( this : T, json : any, { strict, ...options }  : { strict? : boolean } & TransactionOptions = {} ) :  InstanceType<T>{
        const obj : Transactional = ( this as any ).create( json, { ...options, logger : strict ? throwingLogger : void 0 } );

        if( strict && obj.validationError ){
            obj.eachValidationError( ( error, key, obj ) => {
                throw new Error( `${ obj.getClassName() }.${ key }: ${ error }` );
            });
        }

        return obj as any;
    }

    // Apply bulk object update without any notifications, and return open transaction.
    // Used internally to implement two-phase commit.
    // Returns null if there are no any changes.
    /** @internal */
    abstract _createTransaction( values : any, options? : TransactionOptions ) : Transaction | void

    // Apply bulk in-place object update in scope of ad-hoc transaction 
    abstract set( values : any, options? : TransactionOptions ) : this;

    
    // Parse function applied when 'parse' option is set for transaction.
    parse( data : any, options? : TransactionOptions ) : any { return data }

    // Convert object to the serializable JSON structure
    abstract toJSON( options? : object ) : {}

    /*******************
     * Traversals and member access
     */
    
    // Get object member by its key.
    abstract get( key : string ) : any

    // Get object member by symbolic reference.
    deepGet( reference : string ) : any {
        return resolveReference( this, reference, ( object, key ) => object.get ? object.get( key ) : object[ key ] );
    }

    //_isCollection : boolean

    // Return owner skipping collections.
    getOwner() : Owner {
        return this._owner;
    }

    // Store used when owner chain store lookup failed. Static value in the prototype. 
    /** @internal */
    _defaultStore : Transactional

    // Locate the closest store. Store object stops traversal by overriding this method. 
    getStore() : Transactional {
        const { _owner } = this;
        return _owner ? <Transactional> _owner.getStore() : this._defaultStore;
    }


    /***************************************************
     * Iteration API
     */

    // Loop through the members. Must be efficiently implemented in container class.

    /** @internal */
    _endpoint : IOEndpoint
    
    /** @internal */
    _ioPromise : IOPromise<this>

    hasPendingIO() : IOPromise<this> { return this._ioPromise; }

    //fetch( options? : object ) : IOPromise<this> { throw new Error( "Not implemented" ); }

    getEndpoint() : IOEndpoint {
        return getOwnerEndpoint( this ) || this._endpoint;
    }
    
    /*********************************
     * Validation API
     */

    // Lazily evaluated validation error
    /** @internal */
    _validationError : ValidationError = void 0

    // Validate ownership tree and return valudation error 
    get validationError() : ValidationError {
        const error = this._validationError || ( this._validationError = new ValidationError( this ) );
        return error.length ? error : null; 
    }

    // Validate nested members. Returns errors count.
    /** @internal */
    abstract _validateNested( errors : ChildrenErrors ) : number

    // Object-level validator. Returns validation error.
    validate( obj? : Transactional ) : any {}

    // Return validation error (or undefined) for nested object with the given key. 
    getValidationError( key? : string ) : any {
        var error = this.validationError;
        return ( key ? error && error.nested[ key ] : error ) || null;
    }

    // Get validation error for the given symbolic reference.
    deepValidationError( reference : string ) : any {
        return resolveReference( this, reference, ( object, key ) => object.getValidationError( key ) );
    }

    // Iterate through all validation errors across the ownership tree.
    eachValidationError( iteratee : ( error : any, key : string, object : Transactional ) => void ) : void {
        const { validationError } = this;
        validationError && validationError.eachError( iteratee, this );
    }

    // Check whenever member with a given key is valid. 
    isValid( key? : string ) : boolean {
        return !this.getValidationError( key );
    }

    valueOf() : Object { return this.cid; }
    toString(){ return this.cid; }

    // Get class name for an object instance. Works fine with ES6 classes definitions (not in IE).
    getClassName() : string {
        const { name } = <any>this.constructor;
        if( name !== 'Subclass' ) return name;
    }

    // Logging interface for run time errors and warnings.
    /** @internal */
    abstract _log( level : LogLevel, topic : string, text : string, value : any, logger? : Logger ) : void
}

export interface CloneOptions {
    // 'Pin store' shall assign this._defaultStore = this.getStore();
    pinStore? : boolean
}

// Owner must accept children update events. It's an only way children communicates with an owner.
/** @private */
export interface Owner extends Traversable, Messenger {
    /** @internal */
    _onChildrenChange( child : Transactional, options : TransactionOptions ) : void;
    
    getOwner() : Owner
    getStore() : Transactional
}

// Transaction object used for two-phase commit protocol.
// Must be implemented by subclasses.
// Transaction must be created if there are actual changes and when markIsDirty returns true.
/** @private */ 
export interface Transaction {
    // Object transaction is being made on.
    object : Transactional

    // Send out change events, process update triggers, and close transaction.
    // Nested transactions must be marked with isNested flag (it suppress owner notification).
    commit( initiator? : Transactional )
}

// Options for distributed transaction  
export interface TransactionOptions {
    // Invoke parsing 
    parse? : boolean

    // Optional logger
    logger? : Logger

    // Suppress change notifications and update triggers
    silent? : boolean

    // Update existing transactional members in place, or skip the update (ignored by models)
    merge? : boolean // =true

    // Should collections remove elements in set (ignored by models)  
    remove? : boolean // =true

    // Always replace enclosed objects with new instances
    reset? : boolean // = false

    // Do not dispose aggregated members
    unset? : boolean

    validate? : boolean

    // IO method name if the transaction is initiated as a result of IO operation
    ioMethod? : 'save' | 'fetch'

    // The hint for IOEndpoint
    // If `true`, `record.save()` will behave as "upsert" operation for the records having id.
    upsert? : boolean
}

/**
 * Low-level transactions API. Must be used like this:
 * const isRoot = begin( record );
 * ...
 * isRoot && commit( record, options );
 * 
 * When committing nested transaction, the flag must be set to true. 
 * commit( object, options, isNested ) 
 */

export const transactionApi = {
    // Start transaction. Return true if it's the root one.
    /** @private */
    begin( object : Transactional ) : boolean {
        return object._transaction ? false : ( object._transaction = true );  
    },

    // Mark object having changes inside of the current transaction.
    // Returns true whenever there notifications are required.
    /** @private */
    markAsDirty( object : Transactional, options : TransactionOptions ) : boolean {
        // If silent option is in effect, don't set isDirty flag.
        const dirty = !options.silent;
        if( dirty ) object._isDirty = options;
        
        // Reset version token.
        object._changeToken = {};

        // Object is changed, so validation must happen again. Clear the cache.
        object._validationError = void 0;

        return dirty;
    },

    // Commit transaction. Send out change event and notify owner. Returns true if there were changes.
    // Must be executed for the root transaction only.
    /** @private */
    commit( object : Transactional, initiator? : Transactional ){
        let originalOptions = object._isDirty;

        if( originalOptions ){
            // Send the sequence of change events, handling chained handlers.
            while( object._isDirty ){
                const options = object._isDirty;
                object._isDirty = null; 
                trigger3( object, object._changeEventName, object, options, initiator );
            }
            
            // Mark transaction as closed.
            object._transaction = false;

            // Notify owner on changes out of transaction scope.  
            const { _owner } = object;  
            if( _owner && _owner !== <any> initiator ){ // If it's the nested transaction, owner is already aware there are some changes.
                _owner._onChildrenChange( object, originalOptions );
            }
        }
        else{
            // No changes. Silently close transaction.
            object._isDirty = null;
            object._transaction = false;
        }
    },

    /************************************
     * Ownership management
     */

    // Add reference to the record.
    /** @private */
    aquire( owner : Owner, child : Transactional, key? : string ) : void {
        if( child._owner ) throw new ReferenceError( 'Trying to aquire ownership for an object already having an owner' );

        child._owner = owner;
        child._ownerKey = key;
    },

    // Remove reference to the record.
    /** @private */
    free( owner : Owner, child : Transactional ) : void {
        if( owner === child._owner ){
            child._owner = void 0;
            child._ownerKey = void 0;
        }
    }
}

function getOwnerEndpoint( self : Transactional ) : IOEndpoint {
    // Check if we are the member of the collection...
    const { collection } = self as any;
    if( collection ){
        return getOwnerEndpoint( collection );
    }

    // Now, if we're the member of the model...
    if( self._owner ){
        const { _endpoints } = self._owner as any;
        return _endpoints && _endpoints[ self._ownerKey ];
    }
}
