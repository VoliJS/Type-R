import { useEffect, useReducer } from 'react'
import { Transactional } from '@type-r/models';

// Force component update when some global model or collection change.
export function useChanges( instance : Transactional ){
    const forceUpdate = useForceUpdate();

    useEffect( () => {
        function onChange( x ){
            forceUpdate( x );
        }

        instance.onChanges( onChange );
        return () => instance.offChanges( onChange );
    }, emptyArray );
}

const emptyArray = [];

export function useForceUpdate(){
    return useReducer( transactionalUpdate, null )[ 1 ];
}

function transactionalUpdate( _changeToken : object, modelOrCollection : Transactional ){
    return ( modelOrCollection as any )._changeToken;
}