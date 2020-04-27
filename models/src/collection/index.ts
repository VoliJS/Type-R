import { Linked } from '@linked/value';
import { define, definitions, EventMap, eventsApi, EventsDefinition, Logger, logger, LogLevel, Mixable, mixinRules, mixins, TheType } from '@type-r/mixture';
import { IOPromise, startIO } from '../io-tools';
import { AggregatedType, Model, SharedType, shared } from '../model';
import { CloneOptions, ItemsBehavior, Transactional, TransactionalDefinition, transactionApi, TransactionOptions } from '../transactions';
import { AddOptions, addTransaction } from './add';
import { ArrayMixin } from './arrayMethods';
import { CollectionCore, CollectionTransaction, Elements, free, sortElements, updateIndex } from './commons';
import { removeMany, removeOne } from './remove';
import { emptySetTransaction, setTransaction } from './set';

const { trigger2 } = eventsApi,
    { begin, commit, markAsDirty } = transactionApi;

let _count = 0;

export type GenericComparator = string | ( ( x : Model ) => number ) | ( ( a : Model, b : Model ) => number ); 

export interface CollectionOptions extends TransactionOptions {
    comparator? : GenericComparator
    model? : typeof Model
}

export interface CollectionDefinition extends TransactionalDefinition {
    model? : typeof Model,
    itemEvents? : EventsDefinition
    _itemEvents? : EventMap
}

class CollectionRefsType extends SharedType {
    static defaultValue = [];
}

export interface CollectionConstructor<R extends Model = Model > extends TheType<typeof Collection> {
    new ( records? : ElementsArg<R>, options?: CollectionOptions ) : Collection<R>
    prototype : Collection<R>
    Refs : CollectionConstructor<R>
};

type CollectionOf<M extends typeof Model> = M['Collection'] extends CollectionConstructor<InstanceType<M>> ? M['Collection'] : CollectionConstructor<InstanceType<M>>;

@define({
    // Default client id prefix 
    cidPrefix : 'c',
    model : Model,
    _changeEventName : 'changes',
    _aggregationError : null
})
@mixins( ArrayMixin )
@definitions({
    comparator : mixinRules.value,
    model : mixinRules.protoValue,
    itemEvents : mixinRules.merge
})
export class Collection< R extends Model = Model> extends Transactional implements CollectionCore, Iterable<R> {
    /** @internal */
    _shared : number
    /** @internal */
    _aggregationError : R[]

    /**
     * EXPERIMENTAL notation to extract proper collection type from the model in TypeScript.
     * 
     * attrName : Collection.of( User );
     * 
     * const users = new ( Collection.of( User ) )
     */
    static of<M extends typeof Model>( Ctor : M ) : CollectionOf<M> {
        return Ctor.Collection as any;
    }

    /**
     * EXPERIMENTAL notation to extract proper collection type from the model in TypeScript.
     * 
     * attrName : Collection.ofRefs( User );
     * 
     * const users = new ( Collection.ofRefs( User ) )
     */
    static ofRefs<M extends typeof Model>( Ctor : M ) : CollectionOf<M> {
        return Ctor.Collection.Refs as any;
    }


    static Subset : typeof Collection
    static Refs : any
    static refsTo = shared;

    /** @internal */
    static _SubsetOf : typeof Collection
    
    createSubset( models : ElementsArg<R>, options? : CollectionOptions) : Collection<R>{
        throw new ReferenceError( 'Failed dependency injection' )
    }

    static onExtend( BaseClass : typeof Transactional ){
        // Cached subset collection must not be inherited.
        const Ctor = this;
        this._SubsetOf = null;

        function RefsCollection( a, b, listen? ){
            Ctor.call( this, a, b, ItemsBehavior.share | ( listen ? ItemsBehavior.listen : 0 ) );
        }

        Mixable.mixins.populate( RefsCollection );
        RefsCollection.create = Collection.create;
        
        RefsCollection.prototype = this.prototype;
        RefsCollection._metatype = CollectionRefsType;

        this.Refs = this.Subset = <any>RefsCollection;

        Transactional.onExtend.call( this, BaseClass );
    }
    
