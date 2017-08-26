import { Transactional, Transaction, TransactionOptions, Owner } from "../../transactions";
export interface AttributesContainer extends Transactional, Owner {
    getClassName(): string;
    Attributes: CloneAttributesCtor;
    _attributes: AttributesDescriptors;
    attributes: AttributesValues;
    _previousAttributes: AttributesValues;
    _changedAttributes: AttributesValues;
    forEachAttr(attrs: object, iteratee: (value: any, key?: string, spec?: AttributeUpdatePipeline) => void): void;
}
export declare type CloneAttributesCtor = new (x: AttributesValues) => AttributesValues;
export interface AttributesValues {
    [name: string]: any;
}
export interface AttributesDescriptors {
    [name: string]: AttributeUpdatePipeline;
}
export interface AttributeUpdatePipeline {
    canBeUpdated(prev: any, next: any, options: TransactionOptions): any;
    transform: Transform;
    isChanged(a: any, b: any): boolean;
    handleChange: ChangeHandler;
    propagateChanges: boolean;
}
export declare type Transform = (next: any, options: TransactionOptions, prev: any, record: AttributesContainer) => any;
export declare type ChangeHandler = (next: any, prev: any, record: AttributesContainer) => void;
export declare function setAttribute(record: AttributesContainer, name: string, value: any): void;
export declare const UpdateRecordMixin: {
    transaction(this: AttributesContainer, fun: (self: AttributesContainer) => void, options?: TransactionOptions): void;
    _onChildrenChange(child: Transactional, options: TransactionOptions): void;
    forceAttributeChange(key: string, options?: TransactionOptions): void;
    _createTransaction(this: AttributesContainer, a_values: {}, options?: TransactionOptions): Transaction;
};
