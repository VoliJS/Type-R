import {NumericType} from '@type-r/models';

export function Integer( x ) {
    return x ? Math.round( x ) : 0;
}

(Integer as any)._metatype = NumericType;
