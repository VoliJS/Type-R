import { ChainableAttributeSpec, Model } from '../model';
import { CollectionReference } from './commons';
declare function theMemberOf<R extends typeof Model>(this: void, masterCollection: CollectionReference, T?: R): ChainableAttributeSpec<R>;
export { theMemberOf as memberOf };
declare module '../model' {
    namespace Model {
        const memberOf: <R extends typeof Model>(this: R, masterCollection: CollectionReference) => ChainableAttributeSpec<R>;
    }
}
