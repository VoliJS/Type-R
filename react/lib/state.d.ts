import { Model, Collection, InferAttrs } from '@type-r/models';
import { LinkedModelHash } from '@type-r/models/lib/model/linked-attrs';
export declare const useModel: <M extends typeof Model>(Ctor: M) => InstanceType<M>;
export declare const useAttributes: <D extends object>(attrDef: D) => Model & InferAttrs<D> & LinkedModelHash<InferAttrs<D>>;
export interface CollectionHooks {
    of<M extends typeof Model>(Ctor: M): Collection<InstanceType<M>>;
    ofRefs<M extends typeof Model>(Ctor: M): Collection<InstanceType<M>>;
    subsetOf<C extends Collection>(collection: C): C;
}
export declare const useCollection: CollectionHooks;
