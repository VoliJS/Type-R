import { CollectionConstructor } from '../collection';
import { TheType } from '@type-r/mixture';
import { CloneOptions, Owner, Transactional, TransactionalDefinition, TransactionOptions } from '../transactions';
import { Infer } from './attrDef';
import { IOModel } from './io-mixin';
import { AttributesConstructor, AttributesContainer, AttributesCopyConstructor, AttributesValues } from './updates';
import { LinkedModelHash } from './linked-attrs';
export interface ConstructorOptions extends TransactionOptions {
    clone?: boolean;
}
export interface ModelDefinition extends TransactionalDefinition {
    idAttribute?: string;
    attributes?: AttributesValues;
    collection?: object;
    Collection?: typeof Transactional;
}
export interface ModelConstructor<A extends object> extends TheType<typeof Model> {
    new (attrs?: Partial<InferAttrs<A>>, options?: object): Model & ModelAttributes<A>;
    prototype: Model;
    attributes: A;
    Collection: CollectionConstructor<Model & ModelAttributes<A>>;
}
declare type ModelAttributes<D extends object> = InferAttrs<D> & {
    readonly $: LinkedModelHash<InferAttrs<D>>;
};
export declare type InferAttrs<A extends object> = {
    [K in keyof A]: Infer<A[K]>;
};
export declare type LinkedAttributes<M extends {
    attributes: object;
}> = LinkedModelHash<InferAttrs<M['attributes']>>;
export declare type AttributesMixin<M extends {
    attributes: object;
}> = ModelAttributes<M['attributes']>;
export declare class Model extends Transactional implements IOModel, AttributesContainer, Iterable<any> {
    static onDefine(definition: any, BaseClass: any): void;
    static comparator<T extends typeof Model>(this: T, attr: keyof InstanceType<T>, asc?: boolean): (a: InstanceType<T>, b: InstanceType<T>) => -1 | 0 | 1;
    static Collection: CollectionConstructor;
    static DefaultCollection: CollectionConstructor;
    static id: import("./attrDef").ChainableAttributeSpec<StringConstructor>;
    static readonly ref: import("./attrDef").ChainableAttributeSpec<typeof Model>;
    static extendAttrs<T extends typeof Model, A extends object>(this: T, attrs: A): ModelConstructor<T['attributes'] & A>;
    static defaults(attrs: AttributesValues): typeof Model;
    static attributes: AttributesValues;
    _attributes$: object;
    __Attributes$: new (model: Model) => object;
    previousAttributes(): AttributesValues;
    readonly changed: AttributesValues;
    changedAttributes(diff?: {}): boolean | {};
    hasChanged(key?: string): boolean;
    previous(key: string): any;
    isNew(): boolean;
    has(key: string): boolean;
    unset(key: string, options?: any): any;
    clear(options?: any): this;
    getOwner(): Owner;
    idAttribute: string;
    id: string;
    Attributes: AttributesConstructor;
    AttributesCopy: AttributesCopyConstructor;
    defaults(values?: {}): {};
    constructor(a_values?: any, a_options?: ConstructorOptions);
    initialize(values?: Partial<this>, options?: any): void;
    clone(options?: CloneOptions): this;
    get(key: string): any;
    set(values: any, options?: TransactionOptions): this;
    toJSON(options?: TransactionOptions): any;
    parse(data: any, options?: TransactionOptions): any;
    deepSet(name: string, value: any, options?: any): this;
    readonly collection: any;
    dispose(): void;
    getClassName(): string;
    forceAttributeChange: (key: string, options: TransactionOptions) => void;
    forEach(iteratee: (value?: any, key?: string) => void, context?: any): void;
    mapObject(a_fun: (value: any, key: any) => any, context?: any): object;
    [Symbol.iterator](): ModelEntriesIterator;
    entries(): ModelEntriesIterator;
    keys(): string[];
}
export interface Model extends IOModel {
}
export interface Model extends AttributesContainer {
}
export declare class ModelEntriesIterator implements Iterator<[string, any]> {
    private readonly record;
    private idx;
    constructor(record: Model);
    next(): IteratorResult<[string, any]>;
}
export {};
