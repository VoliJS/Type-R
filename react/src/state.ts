import { useReducer, useRef, useEffect } from 'react'
import { Model, Collection, Transactional, SubsetCollection } from '@type-r/models'

export const useModel : <M extends typeof Model>( Ctor : M ) => InstanceType<M> = mutableHook( Model => new Mutable( new Model ) );

export function useModelCopy<M extends Model>( model : M ) : M {
    const local = useModel( model.constructor as any );

    useEffect( () => {
        local.assignFrom( model );
    }, [ ( model as any )._changeToken ] );

    return local;
}

export interface CollectionHooks {
    of<M extends typeof Model>( Ctor : M ) : Collection<InstanceType<M>>
    ofRefs<M extends typeof Model>( Ctor : M ) : Collection<InstanceType<M>>
    subsetOf<T extends Model>( init : Collection<T> ) : SubsetCollection<T>
}


const createSubsetOf = collection => new Mutable( collection.createSubset([]) );

export const useCollection : CollectionHooks = {
    of : mutableHook( Model => new Mutable( new ( Collection.of( Model ) )() ) ),
    ofRefs : mutableHook( Model => new Mutable( new ( Collection.ofRefs( Model ) )() ) ),
    //subsetOf : mutableHook( collection => new Mutable( collection.createSubset([]) ) ),
    
    subsetOf<T extends Model>( init : Collection<T> ) : SubsetCollection<T> {
        // Get the model instance.
        const [ mutable, forceUpdate ] = useReducer( mutableReducer, init, createSubsetOf );

        // TODO: mutable.store = useContext( Store )???
    
        // When master collection changes, resolve refs if they are not resolved yet.
        useEffect( () => {
            const coll = mutable.value as any;
            coll.resolvedWith || coll.resolve( init );
        }, [ Boolean( init.models.length ) ] )

        useEffect( () => {
            mutable._onChildrenChange = obj => forceUpdate( obj );
            return () => mutable.value.dispose();
        }, emptyArray );
    
        return mutable.value as any;
    }
}

class Mutable {
    _onChildrenChange : Function = void 0
    _changeToken : object

    getStore(){
        return ( this.value as any )._defaultStore;
    }

    constructor(
        public value : Transactional
    ){
        this._changeToken = (value as any)._changeToken;
        (value as any)._owner = this;
        (value as any)._ownerKey || ( (value as any)._ownerKey = 'reactState' );
    }
}

function mutableReducer( mutable : Mutable ){
    // Suppress extra change events.
    if( mutable._changeToken === (mutable.value as any)._changeToken ) return mutable;

    const copy = new Mutable( mutable.value );
    copy._onChildrenChange = mutable._onChildrenChange;
    
    return copy;
}

function mutableHook( create : ( x : any ) => Mutable ) : any {
    return ( init : any ) : Transactional => {
        // Get the model instance.
        const [ mutable, forceUpdate ] = useReducer( mutableReducer, init, create );

        // TODO: mutable.store = useContext( Store )???
    
        useEffect( () => {
            mutable._onChildrenChange = obj => forceUpdate( obj );
            return () => mutable.value.dispose();
        }, emptyArray );
    
        return mutable.value as any;
    }
}

const emptyArray = [];