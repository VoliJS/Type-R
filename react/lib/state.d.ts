import { Model, Collection } from '@type-r/models';
export declare const useModel: <M extends typeof Model>(Ctor: M) => InstanceType<M>;
export interface CollectionHooks {
    of<M extends typeof Model>(Ctor: M): Collection<InstanceType<M>>;
    ofRefs<M extends typeof Model>(Ctor: M): Collection<InstanceType<M>>;
    subsetOf<C extends Collection>(collection: C): C;
}
export declare const useCollection: CollectionHooks;
