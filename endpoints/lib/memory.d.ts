import { IOEndpoint, IOPromise } from '@type-r/models';
declare type Index = (number | string)[];
export declare function memoryIO(init?: any[], delay?: number): MemoryEndpoint;
export declare class MemoryEndpoint implements IOEndpoint {
    delay: number;
    resolve(value: any): IOPromise<any>;
    reject(value: any): IOPromise<any>;
    constructor(init: object[], delay: number);
    index: Index;
    items: {};
    generateId(a_id: any): any;
    create(json: any, options: any): IOPromise<any>;
    update(id: any, json: any, options: any): IOPromise<any>;
    read(id: any, options: any): IOPromise<any>;
    destroy(id: any, options: any): IOPromise<any>;
    list(options?: object): IOPromise<any>;
    subscribe(events: any): any;
    unsubscribe(events: any): any;
}
export {};
