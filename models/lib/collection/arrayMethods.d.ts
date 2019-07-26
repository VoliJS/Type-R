import { Model } from '../model';
export declare type Predicate<R> = ((val: R, key?: number) => boolean) | Partial<R>;
export declare abstract class ArrayMixin<R extends Model> {
    models: R[];
    abstract get(modelOrId: string | Partial<R>): R;
    map<T>(mapFilter: (val: R, key?: number) => T, context?: any): T[];
    each<T>(fun: (val: R, key?: number) => any, context?: any): void;
    firstMatch<T>(doWhile: (val: R, key?: number) => T): T;
    firstMatch<T, C>(doWhile: (this: C, val: R, key?: number) => T, context: C): T;
    reduce<T>(iteratee: (previousValue: R, currentValue: R, currentIndex?: number) => R): R;
    reduce<T>(iteratee: (previousValue: T, currentValue: R, currentIndex?: number) => T, init?: any): T;
    slice(begin?: number, end?: number): R[];
    indexOf(modelOrId: string | Partial<R>): number;
    includes(idOrObj: string | Partial<R>): boolean;
    filter(iteratee: Predicate<R>, context?: any): R[];
    find(iteratee: Predicate<R>, context?: any): R;
    some(iteratee: Predicate<R>, context?: any): boolean;
    forEach(iteratee: (val: R, key?: number) => void, context?: any): void;
    values(): IterableIterator<R>;
    entries(): IterableIterator<[number, R]>;
    every(iteratee: Predicate<R>, context?: any): boolean;
    pluck<K extends keyof R>(key: K): R[K][];
    first(): R;
    last(): R;
    at(a_index: number): R;
}
