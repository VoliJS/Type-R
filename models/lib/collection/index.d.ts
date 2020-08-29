import { Linked } from '@linked/value';
import { EventMap, EventsDefinition, TheType } from '@type-r/mixture';
import { IOPromise } from '../io-tools';
import { Model, shared, AnonymousModelConstructor } from '../model';
import { CloneOptions, Transactional, TransactionalDefinition, TransactionOptions } from '../transactions';
import { AddOptions } from './add';
import { ArrayMixin } from './arrayMethods';
import { CollectionCore } from './commons';
export declare type GenericComparator = string | ((x: Model) => number) | ((a: Model, b: Model) => number);
export interface CollectionOptions extends TransactionOptions {
    comparator?: GenericComparator;
    model?: typeof Model;
}
export interface CollectionDefinition extends TransactionalDefinition {
    model?: typeof Model;
    itemEvents?: EventsDefinition;
    _itemEvents?: EventMap;
}
export interface CollectionConstructor<R extends Model = Model> extends TheType<typeof Collection> {
    new (records?: ElementsArg<R>, options?: CollectionOptions): Collection<R>;
    prototype: Collection<R>;
    Refs: CollectionConstructor<R>;
}
declare type CollectionOf<M extends typeof Model> = M['Collection'] extends CollectionConstructor<InstanceType<M>> ? M['Collection'] : CollectionConstructor<InstanceType<M>>;
export declare class Collection<R extends Model = Model> extends Transactional implements CollectionCore, Iterable<R> {
    static of<M extends typeof Model>(Ctor: M): CollectionOf<M>;
    static of<M extends object>(spec: M): CollectionOf<AnonymousModelConstructor<M>>;
    static ofRefs<M extends typeof Model>(Ctor: M): CollectionOf<M>;
    static Subset: typeof Collection;
    static Refs: any;
    static refsTo: typeof shared;
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
    model: typeof Model;
    idAttribute: string;
    constructor(records?: ElementsArg<R>, options?: CollectionOptions, shared?: number);
    initialize(): void;
    clone(options?: CloneOptions): this;
    toJSON(options?: object): any;
    set(elements?: ElementsArg<R>, options?: TransactionOptions): this;
    liveUpdates(enabled: LiveUpdatesOption): IOPromise<this>;
    fetch(a_options?: {
        liveUpdates?: LiveUpdatesOption;
    } & TransactionOptions & {
        [key: string]: any;
    }): IOPromise<this>;
    dispose(): void;
    reset(a_elements?: ElementsArg<R>, options?: TransactionOptions): R[];
    add(a_elements: ElementsArg<R>, options?: AddOptions): any;
    remove(recordsOrIds: any, options?: CollectionOptions): R[] | R;
    $includes(idOrObj: R): Linked<boolean>;
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
export interface Collection<R extends Model> extends ArrayMixin<R> {
}
export declare type LiveUpdatesOption = boolean | ((x: any) => boolean);
export declare type ElementsArg<R = Model> = Partial<R> | Partial<R>[];
export {};
