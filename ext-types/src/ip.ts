import { AttributeCheck, type } from '@type-r/models';

const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

export function isIPAddress( x : string ) {
    return !x || ipPattern.test( x );
}

(isIPAddress as AttributeCheck).error = 'Not valid IP address'

export const IPAddress = type( String ).check( isIPAddress );