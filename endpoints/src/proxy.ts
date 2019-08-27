import { IOEndpoint, Record } from '@type-r/models';

const parseOptions = { parse : true, strict : true };

export function proxyIO( record : typeof Record, options : ProxyIOOptions = {} ){
    return new ProxyEndpoint( record, options );
}

export interface ProxyIOOptions {
    createAttrs? : string
    updateAttrs? : string
}

export interface ProxyIOInternalOptions {
    createAttrs? : string[]
    updateAttrs? : string[]
}


export class ProxyEndpoint implements IOEndpoint {
    Record : typeof Record
    get endpoint(){
        return ( this.Record.prototype as any )._endpoint;
    }

    options : ProxyIOInternalOptions = {}

    constructor( record : typeof Record, options : ProxyIOOptions = {} ){
        this.Record = record;

        if( options.createAttrs ){
            this.options.createAttrs = options.createAttrs.split( /\s+/ );
        }

        if( options.updateAttrs ){
            this.options.updateAttrs = options.updateAttrs.split( /\s+/ );
        }

        // Create proxy methods...
        const source = Object.getPrototypeOf( this.endpoint );

        Object.keys( source ).forEach( key => {
            if( !this[ key ] && typeof source[ key ] === 'function' ){
                this[ key ] = function(){
                    return source[ key ].apply( this.endpoint, arguments );
                }
            }
        });
    }

    async subscribe( events, target ){
        return this.endpoint.subscribe( events, target );
    }

    unsubscribe( events, target ){
        this.endpoint.unsubscribe( events, target );
    }

    async list( options ){
        const coll = new this.Record.Collection();
        await coll.fetch( options );
        return coll.toJSON();
    }

    async update( id, json, options ){
        json.id = id;
        const doc : any = this.Record.from( json, parseOptions );
        await doc.save( options );
        const res = { _cas : doc._cas };

        fillAttrs( res, doc, this.options.updateAttrs );
        
        return res;
    }

    async create( json, options ){
        const doc : any = this.Record.from( json, parseOptions );
        await doc.save( options );
        const res = { id : doc.id, _cas : doc._cas, _type : doc._type };
        
        fillAttrs( res, doc, this.options.createAttrs );
        
        return res;
    }

    async read( id, options : object ){
        const doc = new this.Record({ id });
        await doc.fetch( options );
        return doc.toJSON();
    }

    async destroy( id : string, options : object ){
        return this.endpoint.destroy( id, options )
    }
}

function fillAttrs( res : object, doc : Record, attrs : string[] ){
    if( attrs ){
        const json = doc.toJSON();
        for( let key of attrs ){
            res[ key ] = json[ key ];
        }
    }
}