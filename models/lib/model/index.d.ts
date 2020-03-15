import { InferAttrs, Model, ModelConstructor } from './model';
import { LinkedModelHash } from './linked-attrs';
export * from './attrDef';
export * from './metatypes';
export { AttributesMixin, LinkedAttributes, InferAttrs, ModelConstructor } from './model';
export { Model };
export declare function attributes<D extends object>(attrDefs: D): ModelConstructor<InferAttrs<D> & {
    $: LinkedModelHash<InferAttrs<D>>;
}>;
export declare function auto(value: any): PropertyDecorator;
export declare function auto(proto: object, attrName: string): void;
