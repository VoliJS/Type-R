export * from './any';
export * from './owned';
export * from './date';
export * from './basic';
export * from './shared';
export * from './updates';
export * from './attrDef';
import { AnyType } from './any';
export declare function createSharedTypeSpec(Constructor: Function, Attribute: typeof AnyType): void;
export declare function createAttribute(spec: any, name: string): AnyType;
import { ChainableAttributeSpec } from './attrDef';
declare global  {
    interface DateConstructor {
        microsoft: ChainableAttributeSpec;
        timestamp: ChainableAttributeSpec;
    }
}
declare global  {
    interface NumberConstructor {
        integer: Function;
    }
    interface Window {
        Integer: Function;
    }
}
