import { LinkedModelHash } from './linked-attrs';
import { Infer } from './attrDef';
import { Model, ModelEntriesIterator, MakeModelConstructor } from './model';
import { GenericComparator } from '../collection';
import { EventMap } from '@type-r/mixture';
import { IOEndpoint } from '../io-tools';
export declare const collection: unique symbol;
export declare const metadata: unique symbol;
export interface AnonimousModelDefinition {
    [metadata]?: {
        idAttribute?: string;
        endpoint?: IOEndpoint;
    };
    [collection]?: {
        itemEvents?: {
            [event: string]: true | string | ((...args: any[]) => void);
        };
        comparator?: GenericComparator;
        initialize?(models?: any[], options?: object): void;
        parse?(json: any): object[];
        toJSON?(options?: any): any;
        validate?(): any;
    };
    [attribute: string]: any;
}
export declare function parseAnonimousModelDefinition({ [metadata]: md, [collection]: coll, ...attributes }: AnonimousModelDefinition): {
    idAttribute?: string;
    endpoint?: IOEndpoint;
    attributes: {
        [attribute: string]: any;
    };
    collection: {
        itemEvents?: {
            [event: string]: string | true | ((...args: any[]) => void);
        };
        comparator?: GenericComparator;
        initialize?(models?: any[], options?: object): void;
        parse?(json: any): object[];
        toJSON?(options?: any): any;
        validate?(): any;
    };
};
export declare type AnonymousAttributes<D> = AnonymousModelConstructor<Omit<D, typeof metadata | typeof collection>>;
export declare type AnonymousModelConstructor<A extends object> = MakeModelConstructor<ModelAttributes<A>, A>;
export declare type ModelAttributes<A extends object> = Model & InferAttrs<A> & {
    readonly $: LinkedModelHash<InferAttrs<A>>;
};
export declare type MergeModelConstructors<First extends typeof Model, Second extends typeof Model> = MakeModelConstructor<MergeModels<InstanceType<First>, InstanceType<Second>>, First['attributes'] & Second['attributes']>;
export declare type MergeModels<First extends Model, Second extends Model> = Model & Omit<First, "$"> & Omit<Second, "$"> & {
    readonly $: First['$'] & Second['$'];
    [Symbol.iterator](): ModelEntriesIterator;
    _localEvents: EventMap;
};
export declare type InferAttrs<A extends object> = {
    [K in keyof A]: Infer<A[K]>;
};
