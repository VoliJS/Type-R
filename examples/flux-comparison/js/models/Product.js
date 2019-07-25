import { define, Record } from 'type-r'
import shop from '../../../common/api/shop'

@define
export default class Product extends Record {
    static attributes = {
        image     : String,
        title     : String,
        price     : Number,
        inventory : Number
    };

    static collection = {
        fetch(){
            shop.getProducts( products => this.reset( products, { parse : true } ) );
        }
    }
}
