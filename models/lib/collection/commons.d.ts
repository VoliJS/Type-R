import { Model } from '../model';
import { Owner, Transaction, Transactional, TransactionOptions } from '../transactions';
export interface CollectionCore extends Transactional, Owner {
    models: Model[];
    model: typeof Model;
    idAttribute: string;
    get(objOrId: string | Model | Object): Model;
}
export declare type Elements = (Object | Model)[];
export interface CollectionOptions extends TransactionOptions {
    sort?: boolean;
}
export declare type Comparator = (a: Model, b: Model) => number;
export declare function dispose(collection: CollectionCore): Model[];
export declare function convertAndAquire(collection: CollectionCore, attrs: {} | Model, options: CollectionOptions): Model;
export declare function free(owner: CollectionCore, child: Model, unset?: boolean): void;
export declare function freeAll(collection: CollectionCore, children: Model[]): Model[];
export declare function sortElements(collection: CollectionCore, options: CollectionOptions): boolean;
export interface IdIndex {
    [id: string]: Model;
}
export declare function addIndex(index: IdIndex, model: Model): void;
export declare function removeIndex(index: IdIndex, model: Model): void;
export declare function updateIndex(index: IdIndex, model: Model): void;
export declare class CollectionTransaction implements Transaction {
    object: CollectionCore;
    isRoot: boolean;
    added: Model[];
    removed: Model[];
    nested: Transaction[];
    sorted: boolean;
    constructor(object: CollectionCore, isRoot: boolean, added: Model[], removed: Model[], nested: Transaction[], sorted: boolean);
    commit(initiator?: Transactional): void;
}
export declare function logAggregationError(collection: CollectionCore, options: TransactionOptions): void;
