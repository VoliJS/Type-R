import { IOEndpoint, IOOptions, log, isProduction } from '@type-r/models'
import { memoryIO, MemoryEndpoint } from './memory'

export function create( url : string, fetchOptions? : Partial<RestfulFetchOptions> ){
    return new RestfulEndpoint( url, fetchOptions );
}

export { create as restfulIO }

export type HttpMethod = 'GET' | 'POST' | 'UPDATE' | 'DELETE' | 'PUT'

export interface RestfulIOOptions extends IOOptions {
    params? : object,
    options? : RequestInit
}

export type RestfulFetchOptions = /* subset of RequestInit */{
    cache?: RequestCache;
    credentials?: RequestCredentials;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrerPolicy?: ReferrerPolicy;
    mockData? : any
    simulateDelay? : number 
}

export class RestfulEndpoint implements IOEndpoint {
    constructor( public url : string, { mockData, simulateDelay = 1000, ...fetchOptions } : RestfulFetchOptions = {}) {
        this.fetchOptions = fetchOptions
        this.memoryIO =  mockData && !isProduction ? memoryIO( mockData, simulateDelay ) : null;

        if( mockData && isProduction ){
            log( 'error', 'Type-R:RestfulIO', `Mock data is used in production for ${url}`);
        }
    }

    fetchOptions : RestfulFetchOptions
    memoryIO : MemoryEndpoint

    public static defaultFetchOptions : RestfulFetchOptions = {
        cache: "no-cache",
        credentials: "same-origin",
        mode: "cors",
        redirect: "error",
    }

    create( json, options : RestfulIOOptions, record ) {
        const url = this.collectionUrl( record, options );
        return this.memoryIO ?
            this.simulateIO( 'create', 'POST', url, arguments ) :
            this.request( 'POST', url, options, json );
    }

    update( id, json, options : RestfulIOOptions, record ) {
        const url = this.objectUrl( record, id, options )
        return this.memoryIO ?
            this.simulateIO( 'update', 'PUT', url, arguments ) :
            this.request( 'PUT', url, options, json );
    }

    read( id, options : IOOptions, record ){
        const url = this.objectUrl( record, id, options );
        return this.memoryIO ?
            this.simulateIO( 'read', 'GET', url, arguments ) :
            this.request( 'GET', url, options );
        }

    destroy( id, options : RestfulIOOptions, record ){
        const url = this.objectUrl( record, id, options );
        return this.memoryIO ?
            this.simulateIO( 'destroy', 'DELETE', url, arguments ) :
            this.request( 'DELETE', url, options );
    }

    list( options : RestfulIOOptions, collection ) {
        const url = this.collectionUrl( collection, options );
        return this.memoryIO ?
            this.simulateIO( 'list', 'GET', url, arguments ) :
            this.request( 'GET', url , options );
    }

    subscribe( events ) : any {}
    unsubscribe( events ) : any {}

    async simulateIO( method : string, httpMethod : string, url : string, args ){
        log( isProduction ? "error" : "info", 'Type-R:SimulatedIO', `${httpMethod} ${url}`);
        return this.memoryIO[ method ].apply( this.memoryIO, args );
    }

    protected isRelativeUrl( url ) {
        return url.indexOf( './' ) === 0;
    }

    protected removeTrailingSlash( url : string ) {
        const endsWithSlash = url.charAt( url.length - 1 ) === '/';
        return endsWithSlash ? url.substr( 0, url.length - 1 ) : url;
    }

    protected getRootUrl( recordOrCollection ) {
        const { url } = this
        if( this.isRelativeUrl( url ) ) {
            const owner         = recordOrCollection.getOwner(),
                  ownerUrl      = owner.getEndpoint().getUrl( owner );

            return this.removeTrailingSlash( ownerUrl ) + '/' + url.substr( 2 )
        } else {
            return url;
        }
    }

    protected getUrl( record ) {
        const url = this.getRootUrl( record );
        return record.isNew()
            ? url
            : this.removeTrailingSlash( url ) + '/' + record.id
    }

    protected objectUrl( record, id, options ){
        return appendParams( this.getUrl( record ), options.params );
    }

    protected collectionUrl( collection, options ){
        return appendParams( this.getRootUrl( collection ), options.params );
    }

    protected buildRequestOptions( method : string, options? : RequestInit, body? ) : RequestInit {
        const mergedOptions : RequestInit = {
            ...RestfulEndpoint.defaultFetchOptions,
            ...this.fetchOptions,
            ...options
        };

        const {headers, ...rest}          = mergedOptions,
              resultOptions : RequestInit = {
                  method,
                  headers: {
                      'Content-Type': 'application/json',
                      ...headers
                  },
                  ...rest
              };

        if( body ) {
            resultOptions.body = JSON.stringify( body );
        }
        return resultOptions;
    }

    protected request( method : HttpMethod, url : string, {options} : RestfulIOOptions, body? ) : Promise<any> {
        
        return fetch( url, this.buildRequestOptions( method, options, body ) )
            .then( response => {
                if( response.ok ) {
                    return response.json()
                } else {
                    throw new Error( response.statusText )
                }
            } );
    }
}

function appendParams( url, params? ) {
    var esc = encodeURIComponent;
    return params
        ? url + '?' + Object.keys( params )
                          .map( k => esc( k ) + '=' + esc( params[ k ] ) )
                          .join( '&' )
        : url;
}