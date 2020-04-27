import { IOEndpoint, IOOptions, Model, Collection, log, isProduction, Transactional } from '@type-r/models'
import { memoryIO, MemoryEndpoint } from './memory'

export type UrlTemplate = ( options : any, model? : any ) => string

export function create( url : string | UrlTemplate, fetchOptions? : Partial<RestfulFetchOptions> ){
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
    constructor( public url : string | UrlTemplate, { mockData, simulateDelay = 1000, ...fetchOptions } : RestfulFetchOptions = {}) {
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

    create( json, options : RestfulIOOptions, model ) {
        const url = this.collectionUrl( model, options );
        return this.memoryIO ?
            this.simulateIO( 'create', 'POST', url, arguments ) :
            this.request( 'POST', url, options, json );
    }

    update( id, json, options : RestfulIOOptions, model ) {
        const url = this.objectUrl( model, id, options )
        return this.memoryIO ?
            this.simulateIO( 'update', 'PUT', url, arguments ) :
            this.request( 'PUT', url, options, json );
    }

    read( id, options : IOOptions, model ){
        const url = this.objectUrl( model, id, options );
        return this.memoryIO ?
            this.simulateIO( 'read', 'GET', url, arguments ) :
            this.request( 'GET', url, options );
        }

    destroy( id, options : RestfulIOOptions, model ){
        const url = this.objectUrl( model, id, options );
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

    protected objectUrl( model : Transactional, id : string, options : RestfulIOOptions = {} ){
        return UrlBuilder
            .from( this.url, model, options )
            .modelId( model )
            .params( options.params )
            .toString()
    }

    protected collectionUrl( collection : Transactional, options : RestfulIOOptions = {} ){
        return UrlBuilder
            .from( this.url, collection, options )
            .params( options.params )
            .toString()
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

export class UrlBuilder {
    static from( url : string | UrlTemplate, object : Transactional, options : RestfulIOOptions = {} ){
        // Resolve URL template 
        let rootUrl = typeof url === 'function' ?
            url( options, object instanceof Model ? object : null )
            : url;
        
        // Resolve relative URL
        if( rootUrl.indexOf( './' ) === 0 ){
            const owner         = object.getOwner() as Model,
                  ownerUrl      = ( owner.getEndpoint() as any ).objectUrl( owner, options );
            
            rootUrl = removeTrailingSlash( ownerUrl ) + '/' + rootUrl.substr( 2 )
        }

        return new UrlBuilder( rootUrl );
    }

    constructor( private url : string ){}

    modelId( model : Transactional ){
        return model instanceof Model && !model.isNew()
            ? this.append( model.id )
            : this;
    }

    append( id : string ){
        return new UrlBuilder( removeTrailingSlash( this.url ) + '/' + id );
    }

    params( params : object ){
        var esc = encodeURIComponent;
        return params ?
            new UrlBuilder(
                this.url + '?' + Object.keys( params )
                    .map( k => esc( k ) + '=' + esc( params[ k ] ) )
                    .join( '&' )
            ):
            this;
    }

    toString(){
        return this.url;
    }
}

function removeTrailingSlash( url : string ) {
    const endsWithSlash = url.charAt( url.length - 1 ) === '/';
    return endsWithSlash ? url.substr( 0, url.length - 1 ) : url;
}