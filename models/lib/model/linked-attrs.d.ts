import { Model } from './model';
import { Linked } from '@linked/value';
export declare function addAttributeLinks(Class: typeof Model): void;
export declare type LinkedAttributes<T> = {
    readonly [K in keyof T]: ModelAttrRef<T[K]>;
};
export declare class ModelAttrRef<T> extends Linked<T> {
    protected model: Model;
    protected attr: string;
    constructor(model: Model, attr: string);
    set(x: T): void;
    _error: any;
    error: any;
    readonly descriptor: import("./metatypes").AnyType;
}
