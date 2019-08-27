import { Model } from '@type-r/models';
import { RestfulFetchOptions, RestfulEndpoint, RestfulIOOptions, HttpMethod } from './restful';
export declare type ConstructUrl = (params: {
    [key: string]: any;
}, model?: Model) => string;
export declare function fetchModelIO(method: HttpMethod, url: ConstructUrl, options?: RestfulFetchOptions): ModelFetchEndpoint;
declare class ModelFetchEndpoint extends RestfulEndpoint {
    method: HttpMethod;
    constructUrl: ConstructUrl;
    constructor(method: HttpMethod, constructUrl: ConstructUrl, { mockData, ...options }?: RestfulFetchOptions);
    list(): Promise<void>;
    destroy(): Promise<void>;
    create(): Promise<void>;
    update(): Promise<void>;
    read(id: any, options: RestfulIOOptions, model: Model): Promise<any>;
}
export {};
