import React, { define } from 'react-mvx'

import ProductsContainer from './ProductsContainer.jsx.js'
import CartContainer     from './CartContainer.jsx.js'

import Cart from '../models/Cart'
import Product from '../models/Product'

@define
export default class App extends React.Component {
    // Declare application's state
    // UI will be updated automatically on every state,
    // deep changes will be detected too.
    static state = {
        cart     : Cart,
        products : Product.Collection
    }

    componentWillMount(){
        // fetch data on application start...
        this.state.products.fetch();
    }

    render(){
        const { state } = this;
        return (
            <div>
                <ProductsContainer products={ state.products }
                                   addToCart={ product => state.cart.add( product ) }/>

                <CartContainer cart={ state.cart }/>
            </div>
        );
    }
}
