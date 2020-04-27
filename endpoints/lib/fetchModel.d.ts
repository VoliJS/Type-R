import { Model } from '@type-r/models';
import { HttpMethod, RestfulEndpoint, RestfulFetchOptions, RestfulIOOptions, UrlTemplate } from './restful';
export declare function fetchModelIO(method: HttpMethod, url: string | UrlTemplate, options?: RestfulFetchOptions): ModelFetchEndpoint;
declare class ModelFetchEndpoint extends RestfulEndpoint {
    method: HttpMethod;
    url: string | UrlTemplate;
    constructor(method: HttpMethod, url: string | UrlTemplate, { mockData, ...options }?: RestfulFetchOptions);
    list(): Promise<void>;
    destroy(): Promise<void>;
    create(): Promise<void>;
    update(): Promise<void>;
    read(id: any, options: RestfulIOOptions, model: Model): Promise<any>;
}
export {};
