import { AnyType } from './any';
import { Transactional, TransactionOptions } from '../../transactions';
import { AttributesContainer } from './updates';
import { ValidationError } from '../../validation';
export declare class AggregatedType extends AnyType {
    type: typeof Transactional;
    clone(value: Transactional): Transactional;
    toJSON(x: any): any;
    canBeUpdated(prev: Transactional, next: any, options: TransactionOptions): any;
    convert(value: any, options: TransactionOptions, prev: any, record: AttributesContainer): Transactional;
    dispose(record: AttributesContainer, value: Transactional): void;
    validate(record: AttributesContainer, value: Transactional): ValidationError;
    create(): Transactional;
    initialize(options: any): void;
    _handleChange(next: Transactional, prev: Transactional, record: AttributesContainer): void;
}