    static onDefine( definition : CollectionDefinition, BaseClass : any ){
        if( definition.itemEvents ){
            const eventsMap = new EventMap( BaseClass.prototype._itemEvents );
            eventsMap.addEventsMap( definition.itemEvents );
            this.prototype._itemEvents = eventsMap;
        }

        if( definition.comparator !== void 0 ) this.prototype.comparator = definition.comparator;

        Transactional.onDefine.call( this, definition );
    }
    
    /** @internal */
    _itemEvents : EventMap

    /***********************************
     * Core Members
     */
    // Array of the records
    models : R[]

    // Polymorphic accessor for aggregated attribute's canBeUpdated().
    /** @internal */
    get __inner_state__(){ return this.models; }

    // Index by id and cid
    /** @internal */
    _byId : { [ id : string ] : R }

    set comparator( x : GenericComparator ){

        switch( typeof x ){
            case 'string' :
                this._comparator = ( a, b ) => {
                    const aa = a[ <string>x ], bb = b[ <string>x ];
                    if( aa === bb ) return 0;
                    return aa < bb ? -1 : + 1;
                } 
                break;
            case 'function' :
                if( x.length === 1 ){
                    this._comparator = ( a, b ) => {
                        const aa = (<any>x).call( this, a ), bb = (<any>x).call( this, b );
                        if( aa === bb ) return 0;
                        return aa < bb ? -1 : + 1;
                    }
                }
                else{
                    this._comparator = ( a, b ) => (<any>x).call( this, a, b );
                }
                break;
                
            default :
                this._comparator = null;
        }
    }
    
    // TODO: Improve typing
    getStore() : Transactional {
        return this._store || ( this._store = this._owner ? this._owner.getStore() : this._defaultStore );
    }

    /** @internal */
    _store : Transactional

    get comparator(){ return this._comparator; }

    /** @internal */
    _comparator : ( a : R, b : R ) => number

    /** @internal */
    _onChildrenChange( record : R, options : TransactionOptions = {}, initiator? : Transactional ){
        // Ignore updates from nested transactions.
        if( initiator === this ) return;

        const { idAttribute } = this;

        if( record.hasChanged( idAttribute ) ){
            updateIndex( this._byId, record );
        }

        const isRoot = begin( this );

        if( markAsDirty( this, options ) ){
            // Forward change event from the record.
            trigger2( this, 'change', record, options )
        }

        isRoot && commit( this );
    }

    get( objOrId : string | { id? : string, cid? : string } ) : R {
        if( objOrId == null ) return;

        if( typeof objOrId === 'object' ){
            const id = objOrId[ this.idAttribute ];
            return ( id !== void 0 && this._byId[ id ] ) || this._byId[ objOrId.cid ];
        }
        else{
            return this._byId[ objOrId ];
        }        
    }

    [ Symbol.iterator ]() : IterableIterator<R> {
        return this.models[ Symbol.iterator ]();
    }

    // Loop through the members in the scope of transaction.
    // Transactional version of each()
    updateEach( iteratee : ( val : R, key? : number ) => void ){
        const isRoot = transactionApi.begin( this );
        this.each( iteratee );
        isRoot && transactionApi.commit( this );
    }

    /** @internal */
    _validateNested( errors : {} ) : number {
        // Don't validate if not aggregated.
        if( this._shared ) return 0;

        let count = 0;

        this.each( record => {
            const error = record.validationError;
            if( error ){
                errors[ record.cid ] = error;
                count++;
            }
        });

        return count;
    }

    model : typeof Model

    // idAttribute extracted from the model type.
    idAttribute : string

    constructor( records? : ElementsArg<R>, options : CollectionOptions = {}, shared? : number ){
        super( _count++ );
        this.models = [];
        this._byId = {};
        
        this.comparator  = this.comparator;

        if( options.comparator !== void 0 ){
            this.comparator = options.comparator;
            options.comparator = void 0;
        }
        
        this.model       = this.model;
        
        if( options.model ){
            this.model = options.model;
            options.model = void 0;
        }

        this.idAttribute = this.model.prototype.idAttribute; //TODO: Remove?

        this._shared = shared || 0;

        if( records ){
            const elements = toElements( this, records, options );
            emptySetTransaction( this, elements, options, true );
        }

        this.initialize.apply( this, arguments );

        if( this._localEvents ) this._localEvents.subscribe( this, this );
    }

