export function defaults(dest, source) {
    for (var name in source) {
        if (source.hasOwnProperty(name) && !dest.hasOwnProperty(name)) {
            dest[name] = source[name];
        }
    }
    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            var other = arguments[i];
            other && defaults(dest, other);
        }
    }
    return dest;
}
export function isValidJSON(value) {
    if (value === null) {
        return true;
    }
    switch (typeof value) {
        case 'number':
        case 'string':
        case 'boolean':
            return true;
        case 'object':
            var proto = Object.getPrototypeOf(value);
            if (proto === Object.prototype || proto === Array.prototype) {
                return every(value, isValidJSON);
            }
    }
    return false;
}
export function getBaseClass(Class) {
    return Object.getPrototypeOf(Class.prototype).constructor;
}
export function assignToClassProto(Class, definition) {
    var names = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        names[_i - 2] = arguments[_i];
    }
    for (var _a = 0, names_1 = names; _a < names_1.length; _a++) {
        var name_1 = names_1[_a];
        var value = definition[name_1];
        value === void 0 || (Class.prototype[name_1] = value);
    }
}
export function isEmpty(obj) {
    if (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
    }
    return true;
}
function someArray(arr, fun) {
    var result;
    for (var i = 0; i < arr.length; i++) {
        if (result = fun(arr[i], i)) {
            return result;
        }
    }
}
function someObject(obj, fun) {
    var result;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (result = fun(obj[key], key)) {
                return result;
            }
        }
    }
}
export function some(obj, fun) {
    if (Object.getPrototypeOf(obj) === ArrayProto) {
        return someArray(obj, fun);
    }
    else {
        return someObject(obj, fun);
    }
}
export function every(obj, predicate) {
    return !some(obj, function (x) { return !predicate(x); });
}
export function getPropertyDescriptor(obj, prop) {
    var desc;
    for (var proto = obj; !desc && proto; proto = Object.getPrototypeOf(proto)) {
        desc = Object.getOwnPropertyDescriptor(proto, prop);
    }
    return desc;
}
export function omit(source) {
    var dest = {}, discard = {};
    for (var i = 1; i < arguments.length; i++) {
        discard[arguments[i]] = true;
    }
    for (var name in source) {
        if (!discard.hasOwnProperty(name) && source.hasOwnProperty(name)) {
            dest[name] = source[name];
        }
    }
    return dest;
}
export function transform(dest, source, fun) {
    for (var name in source) {
        if (source.hasOwnProperty(name)) {
            var value = fun(source[name], name);
            value === void 0 || (dest[name] = value);
        }
    }
    return dest;
}
export function fastAssign(dest, source) {
    for (var name in source) {
        dest[name] = source[name];
    }
    return dest;
}
export function fastDefaults(dest, source) {
    for (var name in source) {
        if (dest[name] === void 0) {
            dest[name] = source[name];
        }
    }
    return dest;
}
export function assign(dest, source) {
    for (var name in source) {
        if (source.hasOwnProperty(name)) {
            dest[name] = source[name];
        }
    }
    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            var other = arguments[i];
            other && assign(dest, other);
        }
    }
    return dest;
}
export function keys(o) {
    return o ? Object.keys(o) : [];
}
export function once(func) {
    var memo, first = true;
    return function () {
        if (first) {
            first = false;
            memo = func.apply(this, arguments);
            func = null;
        }
        return memo;
    };
}
var ArrayProto = Array.prototype, DateProto = Date.prototype, ObjectProto = Object.prototype;
export function notEqual(a, b) {
    if (a === b)
        return false;
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        var protoA = Object.getPrototypeOf(a);
        if (protoA !== Object.getPrototypeOf(b))
            return true;
        switch (protoA) {
            case DateProto: return +a !== +b;
            case ArrayProto: return arraysNotEqual(a, b);
            case ObjectProto:
            case null:
                return objectsNotEqual(a, b);
        }
    }
    return true;
}
function objectsNotEqual(a, b) {
    var keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length)
        return true;
    for (var i = 0; i < keysA.length; i++) {
        var key = keysA[i];
        if (!b.hasOwnProperty(key) || notEqual(a[key], b[key])) {
            return true;
        }
    }
    return false;
}
function arraysNotEqual(a, b) {
    if (a.length !== b.length)
        return true;
    for (var i = 0; i < a.length; i++) {
        if (notEqual(a[i], b[i]))
            return true;
    }
    return false;
}
var HashProto = Object.create(null);
HashProto.hasOwnProperty = ObjectProto.hasOwnProperty;
export function hashMap(obj) {
    var hash = Object.create(HashProto);
    return obj ? assign(hash, obj) : hash;
}
export function compare(a, b) {
    if (a == b)
        return 0;
    if (a == null)
        return -1;
    if (b == null)
        return 1;
    var av = a.valueOf(), bv = b.valueOf();
    return av < bv ? -1 :
        av > bv ? 1 :
            0;
}
export function groupBy(arr, attr, a_reducer, init) {
    var map = typeof attr === 'string' ?
        function (x) { return x[attr]; } :
        attr;
    return a_reducer ? (init ?
        mutableGroupBy(arr, map, a_reducer, init) :
        immutableGroupBy(arr, map, a_reducer)) :
        mutableGroupBy(arr, map, arrayGroup, arrayGroupInit);
}
var arrayGroup = function (acc, x) {
    acc.push(x);
};
var arrayGroupInit = function () { return []; };
function immutableGroupBy(arr, map, reducer) {
    var results = {};
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var model = arr_1[_i];
        var key = map(model);
        if (key != null) {
            results[key] = reducer(results[key], model, key);
        }
    }
    return results;
}
function mutableGroupBy(arr, map, reducer, init) {
    var results = {};
    for (var _i = 0, arr_2 = arr; _i < arr_2.length; _i++) {
        var model = arr_2[_i];
        var key = map(model);
        if (key != null) {
            var acc = results[key];
            if (acc === undefined) {
                acc = results[key] = init(key);
            }
            reducer(acc, model, key);
        }
    }
    return results;
}
//# sourceMappingURL=tools.js.map