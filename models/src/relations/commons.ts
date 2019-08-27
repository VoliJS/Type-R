import { Collection } from '../collection';
import { Model } from '../model';
import { CompiledReference } from '../traversable';

export type CollectionReference = ( () => Collection ) | Collection | string; 

/** @private */
export function parseReference( collectionRef : CollectionReference ) : ( root : Model ) => Collection {
    switch( typeof collectionRef ){
        case 'function' :
            return root => (<any>collectionRef).call( root );
        case 'object'   :
            return () => <Collection>collectionRef;
        case 'string'   :
            const { resolve } = new CompiledReference( <string>collectionRef );
            return resolve;
    }
}