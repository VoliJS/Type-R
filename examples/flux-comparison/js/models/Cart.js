import { define, Collection } from 'type-r'
import Product from './Product'
import shop from '../../../common/api/shop'

@define
export default class Cart extends Collection {
    // Cart is a collection of products...
    model : Product,

    // ... which you can checkout.
    checkout(){
        shop.buyProducts( this.toJSON(), () => this.reset() );
    }
}