import { attributes, ModelConstructor, Store } from '@type-r/models';
import { FunctionComponent } from "react";
import { useStore, StoreContext } from './globalState'
import { useModel } from './state'

export function withStore<S extends Store>( type : new ( attrs? : object ) => S ) :
    <P extends object>( render : ( store : S, props? : P ) => JSX.Element ) => FunctionComponent<P>;
export function withStore<S extends object>( attrs : S ) :
    <P extends object>( render : ( store : InstanceType<ModelConstructor<S>>, props? : P ) => JSX.Element ) => FunctionComponent<P>;
export function withStore( type ) : any {
    const Ctor : typeof Store = typeof type === 'function' ? type as any : attributes( Store, type );
    
    return (
        render => props => {
            const store = useModel( Ctor ),
                upperStore = useStore();

            if( upperStore && !store.hasOwnProperty( '_defaultStore' )){
                ( store as any )._defaultStore = upperStore;
            }

            return (
                <StoreContext.Provider value={store}>
                    { render( store, props ) }
                </StoreContext.Provider>
            )
        }
    )
}