import { useReducer, useRef, useEffect } from 'react'
import { Model, Collection, Transactional } from '@type-r/models'

export const useModel : <M extends typeof Model>( Ctor : M ) => InstanceType<M> = mutableHook( Model => new Mutable( new Model ) );

export interface CollectionHooks {
    of<M extends typeof Model>( Ctor : M ) : Collection<InstanceType<M>>
    ofRefs<M extends typeof Model>( Ctor : M ) : Collection<InstanceType<M>>
    subsetOf<C extends Collection>( collection : C ) : C
}

export const useCollection : CollectionHooks = {
    of : mutableHook( Model => new Mutable( new ( Collection.of( Model ) )() ) ),
    ofRefs : mutableHook( Model => new Mutable( new ( Collection.ofRefs( Model ) )() ) ),
    subsetOf : mutableHook( collection => new Mutable( collection.createSubset([]) ) )
}

class Mutable {
    _onChildrenChange : Function = void 0

    getStore(){
        return ( this.value as any )._defaultStore;
    }

    constructor(
        public value : Transactional
    ){
        (value as any)._owner = this;
        (value as any)._ownerKey || ( (value as any)._ownerKey = 'reactState' );
    }
}

function mutableReducer( mutable : Mutable ){
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
            mutable._onChildrenChange = forceUpdate;
            return () => mutable.value.dispose();
        }, emptyArray );
    
        return mutable.value as any;
    }
}

const emptyArray = [];