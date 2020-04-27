import { define, isProduction, log, Model } from '@type-r/models';
import { HttpMethod, RestfulEndpoint, RestfulFetchOptions, RestfulIOOptions, UrlTemplate } from './restful';

/**
 * Implement custom model.fetch() according to the given rules.
 * All other I/O methods are not supported, this is read-only model.
 * 
 * @param method HTTP Method to use
 * @param url template function to generate the URL
 * @param options options coming from `model.fetch( options )`
 */
export function fetchModelIO( method : HttpMethod, url : string | UrlTemplate, options? : RestfulFetchOptions ){
    return new ModelFetchEndpoint( method, url, options );
}

function notSupported( method ){
    throw new ReferenceError( `Method ${method} is not supported. modelFetchIO supports only model.fetch().` );
} 

@define class ModelFetchEndpoint extends RestfulEndpoint {
    constructor(
        public method : HttpMethod,
        public url : string | UrlTemplate,
        { mockData, ...options } : RestfulFetchOptions = {}
    ){
        super( '', mockData ? { mockData : [ mockData ], ...options } : options );
    }

    async list(){ notSupported( 'collection.fetch()') }
    async destroy(){ notSupported( 'model.destroy()') }
    async create(){ notSupported( 'model.save()') }
    async update(){ notSupported( 'model.save()') }

    async read( id, options : RestfulIOOptions, model : Model ){
        const url = this.collectionUrl( model, options );

        if( this.memoryIO ){
            log( isProduction ? "error" : "info", 'Type-R:SimulatedIO', `GET ${url}`);
            return ( await this.memoryIO.list( options ) )[ 0 ];
        }
        else{
            return this.request( this.method, url, options );
        }
    }
}