import { Record } from './record';
import { Linked } from '@linked/value';
export declare function addAttributeLinks(Model: typeof Record): void;
export declare type LinkedAttributes<T> = {
    readonly [K in keyof T]: ModelAttrRef<T[K]>;
};
export declare class ModelAttrRef<T> extends Linked<T> {
    protected model: Record;
    protected attr: string;
    constructor(model: Record, attr: string);
    set(x: T): void;
    _error: any;
    error: any;
    readonly descriptor: import("./metatypes").AnyType;
}
