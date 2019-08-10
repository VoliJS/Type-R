import { IOPromise } from '../io-tools';
import { EventMap, EventsDefinition, TheType } from '../object-plus';
import { Record } from '../record';
import { CloneOptions, Transactional, TransactionalDefinition, TransactionOptions } from '../transactions';
import { AddOptions } from './add';
import { CollectionCore } from './commons';
export declare type GenericComparator = string | ((x: Record) => number) | ((a: Record, b: Record) => number);
export interface CollectionOptions extends TransactionOptions {
    comparator?: GenericComparator;
    model?: typeof Record;
}
export interface CollectionDefinition extends TransactionalDefinition {
    model?: typeof Record;
    itemEvents?: EventsDefinition;
    _itemEvents?: EventMap;
}
export interface CollectionConstructor<R extends Record = Record> extends TheType<typeof Collection> {
    new (records?: ElementsArg<R>, options?: CollectionOptions): Collection<R>;
    prototype: Collection<R>;
    Refs: CollectionConstructor<R>;
}
export declare class Collection<R extends Record = Record> extends Transactional implements CollectionCore, Iterable<R> {
    static of<M extends typeof Record>(Ctor: M): M['Collection'] extends CollectionConstructor<InstanceType<M>> ? M['Collection'] : CollectionConstructor<InstanceType<M>>;
    static ofRefs<M extends typeof Record>(Ctor: M): M['Collection'] extends CollectionConstructor<InstanceType<M>> ? M['Collection'] : CollectionConstructor<InstanceType<M>>;
    static Subset: typeof Collection;
    static Refs: any;
    createSubset(models: ElementsArg<R>, options?: CollectionOptions): Collection<R>;
    static onExtend(BaseClass: typeof Transactional): void;
    static onDefine(definition: CollectionDefinition, BaseClass: any): void;
    models: R[];
    comparator: GenericComparator;
    getStore(): Transactional;
    get(objOrId: string | {
        id?: string;
        cid?: string;
    }): R;
    [Symbol.iterator](): IterableIterator<R>;
    updateEach(iteratee: (val: R, key?: number) => void): void;
    model: typeof Record;
    idAttribute: string;
    constructor(records?: ElementsArg<R>, options?: CollectionOptions, shared?: number);
    initialize(): void;
    clone(options?: CloneOptions): this;
    toJSON(options?: object): any;
    set(elements?: ElementsArg<R>, options?: TransactionOptions): this;
    liveUpdates(enabled: LiveUpdatesOption): IOPromise<this>;
    fetch(a_options?: {
        liveUpdates?: LiveUpdatesOption;
    } & TransactionOptions): IOPromise<this>;
    dispose(): void;
    reset(a_elements?: ElementsArg<R>, options?: TransactionOptions): R[];
    add(a_elements: ElementsArg<R>, options?: AddOptions): any;
    remove(recordsOrIds: any, options?: CollectionOptions): R[] | R;
    sort(options?: TransactionOptions): this;
    unset(modelOrId: R | string, options?: any): R;
    modelId(attrs: {}): any;
    toggle(model: R, a_next?: boolean): boolean;
    getClassName(): string;
    readonly length: number;
    push(model: ElementsArg<R>, options?: CollectionOptions): any;
    pop(options?: CollectionOptions): R;
    unshift(model: ElementsArg<R>, options?: CollectionOptions): any;
    shift(options?: CollectionOptions): R;
}
import { ArrayMixin } from './arrayMethods';
export interface Collection<R extends Record> extends ArrayMixin<R> {
}
export declare type LiveUpdatesOption = boolean | ((x: any) => boolean);
export declare type ElementsArg<R = Record> = Partial<R> | Partial<R>[];
