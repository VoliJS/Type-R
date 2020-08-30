import { GenericComparator } from '../collection';
import { IOEndpoint } from '../io-tools';
import { Infer } from './attrDef';
import { LinkedModelHash } from './linked-attrs';
import { MakeModelConstructor, Model } from './model';
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
export declare type AnonymousAttributes<D extends object> = AnonymousModelConstructor<D>;
export declare type AnonymousModelConstructor<A extends object> = MakeModelConstructor<Model & ModelAttributes<A>, A>;
export declare type ModelAttributes<A extends object> = InferAttrs<A> & {
    readonly $: LinkedModelHash<InferAttrs<A>>;
};
export declare type MergeModelConstructors<First extends typeof Model, Second extends typeof Model> = MakeModelConstructor<InstanceType<First> & InstanceType<Second>, First['attributes'] & Second['attributes']>;
export declare type InferAttrs<A extends object> = {
    [K in Exclude<keyof A, typeof metadata | typeof collection>]: Infer<A[K]>;
};
