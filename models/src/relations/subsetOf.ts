import { Collection, CollectionConstructor, ElementsArg, CollectionOptions } from '../collection';
import { define, tools } from '@type-r/mixture';
import { AggregatedType, ChainableAttributeSpec, Model, type } from '../model';
import { ItemsBehavior, transactionApi } from '../transactions';
import { CollectionReference, parseReference } from './commons';


type ModelsIds = ( string | number )[];

// TODO: Change the last parameter to be the Model constructor. Extract the proper Collection type.
export function subsetOf<X extends CollectionConstructor<R>, R extends Model>( this : void, masterCollection : CollectionReference, T? : X ) : ChainableAttributeSpec<SubsetCollectionConstructor<R>>{
    const CollectionClass = T || Collection,
        // Lazily define class for subset collection, if it's not defined already...
        SubsetOf = CollectionClass._SubsetOf || ( CollectionClass._SubsetOf = defineSubsetCollection( CollectionClass as any ) as any ),
        getMasterCollection = parseReference( masterCollection );

    return type( SubsetOf ).get(
        function( refs ){
            !refs || refs.resolvedWith || refs.resolve( getMasterCollection( this ) );
            return refs;
        }
    );
}


type subsetOfType = typeof subsetOf;

declare module "../collection" {
    namespace Collection {
        export const subsetOf : subsetOfType;
    }    
}

( Collection as any ).subsetOf = subsetOf;


Collection.prototype.createSubset = function<M extends Model>( this : Collection<M>, models : any, options ) : SubsetCollection<M> {
    const SubsetOf = subsetOf( this, this.constructor as any ).options.type,
          subset   = new SubsetOf( models, options );
        
    subset.resolve( this );
    return subset as any;
}

const subsetOfBehavior = ItemsBehavior.share | ItemsBehavior.persistent;

function defineSubsetCollection( CollectionClass : typeof Collection ) {
    @define class SubsetOfCollection extends CollectionClass {
        refs : any[];
        resolvedWith : Collection = null;

        _metatype : AggregatedType

        get __inner_state__(){ return this.refs || this.models; }

        constructor( recordsOrIds?, options? ){
            super( [], options, subsetOfBehavior );
            this.refs = toArray( recordsOrIds );
        }

        // Remove should work fine as it already accepts ids. Add won't...
        add( a_elements, options = {} ){
            const { resolvedWith } = this,
                    toAdd = toArray( a_elements );
            
            if( resolvedWith ){
                // If the collection is resolved already, everything is simple.
                return super.add( resolveRefs( resolvedWith, toAdd ), options );
            }
            else{
                // Collection is not resolved yet. So, we prepare the delayed computation.
                if( toAdd.length ){
                    const isRoot = transactionApi.begin( this );

                    // Save elements to resolve in future...
                    this.refs = this.refs ? this.refs.concat( toAdd ) : toAdd.slice();

                    transactionApi.markAsDirty( this, options );

                    // And throw the 'changes' event.
                    isRoot && transactionApi.commit( this );
                }
            }
        }

        reset( a_elements?, options = {} ){
            const { resolvedWith } = this,
                elements = toArray( a_elements );
    
            return resolvedWith ?
                // Collection is resolved, so parse ids and forward the call to set.
                super.reset( resolveRefs( resolvedWith, elements ), options ) :
                // Collection is not resolved yet. So, we prepare the delayed computation.
                delaySet( this, elements, options ) as any || [];
        }

        _createTransaction( a_elements, options? ){
            const { resolvedWith } = this,
                elements = toArray( a_elements );
    
            return resolvedWith ?
                // Collection is resolved, so parse ids and forward the call to set.
                super._createTransaction( resolveRefs( resolvedWith, elements ), options ) :
                // Collection is not resolved yet. So, we prepare the delayed computation.
                delaySet( this, elements, options );
        }

        // Serialized as an array of model ids.
        toJSON() : ModelsIds {
            return this.refs ?
                this.refs.map( objOrId => objOrId.id || objOrId ) :
                this.models.map( model => model.id );
        }

        // Subset is always valid.
        _validateNested(){ return 0; }

        get length() : number {
            return this.models.length || ( this.refs ? this.refs.length : 0 );
        }

        // Must be shallow copied on clone.
        clone( owner? ){
            var Ctor = (<any>this).constructor,
                copy = new Ctor( [], {
                    model : this.model,
                    comparator : this.comparator
                });

            if( this.resolvedWith ){
                // TODO: bug here. 
                copy.resolvedWith = this.resolvedWith;
                copy.refs = null;
                copy.reset( this.models, { silent : true } );
            }
            else{
                copy.refs = this.refs.slice();
            }

            return copy;
        }

        // Clean up the custom parse method possibly defined in the base class.
        parse( raw : any ) : Model[] {
            return raw;
        }

        resolve( collection : Collection ) : this {
            if( collection && collection.length ){
                this.resolvedWith = collection;

                if( this.refs ){
                    this.reset( this.refs, { silent : true } );
                    this.refs = null;
                }
            }

            return this;
        }

        getModelIds() : ModelsIds { return this.toJSON(); }

        toggle( modelOrId : any, val : boolean ) : boolean {
            return super.toggle( this.resolvedWith.get( modelOrId ), val );
        }

        addAll() : Model[] {
            if( this.resolvedWith ){
                this.set( this.resolvedWith.models );
                return this.models;
            }

            throw new Error( "Cannot add elemens because the subset collection is not resolved yet." );
        }

        toggleAll() : Model[] {
            return this.length ? this.reset() : this.addAll();
        }
    }

    // Clean up all custom item events to prevent memory leaks.
    SubsetOfCollection.prototype._itemEvents = void 0;

    return SubsetOfCollection;
}

export interface SubsetCollection<M extends Model> extends Collection<M>{
    getModelIds() : string[]
    toggle( modelOrId : string | M, val : boolean ) : boolean
    addAll() : M[]
    toggleAll() : M[]
    resolve( baseCollection : Collection<M> ) : this
}

export interface SubsetCollectionConstructor<R extends Model = Model > {
    new ( records? : ElementsArg<R> | string[], options?: CollectionOptions ) : SubsetCollection<R>
    prototype : SubsetCollection<R>
};

function resolveRefs( master, elements ){
    const records = [];
    
    for( let el of elements ){
        const record = master.get( el );
        if( record ) records.push( record );
    }

    return records;
}

function delaySet( collection, elements, options ) : void {
    if( tools.notEqual( collection.refs, elements ) ){
        const isRoot = transactionApi.begin( collection );

        // Save elements to resolve in future...
        collection.refs = elements.slice();

        transactionApi.markAsDirty( collection, options );
        
        // And throw the 'changes' event.
        isRoot && transactionApi.commit( collection );
    }
}

function toArray( elements ){
    return elements ? ( 
        Array.isArray( elements ) ? elements : [ elements ]
    ) : [];
}