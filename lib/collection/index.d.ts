import { EventMap, EventsDefinition } from '../object-plus';
import { Transactional, CloneOptions, TransactionOptions, TransactionalDefinition } from '../transactions';
import { Record, AggregatedType } from '../record';
import { IdIndex, CollectionCore, CollectionTransaction } from './commons';
import { AddOptions } from './add';
export declare type GenericComparator = string | ((x: Record) => number) | ((a: Record, b: Record) => number);
export interface CollectionOptions extends TransactionOptions {
    comparator?: GenericComparator;
    model?: typeof Record;
}
export declare type Predicate = (val: Record, key: number) => boolean | object;
export interface CollectionDefinition extends TransactionalDefinition {
    model?: typeof Record;
    itemEvents?: EventsDefinition;
    _itemEvents?: EventMap;
}
export declare class Collection extends Transactional implements CollectionCore {
    _shared: number;
    _aggregationError: Record[];
    static Subset: typeof Collection;
    static Refs: typeof Collection;
    static _SubsetOf: typeof Collection;
    createSubset(models: any, options: any): any;
    static onExtend(BaseClass: typeof Transactional): void;
    static onDefine(definition: CollectionDefinition, BaseClass: any): void;
    static subsetOf: (collectionReference: any) => any;
    _itemEvents: EventMap;
    models: Record[];
    readonly __inner_state__: Record[];
    _byId: IdIndex;
    comparator: GenericComparator;
    getStore(): Transactional;
    _store: Transactional;
    _comparator: (a: Record, b: Record) => number;
    _onChildrenChange(record: Record, options?: TransactionOptions, initiator?: Transactional): void;
    get(objOrId: string | Record | Object): Record;
    each(iteratee: (val: Record, key: number) => void, context?: any): void;
    every(iteratee: Predicate, context?: any): boolean;
    filter(iteratee: Predicate, context?: any): Record[];
    some(iteratee: Predicate, context?: any): boolean;
    map<T>(iteratee: (val: Record, key: number) => T, context?: any): T[];
    _validateNested(errors: {}): number;
    model: typeof Record;
    idAttribute: string;
    constructor(records?: (Record | {})[], options?: CollectionOptions, shared?: number);
    initialize(): void;
    readonly length: number;
    first(): Record;
    last(): Record;
    at(a_index: number): Record;
    clone(options?: CloneOptions): this;
    toJSON(): Object[];
    set(elements?: ElementsArg, options?: TransactionOptions): this;
    dispose(): void;
    reset(a_elements?: ElementsArg, options?: TransactionOptions): Record[];
    add(a_elements: ElementsArg, options?: AddOptions): Record[];
    remove(recordsOrIds: any, options?: TransactionOptions): Record[] | Record;
    _createTransaction(a_elements: ElementsArg, options?: TransactionOptions): CollectionTransaction;
    static _attribute: typeof AggregatedType;
    pluck(key: string): any[];
    sort(options?: TransactionOptions): this;
    push(model: any, options: any): Record[];
    pop(options: any): Record;
    unshift(model: any, options: any): Record[];
    shift(options?: CollectionOptions): Record;
    slice(): Record[];
    indexOf(modelOrId: any): number;
    modelId(attrs: {}): any;
    toggle(model: Record, a_next?: boolean): boolean;
    _log(level: string, text: string, value: any): void;
    getClassName(): string;
}
export declare type ElementsArg = Object | Record | Object[] | Record[];
