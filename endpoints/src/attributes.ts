import { IOEndpoint, IOOptions, IOPromise } from '@type-r/models'

export function attributesIO(){
    return new AttributesEndpoint();
}

export class AttributesEndpoint implements IOEndpoint {
    create( json, options : IOOptions ) : IOPromise<any> {
        throw new Error( 'Method is not supported.' );        
    }

    update( id, json, options : IOOptions ) : IOPromise<any> {
        throw new Error( 'Method is not supported.' );        
    }

    read( id, options : IOOptions, record ) : IOPromise<any> {
        const names = record.keys().filter( name => record[ name ] && record[ name ].fetch ),
            promises = names.map( name => record[ name ].fetch( options ) ),
            promise : IOPromise<any> = Promise.all( promises ).then( () => {} );

        promise.abort = function(){
            promises.forEach( x => x.abort && x.abort() );
        }

        return promise;
    }

    destroy( id, options : IOOptions ) : IOPromise<any> {
        throw new Error( 'Method is not supported.' );        
    }

    list( options? : IOOptions ) : IOPromise<any> {
        throw new Error( 'Method is not supported.' );
    }

    subscribe( events ) : any {}
    unsubscribe( events) : any {}
}

declare var Promise;