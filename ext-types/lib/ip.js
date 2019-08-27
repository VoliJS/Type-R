import { type } from '@type-r/models';
var ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
export function isIPAddress(x) {
    return !x || ipPattern.test(x);
}
isIPAddress.error = 'Not valid IP address';
export var IPAddress = type(String).check(isIPAddress);
//# sourceMappingURL=ip.js.map