    initialize(){}

    // Deeply clone collection, optionally setting new owner.
    clone( options : CloneOptions = {} ) : this {
        const models = this._shared & ItemsBehavior.share ? this.models : this.map( model => model.clone() ),
              copy : this = new (<any>this.constructor)( models, { model : this.model, comparator : this.comparator }, this._shared );
        
        if( options.pinStore ) copy._defaultStore = this.getStore();
        
        return copy;
    }

    toJSON( options? : object ) : any {
        return this.map( model => model.toJSON( options ) );
    }

    // Apply bulk in-place object update in scope of ad-hoc transaction 
    set( elements : ElementsArg<R> = [], options : TransactionOptions = {} ) : this {
        if( (<any>options).add !== void 0 ){
            this._log( 'warn', "Type-R:InvalidOption", "Collection.set doesn't support 'add' option, behaving as if options.add === true.", options );
        }

        // Handle reset option here - no way it will be populated from the top as nested transaction.
        if( options.reset ){
            this.reset( elements, options )
        }
        else{
            const transaction = this._createTransaction( elements, options );
            transaction && transaction.commit();
        } 

        return this;    
    }

        /**
     * Enable or disable live updates.
     * 
     * `true` enables full collection synchronization.
     * `false` cancel live updates.
     * `json => true | false` - filter updates
     */
    liveUpdates( enabled : LiveUpdatesOption ) : IOPromise<this> {
        if( enabled ){
            this.liveUpdates( false );

            const filter = typeof enabled === 'function' ? enabled : () => true;

            this._liveUpdates = {
                updated : json => {
                    filter( json ) && this.add( json, { parse : true, merge : true } );
                },

                removed : id => this.remove( id )
            };

            return this.getEndpoint().subscribe( this._liveUpdates, this ).then( () => this );
        }
        else{
            if( this._liveUpdates ){
                this.getEndpoint().unsubscribe( this._liveUpdates, this );
                this._liveUpdates = null;
            }

            // TODO: Return the resolved promise.
        }
    }

    /** @internal */
    _liveUpdates : object

    fetch( a_options : { liveUpdates? : LiveUpdatesOption } & TransactionOptions & { [ key : string ] : any } = {} ) : IOPromise<this> {
        const options = { parse : true, ...a_options },
            endpoint = this.getEndpoint();

        return startIO(
            this,
            endpoint.list( options, this ),
            options,

            json => {
                let result : any = this.set( json, { parse : true, ioMethod : 'fetch', ...options } as TransactionOptions );
                
                if( options.liveUpdates ){
                    result = this.liveUpdates( options.liveUpdates );
                }

                return result;
            }
        );
    }

    dispose() : void {
        if( this._disposed ) return;

        const aggregated = !this._shared;

        for( let record of this.models ){
            free( this, record );

            if( aggregated ) record.dispose();
        }

        this.liveUpdates( false );

        super.dispose();
    }

    reset( a_elements? : ElementsArg<R>, options : TransactionOptions = {} ) : R[] {
        const isRoot = begin( this ),
              previousModels = this.models;

        // Make all changes required, but be silent.
        if( a_elements ){            
            emptySetTransaction( this, toElements( this, a_elements, options ), options, true );
        }
        else{
            this._byId = {};
            this.models = [];
        }

        markAsDirty( this, options );

        options.silent || trigger2( this, 'reset', this, { previousModels, ...options } );

        // Dispose models which are not in the updated collection.
        const { _byId } = this;
        
        for( let toDispose of previousModels ){
            _byId[ toDispose.cid ] || free( this, toDispose );
        }

        isRoot && commit( this );
        return this.models;
    }

    // Add elements to collection.
    add( a_elements : ElementsArg<R> , options : AddOptions = {} ){
        const elements = toElements( this, a_elements, options ),
              transaction = this.models.length ?
                    addTransaction( this, elements, options ) :
                    emptySetTransaction( this, elements, options );

        if( transaction ){
            transaction.commit();
            return transaction.added;
        }
    }

