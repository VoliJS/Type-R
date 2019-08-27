import { AnyType, ChainableAttributeSpec, Model } from '../model';
import { CollectionReference, parseReference } from './commons';


/********
 * Reference to model by id.
 * 
 * Untyped attribute. Holds model id, when unresolved. When resolved, is substituted
 * with a real model.
 * 
 * No model changes are detected and counted as owner's change. That's intentional.
 */

/** @private */
type ModelRefValue = Model | string;

/** @private */
class ModelRefType extends AnyType {
    // It is always serialized as an id, whenever it's resolved or not. 
    toJSON( value : ModelRefValue ){
        return value && typeof value === 'object' ? value.id : value;
    }

    // Wne 
    clone( value : ModelRefValue ){
        return value && typeof value === 'object' ? value.id : value;
    }

    // Model refs by id are equal when their ids are equal.
    isChanged( a : ModelRefValue, b : ModelRefValue){
        var aId = a && ( (<Model>a).id == null ? a : (<Model>a).id ),
            bId = b && ( (<Model>b).id == null ? b : (<Model>b).id );

        return aId !== bId;
    }

    // Refs are always valid.
    validate( model, value, name ){}
}

function theMemberOf<R extends typeof Model>( this : void, masterCollection : CollectionReference, T? : R ) : ChainableAttributeSpec<R> {
    const getMasterCollection = parseReference( masterCollection );

    const typeSpec = new ChainableAttributeSpec<R>({
        value : null,
        _metatype : ModelRefType
    });
    
    return typeSpec
        .get( function( objOrId : ModelRefValue, name : string ) : Model {
            if( typeof objOrId === 'object' ) return objOrId;

            // So, we're dealing with an id reference. Resolve it.
            const collection = getMasterCollection( this );
            let   record : Model = null;

            // If master collection exists and is not empty...
            if( collection && collection.length ){
                // Silently update attribute with record from this collection.
                record = collection.get( objOrId ) || null;
                this.attributes[ name ] = record;

                // Subscribe for events manually. delegateEvents won't be invoked.
                record && this._attributes[ name ].handleChange( record, null, this, {} );
            }

            return record;
        });
}

export { theMemberOf as memberOf }

declare module '../model' {
    namespace Model {
        export const memberOf : <R extends typeof Model>( this : R, masterCollection : CollectionReference ) => ChainableAttributeSpec<R>;
    }
}

( Model as any ).memberOf = theMemberOf;