import { ChainableAttributeSpec, Model, Nullable } from '../model';
import { CollectionReference } from './commons';
declare function theMemberOf<R extends new () => Model>(this: void, masterCollection: CollectionReference, T?: R): ChainableAttributeSpec<Nullable<R>>;
export { theMemberOf as memberOf };
declare module '../model' {
    namespace Model {
        const memberOf: <R extends new () => Model>(this: R, masterCollection: CollectionReference) => ChainableAttributeSpec<Nullable<R>>;
    }
}
