import { Collection, CollectionConstructor, ElementsArg, CollectionOptions } from '../collection';
import { ChainableAttributeSpec, Model } from '../model';
import { CollectionReference } from './commons';
export declare function subsetOf<X extends CollectionConstructor<R>, R extends Model>(this: void, masterCollection: CollectionReference, T?: X): ChainableAttributeSpec<SubsetCollectionConstructor<R>>;
declare type subsetOfType = typeof subsetOf;
declare module "../collection" {
    namespace Collection {
        const subsetOf: subsetOfType;
    }
}
export interface SubsetCollection<M extends Model> extends Collection<M> {
    getModelIds(): string[];
    addAll(): M[];
    toggleAll(): M[];
    resolve(baseCollection: Collection<M>): this;
}
export interface SubsetCollectionConstructor<R extends Model = Model> {
    new (records?: ElementsArg<R> | string[], options?: CollectionOptions): SubsetCollection<R>;
    prototype: SubsetCollection<R>;
}
export {};
