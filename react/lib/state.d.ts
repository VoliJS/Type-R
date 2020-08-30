import { Model, Collection, SubsetCollection } from '@type-r/models';
export declare const useModel: {
    <M extends Model>(Ctor: new (...args: any[]) => M): M;
    copy: typeof useModelCopy;
    delayChanges: typeof useDelayChanges;
};
export declare function useModelCopy<M extends Model>(model: M): M;
export declare function useDelayChanges<M extends Model>(model: M, delay?: number): M;
export interface CollectionHooks {
    of<M extends Model>(Ctor: new () => M): Collection<M>;
    ofRefs<M extends Model>(Ctor: new () => M): Collection<M>;
    subsetOf<T extends Model>(init: Collection<T>): SubsetCollection<T>;
}
export declare const useCollection: CollectionHooks;
