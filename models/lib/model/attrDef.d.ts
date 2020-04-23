import { IOEndpoint } from '../io-tools';
import { EventsDefinition } from '@type-r/mixture';
import { AttributeOptions, AttributeToJSON, Parse } from './metatypes';
import { Linked } from '@linked/value';
export interface AttributeCheck {
    (value: any, key: string): boolean;
    error?: any;
}
export declare type Infer<A> = A extends ChainableAttributeSpec<infer F> ? TrueReturnType<F> : A extends Function ? TrueReturnType<A> : A | null;
declare type TrueReturnType<F extends Function> = F extends DateConstructor ? Date | null : F extends typeof Linked ? Linked<any> : F extends (...args: any[]) => infer R ? R | null : F extends new (...args: any[]) => infer R ? R | null : void;
export declare class ChainableAttributeSpec<F extends Function> {
    options: AttributeOptions & {
        type?: F;
    };
    constructor(options: AttributeOptions);
    check(check: AttributeCheck, error?: any): this;
    readonly as: PropertyDecorator;
    readonly isRequired: this;
    readonly required: this;
    endpoint(endpoint: IOEndpoint): this;
    watcher(ref: string | ((value: any, key: string) => void)): this;
    parse(fun: Parse): this;
    toJSON(fun: AttributeToJSON | false): this;
    readonly dontSave: this;
    readonly null: this;
    get(fun: any): this;
    set(fun: any): this;
    changeEvents(events: boolean): this;
    events(map: EventsDefinition): this;
    readonly has: this;
    metadata(options: object): this;
    value(x: any): this;
    static from(spec: any): ChainableAttributeSpec<any>;
}
export declare function type<F extends Function>(this: void, Type: ChainableAttributeSpec<F> | F, value?: any): ChainableAttributeSpec<F>;
export declare function shared<C extends Function>(this: void, Constructor: C): ChainableAttributeSpec<C>;
export { shared as refTo };
export declare function value<T>(this: void, x: T): ChainableAttributeSpec<new (...args: any[]) => T>;
