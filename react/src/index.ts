import { useEffect } from 'react'
import { Messenger } from '@type-r/models'

export * from './state'
export * from './globalState'
export * from '@linked/react'
export * from './pureRender'

/**
 * Listen to event sent my Messenger.trigger( event, a1, a2, ... )
 * @param source
 * @param event 
 * @param handler
 */
export function useEvent( source : Messenger, event : string, handler : Function ){
    useEffect( () => {
        source.on( event, handler );

        return () => {
            source.off( event, handler );
        }
    }, [] );
}