import { Model } from 'type-r';
import { RestfulFetchOptions, RestfulEndpoint, RestfulIOOptions } from './restful';
export declare type HttpMethod = 'GET' | 'POST' | 'UPDATE' | 'DELETE';
export declare type ConstructUrl = (params: {
    [key: string]: any;
}, model?: Model) => string;
export declare function fetchModelIO(method: HttpMethod, url: ConstructUrl, options?: RestfulFetchOptions): ModelFetchEndpoint;
declare class ModelFetchEndpoint extends RestfulEndpoint {
    method: HttpMethod;
    constructUrl: ConstructUrl;
    constructor(method: HttpMethod, constructUrl: ConstructUrl, options?: RestfulFetchOptions);
    list(): Promise<void>;
    destroy(): Promise<void>;
    create(): Promise<void>;
    update(): Promise<void>;
    read(id: any, options: RestfulIOOptions, model: Model): Promise<any>;
}
export {};
