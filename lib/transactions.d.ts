import { IOEndpoint, IONode, IOPromise } from './io-tools';
import { EventCallbacks, eventsApi, Logger, LogLevel, Messenger, MessengerDefinition, MessengersByCid, MixinsState } from './object-plus';
import { Traversable } from './traversable';
import { ChildrenErrors, Validatable, ValidationError } from './validation';
export interface TransactionalDefinition extends MessengerDefinition {
    endpoint?: IOEndpoint;
}
export declare enum ItemsBehavior {
    share = 1,
    listen = 2,
    persistent = 4
}
export declare abstract class Transactional implements Messenger, IONode, Validatable, Traversable {
    static endpoint: IOEndpoint;
    static __super__: object;
    static mixins: MixinsState;
    static define: (definition?: TransactionalDefinition, statics?: object) => typeof Transactional;
    static extend: <T extends TransactionalDefinition>(definition?: T, statics?: object) => any;
    static onDefine(definitions: TransactionalDefinition, BaseClass: typeof Transactional): void;
    static onExtend(BaseClass: typeof Transactional): void;
    static create(a: any, b?: any): Transactional;
    on: (events: string | EventCallbacks<this>, callback?: any, context?: any) => this;
    once: (events: string | EventCallbacks<this>, callback?: any, context?: any) => this;
    off: (events?: string | EventCallbacks<this>, callback?: any, context?: any) => this;
    trigger: (name: string, a?: any, b?: any, c?: any, d?: any, e?: any) => this;
    stopListening: (source?: Messenger, a?: string | EventCallbacks<this>, b?: Function) => this;
    listenTo: (source: Messenger, a: string | EventCallbacks<this>, b?: Function) => this;
    listenToOnce: (source: Messenger, a: string | EventCallbacks<this>, b?: Function) => this;
    _disposed: boolean;
    readonly __inner_state__: any;
    _shared?: number;
    dispose(): void;
    initialize(): void;
    _events: eventsApi.HandlersByEvent;
    _listeningTo: MessengersByCid;
    _localEvents: eventsApi.EventMap;
    cid: string;
    cidPrefix: string;
    _changeToken: {};
    _transaction: boolean;
    _isDirty: TransactionOptions;
    _owner: Owner;
    _ownerKey: string;
    _changeEventName: string;
    onChanges(handler: Function, target?: Messenger): void;
    offChanges(handler?: Function, target?: Messenger): void;
    listenToChanges(target: Transactional, handler: any): void;
    constructor(cid: string | number);
    abstract clone(options?: CloneOptions): this;
    transaction(fun: (self: this) => void, options?: TransactionOptions): void;
    assignFrom(source: Transactional | Object): this;
    static from<T extends new (a?: any, b?: any) => Transactional>(this: T, json: any, { strict, ...options }?: {
        strict?: boolean;
    } & TransactionOptions): InstanceType<T>;
    abstract _createTransaction(values: any, options?: TransactionOptions): Transaction | void;
    abstract set(values: any, options?: TransactionOptions): this;
    parse(data: any, options?: TransactionOptions): any;
    abstract toJSON(options?: object): {};
    abstract get(key: string): any;
    deepGet(reference: string): any;
    getOwner(): Owner;
    _defaultStore: Transactional;
    getStore(): Transactional;
    _endpoint: IOEndpoint;
    _ioPromise: IOPromise<this>;
    hasPendingIO(): IOPromise<this>;
    fetch(options?: object): IOPromise<this>;
    getEndpoint(): IOEndpoint;
    _validationError: ValidationError;
    readonly validationError: ValidationError;
    abstract _validateNested(errors: ChildrenErrors): number;
    validate(obj?: Transactional): any;
    getValidationError(key?: string): any;
    deepValidationError(reference: string): any;
    eachValidationError(iteratee: (error: any, key: string, object: Transactional) => void): void;
    isValid(key?: string): boolean;
    valueOf(): Object;
    toString(): string;
    getClassName(): string;
    abstract _log(level: LogLevel, topic: string, text: string, value: any, logger?: Logger): void;
}
export interface CloneOptions {
    pinStore?: boolean;
}
export interface Owner extends Traversable, Messenger {
    _onChildrenChange(child: Transactional, options: TransactionOptions): void;
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
    ioUpdate?: boolean;
    upsert?: boolean;
}
export declare const transactionApi: {
    begin(object: Transactional): boolean;
    markAsDirty(object: Transactional, options: TransactionOptions): boolean;
    commit(object: Transactional, initiator?: Transactional): void;
    aquire(owner: Owner, child: Transactional, key?: string): void;
    free(owner: Owner, child: Transactional): void;
};
