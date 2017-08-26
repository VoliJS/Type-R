import { AnyType } from './any';
import { AttributesContainer } from './updates';
import { Transactional, TransactionOptions } from '../../transactions';
export declare class SharedType extends AnyType {
    type: typeof Transactional;
    clone(value: Transactional, record: AttributesContainer): Transactional;
    toJSON(): void;
    canBeUpdated(prev: Transactional, next: any, options: TransactionOptions): any;
    convert(value: any, options: TransactionOptions, prev: any, record: AttributesContainer): Transactional;
    validate(model: any, value: any, name: any): void;
    create(): Transactional;
    _handleChange(next: Transactional, prev: Transactional, record: AttributesContainer): void;
    dispose(record: AttributesContainer, value: Transactional): void;
    _onChange: (child: Transactional, options: TransactionOptions, initiator: Transactional) => void;
    initialize(options: any): void;
}
