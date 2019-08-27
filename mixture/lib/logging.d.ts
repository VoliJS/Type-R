import { Messenger } from './events';
export declare type LogLevel = 'error' | 'warn' | 'debug' | 'info' | 'log';
export declare type LoggerEventHandler = (topic: string, msg: string, props: object) => void;
export declare const isProduction: boolean, logEvents: LogLevel[];
export declare class Logger extends Messenger {
    counter: {
        [level in LogLevel]?: number;
    };
    logToConsole(level: LogLevel, filter?: RegExp): this;
    throwOn(level: LogLevel, filter?: RegExp): this;
    count(level: LogLevel, filter?: RegExp): this;
    trigger: (level: LogLevel, topic: string, message: string, props?: object) => this;
    off: (event?: LogLevel) => this;
    on(handlers: {
        [name in LogLevel]: LoggerEventHandler;
    }): this;
    on(handlers: LogLevel, handler: LoggerEventHandler): this;
    on(handlers: 'all', handler: (level: LogLevel, topic: string, msg: string, props: object) => void): this;
}
export declare const logger: Logger;
export declare const throwingLogger: Logger;
export declare const log: typeof logger.trigger;
