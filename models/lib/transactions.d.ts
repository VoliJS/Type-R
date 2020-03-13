import { IOEndpoint, IONode, IOPromise } from './io-tools';
import { Logger, Messenger, MessengerDefinition, MixinsState } from '@type-r/mixture';
import { Traversable } from './traversable';
import { Validatable, ValidationError } from './validation';
import { Linked } from '@linked/value/lib';
export interface TransactionalDefinition extends MessengerDefinition {
    endpoint?: IOEndpoint;
}
export declare enum ItemsBehavior {
    share = 1,
    listen = 2,
    persistent = 4
}
export interface Transactional extends Messenger {
}
export declare abstract class Transactional implements Messenger, IONode, Validatable, Traversable {
    static endpoint: IOEndpoint;
    static mixins: MixinsState;
    static define: (definition?: TransactionalDefinition, statics?: object) => typeof Transactional;
    static extend: <T extends TransactionalDefinition>(definition?: T, statics?: object) => any;
    static onDefine(definitions: TransactionalDefinition, BaseClass: typeof Transactional): void;
    static onExtend(BaseClass: typeof Transactional): void;
    static create<M extends new (...args: any[]) => any>(this: M, a?: any, b?: any): InstanceType<M>;
    dispose(): void;
    cidPrefix: string;
    onChanges(handler: Function, target?: Messenger): void;
    offChanges(handler?: Function, target?: Messenger): void;
    listenToChanges(target: Transactional, handler: any): void;
    constructor(cid: string | number);
    abstract clone(options?: CloneOptions): this;
    transaction(fun: (self: this) => void, options?: TransactionOptions): void;
    assignFrom(a_source: Transactional | Object | Linked<Transactional>): this;
    static from<T extends new (a?: any, b?: any) => Transactional>(this: T, json: any, { strict, ...options }?: {
        strict?: boolean;
    } & TransactionOptions): InstanceType<T>;
    abstract set(values: any, options?: TransactionOptions): this;
    parse(data: any, options?: TransactionOptions): any;
    abstract toJSON(options?: object): {};
    abstract get(key: string): any;
    deepGet(reference: string): any;
    getOwner(): Owner;
    getStore(): Transactional;
    hasPendingIO(): IOPromise<this>;
    getEndpoint(): IOEndpoint;
    get validationError(): ValidationError;
    validate(obj?: Transactional): any;
    getValidationError(key?: string): any;
    deepValidationError(reference: string): any;
    eachValidationError(iteratee: (error: any, key: string, object: Transactional) => void): void;
    isValid(key?: string): boolean;
    valueOf(): Object;
    toString(): string;
    getClassName(): string;
}
export interface CloneOptions {
    pinStore?: boolean;
}
export interface Owner extends Traversable, Messenger {
    getOwner(): Owner;
    getStore(): Transactional;
}
export interface Transaction {
    object: Transactional;
    commit(initiator?: Transactional): any;
}
export interface TransactionOptions {
    parse?: boolean;
    logger?: Logger;
    silent?: boolean;
    merge?: boolean;
    remove?: boolean;
    reset?: boolean;
    unset?: boolean;
    validate?: boolean;
    ioMethod?: 'save' | 'fetch';
    upsert?: boolean;
}
export declare const transactionApi: {
    begin(object: Transactional): boolean;
    markAsDirty(object: Transactional, options: TransactionOptions): boolean;
    commit(object: Transactional, initiator?: Transactional): void;
    aquire(owner: Owner, child: Transactional, key?: string): void;
    free(owner: Owner, child: Transactional): void;
};
