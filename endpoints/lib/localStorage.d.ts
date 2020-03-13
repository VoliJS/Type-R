import { IOEndpoint, IOOptions, IOPromise } from '@type-r/models';
export declare function localStorageIO(key: string): LocalStorageEndpoint;
export declare class LocalStorageEndpoint implements IOEndpoint {
    key: string;
    constructor(key: string);
    resolve(value: any): IOPromise<any>;
    reject(value: any): IOPromise<any>;
    create(json: any, options: IOOptions): IOPromise<any>;
    set(json: any): void;
    get(id: any): any;
    update(id: any, json: any, options: IOOptions): IOPromise<any>;
    read(id: any, options: IOOptions): IOPromise<any>;
    destroy(id: any, options: IOOptions): IOPromise<any>;
    get index(): (string | number)[];
    set index(x: (string | number)[]);
    list(options?: IOOptions): IOPromise<any>;
    subscribe(events: any): any;
    unsubscribe(events: any): any;
}
