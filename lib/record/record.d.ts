import { CollectionConstructor } from '../collection';
import { TheType } from '../object-plus';
import { CloneOptions, Owner, Transactional, TransactionalDefinition, TransactionOptions } from '../transactions';
import { Infer } from './attrDef';
import { IORecord } from './io-mixin';
import { AttributesConstructor, AttributesContainer, AttributesCopyConstructor, AttributesValues } from './updates';
export interface ConstructorOptions extends TransactionOptions {
    clone?: boolean;
}
export interface RecordDefinition extends TransactionalDefinition {
    idAttribute?: string;
    attributes?: AttributesValues;
    collection?: object;
    Collection?: typeof Transactional;
}
export interface RecordConstructor<A> extends TheType<typeof Record> {
    new (attrs?: Partial<A>, options?: object): Record & A;
    prototype: Record;
    Collection: CollectionConstructor<Record & A>;
}
export declare type InferAttrs<A extends object> = {
    [K in keyof A]: Infer<A[K]>;
};
export declare type AttributesMixin<M extends {
    attributes: object;
}> = InferAttrs<M['attributes']>;
export declare class Record extends Transactional implements IORecord, AttributesContainer, Iterable<any> {
    static onDefine(definition: any, BaseClass: any): void;
    static Collection: CollectionConstructor;
    static DefaultCollection: CollectionConstructor;
    static id: import("./attrDef").ChainableAttributeSpec<StringConstructor>;
    static readonly ref: import("./attrDef").ChainableAttributeSpec<typeof Record>;
    static extendAttrs<T extends typeof Record, A extends object>(this: T, attrs: A): RecordConstructor<InstanceType<T> & InferAttrs<A>>;
    static defaults(attrs: AttributesValues): typeof Record;
    static attributes: AttributesValues;
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
    [Symbol.iterator](): RecordEntriesIterator;
    entries(): RecordEntriesIterator;
    keys(): string[];
}
export interface Record extends IORecord {
}
export interface Record extends AttributesContainer {
}
export declare class RecordEntriesIterator implements Iterator<[string, any]> {
    private readonly record;
    private idx;
    constructor(record: Record);
    next(): IteratorResult<[string, any]>;
}
