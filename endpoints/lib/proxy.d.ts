import { IOEndpoint, Record } from '@type-r/models';
export declare function proxyIO(record: typeof Record, options?: ProxyIOOptions): ProxyEndpoint;
export interface ProxyIOOptions {
    createAttrs?: string;
    updateAttrs?: string;
}
export interface ProxyIOInternalOptions {
    createAttrs?: string[];
    updateAttrs?: string[];
}
export declare class ProxyEndpoint implements IOEndpoint {
    Record: typeof Record;
    get endpoint(): any;
    options: ProxyIOInternalOptions;
    constructor(record: typeof Record, options?: ProxyIOOptions);
    subscribe(events: any, target: any): Promise<any>;
    unsubscribe(events: any, target: any): void;
    list(options: any): Promise<any>;
    update(id: any, json: any, options: any): Promise<{
        _cas: any;
    }>;
    create(json: any, options: any): Promise<{
        id: any;
        _cas: any;
        _type: any;
    }>;
    read(id: any, options: object): Promise<any>;
    destroy(id: string, options: object): Promise<any>;
}
