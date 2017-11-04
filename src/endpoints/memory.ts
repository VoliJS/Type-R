import { IOEndpoint, IOPromise, createIOPromise } from '../io-tools'

export type Index = ( number | string )[];

export function create( delay = 1000 ){
    return new MemoryEndpoint( delay );
}

export { create as memoryIO };

export class MemoryEndpoint implements IOEndpoint {
    static create( delay = 1000 ){
        return new this( delay );
    }

    resolve( value ){
        return createIOPromise( ( resolve, reject ) => {
            setTimeout( () => resolve( value ), this.delay );
        });
    }
    
    reject( value ){
        return createIOPromise( ( resolve, reject ) => {
            setTimeout( () => reject( value ), this.delay );
        });
    }

    constructor( public delay : number ){
    }

    index : Index = [ 0 ];
    items = {};

    generateId(){
        return String( ( this.index[ 0 ] as number ) ++ );
    }

    create( json, options ) {
        const id = json.id = this.generateId();
        this.index.push( id );
        this.items[ id ] = json;
        return this.resolve({ id });
    }

    update( id, json, options ) {
        const existing = this.items[ id ];
        if( existing ){
            this.items[ id ] = json;
            return this.resolve( {} );
        }
        else{
            return this.reject( "Not found");
        }
    }

    read( id, options ){
        const existing = this.items[ id ];
        return existing ?
            this.resolve( existing ) : 
            this.reject( "Not found" );
    }

    destroy( id, options ){
        const existing = this.items[ id ];
        if( existing ){
            delete this.items[ id ];
            this.index = this.index.filter( x => x !== id );
            return this.resolve( {} );
        }
        else{
            return this.reject( "Not found" );
        }
    }

    list( options? : object ) {
        return this.resolve( this.index.slice( 1 ).map( id => this.items[ id ]) );
    }

    subscribe( events ) : any {}
    unsubscribe( events) : any {}
}