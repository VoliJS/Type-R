import { EventMap, EventsDefinition, EventSource } from './eventsource';
import { Mixable, MixableConstructor, MixinsState } from './mixins';
export { EventMap, EventsDefinition };
export interface MessengerDefinition {
    _localEvents?: EventMap;
    localEvents?: EventsDefinition;
    properties?: PropertyMap;
    [name: string]: any;
}
export interface PropertyMap {
    [name: string]: Property;
}
export declare type Property = PropertyDescriptor | (() => any);
export interface MessengersByCid {
    [cid: string]: Messenger;
}
export declare type EventCallbacks<Context> = {
    [events: string]: EventCallback<Context>;
};
export declare type EventCallback<Context> = (this: Context, ...args: any[]) => void;
export declare class Messenger implements Mixable, EventSource {
    static mixins: MixinsState;
    static onExtend: (BaseClass: Function) => void;
    static define: (definition?: MessengerDefinition, statics?: object) => MixableConstructor;
    static extend: (definition?: MessengerDefinition, statics?: object) => MixableConstructor;
    static onDefine({ localEvents, _localEvents, properties }: MessengerDefinition, BaseClass?: typeof Mixable): void;
    cid: string;
    protected _localEvents: EventMap;
    constructor();
    initialize(): void;
    on(events: string | EventCallbacks<this>, callback?: any, context?: any): this;
    once(events: string | EventCallbacks<this>, callback?: any, context?: any): this;
    off(events?: string | EventCallbacks<this>, callback?: any, context?: any): this;
    trigger(name: string, a?: any, b?: any, c?: any, d?: any, e?: any): this;
    listenTo(source: Messenger, a: string | EventCallbacks<this>, b?: Function): this;
    listenToOnce(source: Messenger, a: string | EventCallbacks<this>, b?: Function): this;
    stopListening(a_source?: Messenger, a?: string | EventCallbacks<this>, b?: Function): this;
    _disposed: boolean;
    dispose(): void;
}
export declare const Events: Messenger;
