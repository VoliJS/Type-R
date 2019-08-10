import { InferAttrs, Record, RecordConstructor } from './record';
export * from './attrDef';
export * from './metatypes';
export { AttributesMixin, InferAttrs, RecordConstructor } from './record';
export { Record };
export declare function attributes<D extends object>(attrDefs: D): RecordConstructor<InferAttrs<D>>;
export declare function auto(value: any): PropertyDecorator;
export declare function auto(proto: object, attrName: string): void;