    // Remove elements. 
    remove( recordsOrIds : any, options : CollectionOptions = {} ) : R[] | R {
        if( recordsOrIds ){
            return Array.isArray( recordsOrIds ) ?
                        removeMany( this, recordsOrIds, options ) as R[]:
                        removeOne( this, recordsOrIds, options ) as R;
        }

        return [];
    }

    $includes( idOrObj : R ) : Linked<boolean> {
        return new LinkedIncludes( this, idOrObj );
    }

    // Apply bulk object update without any notifications, and return open transaction.
    // Used internally to implement two-phase commit.   
    /** @internal */
    _createTransaction( a_elements : ElementsArg<R>, options : TransactionOptions = {} ) : CollectionTransaction | void {
        const elements = toElements( this, a_elements, options );

        if( this.models.length ){
            return options.remove === false ?
                        addTransaction( this, elements, options, true ) :
                        setTransaction( this, elements, options );
        }
        else{
            return emptySetTransaction( this, elements, options );
        }
    }

    /** @internal */
    static _metatype = AggregatedType;

    /***********************************
     * Collection manipulation methods
     */

    sort( options : TransactionOptions = {} ) : this {
        if( sortElements( this, options ) ){
            const isRoot = begin( this );
            
            if( markAsDirty( this, options ) ){
                trigger2( this, 'sort', this, options );
            }

            isRoot && commit( this );
        }

        return this;
    }

    // Remove and return given model.
    unset( modelOrId : R | string, options? ) : R {
        const value = this.get( modelOrId );
        this.remove( modelOrId, { unset : true, ...options } );
        return value;
    }

    modelId( attrs : {} ) : any {
        return attrs[ this.model.prototype.idAttribute ];
    }

    // Toggle model in collection.
    toggle( model : R, a_next? : boolean ) : boolean {
        var prev = Boolean( this.get( model ) ),
            next = a_next === void 0 ? !prev : Boolean( a_next );

        if( prev !== next ){
            if( prev ){
                this.remove( model );
            }
            else{
                this.add( model );
            }
        }

        return next;
    }

    /** @internal */
    _log( level : LogLevel, topic : string, text : string, value : object, a_logger? : Logger ) : void {
        ( a_logger || logger ).trigger( level, topic, `${ this.model.prototype.getClassName() }.${ this.getClassName() }: ` + text, {
            Argument : value,
            'Attributes spec' : this.model.prototype._attributes
        });
    }

    getClassName() : string {
        return super.getClassName() || 'Collection';
    }

    /***********************************
     * Proxied Array methods
     */

    get length() : number { return this.models.length; }

    // Add a model to the end of the collection.
    push(model : ElementsArg<R>, options? : CollectionOptions ) {
        return this.add(model, { at: this.length, ...options });
    }

    // Remove a model from the end of the collection.
    pop( options? : CollectionOptions ) : R {
        var model = this.at(this.length - 1);
        this.remove(model, { unset : true, ...options });
        return model;
    }

    // Add a model to the beginning of the collection.
    unshift(model : ElementsArg<R>, options? : CollectionOptions ) {
        return this.add(model, { at: 0, ...options });
    }
  
    // Remove a model from the beginning of the collection.
    shift( options? : CollectionOptions ) : R {
        const model = this.at(0);
        this.remove( model, { unset : true, ...options } );
        return model;
    }
}


export interface Collection<R extends Model> extends ArrayMixin<R>{}

export type LiveUpdatesOption = boolean | ( ( x : any ) => boolean );

export type ElementsArg<R = Model> = Partial<R> | Partial<R>[]

// TODO: make is safe for parse to return null (?)
function toElements<R extends Model>( collection : Collection<R>, elements : ElementsArg<R>, options : CollectionOptions ) : Elements {
    const parsed = options.parse ? collection.parse( elements, options ) : elements; 
    return Array.isArray( parsed ) ? parsed : [ parsed ];
}

Model.Collection = Collection;

class LinkedIncludes extends Linked<boolean> {
    constructor(
        private collection,
        private model : Model ){
            super( collection.get( model ) )
    }

    set( x : boolean ) : void {
        this.collection.toggle( this.model );
    }
}
