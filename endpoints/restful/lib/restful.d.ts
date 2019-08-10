import { IOEndpoint, IOOptions } from 'type-r';
import { MemoryEndpoint } from '../../memory';
export declare function create(url: string, fetchOptions?: Partial<RestfulFetchOptions>): RestfulEndpoint;
export { create as restfulIO };
export declare type HttpMethod = 'GET' | 'POST' | 'UPDATE' | 'DELETE' | 'PUT';
export interface RestfulIOOptions extends IOOptions {
    params?: object;
    options?: RequestInit;
}
export declare type RestfulFetchOptions = {
    cache?: RequestCache;
    credentials?: RequestCredentials;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrerPolicy?: ReferrerPolicy;
    mockData?: any;
    simulateDelay?: number;
};
export declare class RestfulEndpoint implements IOEndpoint {
    url: string;
    constructor(url: string, { mockData, simulateDelay, ...fetchOptions }?: RestfulFetchOptions);
    fetchOptions: RestfulFetchOptions;
    memoryIO: MemoryEndpoint;
    static defaultFetchOptions: RestfulFetchOptions;
    create(json: any, options: RestfulIOOptions, record: any): Promise<any>;
    update(id: any, json: any, options: RestfulIOOptions, record: any): Promise<any>;
    read(id: any, options: IOOptions, record: any): Promise<any>;
    destroy(id: any, options: RestfulIOOptions, record: any): Promise<any>;
    list(options: RestfulIOOptions, collection: any): Promise<any>;
    subscribe(events: any): any;
    unsubscribe(events: any): any;
    simulateIO(method: string, httpMethod: string, url: string, args: any): Promise<any>;
    protected isRelativeUrl(url: any): boolean;
    protected removeTrailingSlash(url: string): string;
    protected getRootUrl(recordOrCollection: any): string;
    protected getUrl(record: any): string;
    protected objectUrl(record: any, id: any, options: any): any;
    protected collectionUrl(collection: any, options: any): any;
    protected buildRequestOptions(method: string, options?: RequestInit, body?: any): RequestInit;
    protected request(method: HttpMethod, url: string, { options }: RestfulIOOptions, body?: any): Promise<any>;
}
