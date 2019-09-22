import { Model } from './model';
import { Linked } from '@linked/value';
export declare function addAttributeLinks(Class: typeof Model): void;
export declare type LinkedModelHash<T extends object> = {
    readonly [K in keyof T]: LinkedAttr<T[K]>;
};
export declare class LinkedAttr<T> extends Linked<T> {
    protected model: Model;
    protected attr: string;
    protected _token: any;
    constructor(model: Model, attr: string, value: any, _token: any);
    set(x: T): void;
    _error: any;
    error: any;
    readonly descriptor: import("./metatypes").AnyType;
}
