import { IOEndpoint, IONode, IOOptions, IOPromise, startIO } from '../io-tools';
import { TransactionOptions } from '../transactions';

export interface IOModel extends IONode {
    getEndpoint() : IOEndpoint
    save( options? : object ) : IOPromise<this>
    fetch( options? : object ) : IOPromise<this>
    destroy( options? : object ) : IOPromise<this>
    toJSON( options? : object ) : any
    parse( data : any, options? : object ) : any
    isNew() : boolean
    id : string | number
    set( json : object, options : TransactionOptions ) : this
}

export const IOModelMixin = {
    save( this : IOModel, options : IOOptions = {} ){
        const endpoint = this.getEndpoint(),
              json = this.toJSON({ ioMethod : 'save', ...options });

        return startIO(
            this,
            this.isNew() ?
                endpoint.create( json, options, this ) :
                endpoint.update( this.id, json, options, this ),
            options,

            update => {
                this.set( update, {
                    parse : true,
                    ioMethod : 'save',
                    ...options
                } );
            }
        );
    },

    fetch( options : IOOptions = {} ){
        return startIO(
            this,
            this.getEndpoint().read( this.id, options, this ),
            options,

            json => this.set( json, { parse : true, ioMethod : 'fetch', ...options } )
        );
    },

    destroy( options : IOOptions = {} ){  
        return startIO(
            this,
            this.getEndpoint().destroy( this.id, options, this ),
            options,

            () => {
                const { collection } = this;
                if( collection ){
                    collection.remove( this, options );
                }
                else{
                    this.dispose();
                }

                return this;
            }
        )
    }
}