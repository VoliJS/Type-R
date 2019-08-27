var ArrayMixin = (function () {
    function ArrayMixin() {
    }
    ArrayMixin.prototype.map = function (mapFilter, context) {
        var models = this.models, length = models.length, res = Array(length), fun = context ? mapFilter.bind(context) : mapFilter;
        for (var i = 0, j = 0; i < length; i++) {
            var val = fun(models[i], i);
            val === void 0 || (res[j++] = val);
        }
        if (i !== j) {
            res.length = j;
        }
        return res;
    };
    ArrayMixin.prototype.each = function (fun, context) {
        var models = this.models, length = models.length, iteratee = context ? fun.bind(context) : fun;
        for (var i = 0; i < length; i++) {
            iteratee(models[i], i);
        }
    };
    ArrayMixin.prototype.firstMatch = function (doWhile, context) {
        var models = this.models, length = models.length, iteratee = context ? doWhile.bind(context) : doWhile;
        for (var i = 0; i < length; i++) {
            var res = iteratee(models[i], i);
            if (res !== void 0)
                return res;
        }
    };
    ArrayMixin.prototype.reduce = function (iteratee, init) {
        return init === void 0 ? this.models.reduce(iteratee) : this.models.reduce(iteratee, init);
    };
    ArrayMixin.prototype.slice = function (begin, end) {
        return this.models.slice(begin, end);
    };
    ArrayMixin.prototype.indexOf = function (modelOrId) {
        return this.models.indexOf(this.get(modelOrId));
    };
    ArrayMixin.prototype.includes = function (idOrObj) {
        return Boolean(this.get(idOrObj));
    };
    ArrayMixin.prototype.filter = function (iteratee, context) {
        var fun = toPredicateFunction(iteratee);
        return this.map(function (m) { return fun(m) ? m : void 0; }, context);
    };
    ArrayMixin.prototype.find = function (iteratee, context) {
        var fun = toPredicateFunction(iteratee);
        return this.firstMatch(function (m) { return fun(m) ? m : void 0; }, context);
    };
    ArrayMixin.prototype.some = function (iteratee, context) {
        return Boolean(this.find(iteratee, context));
    };
    ArrayMixin.prototype.forEach = function (iteratee, context) {
        this.each(iteratee, context);
    };
    ArrayMixin.prototype.values = function () {
        return this.models.values();
    };
    ArrayMixin.prototype.entries = function () {
        return this.models.entries();
    };
    ArrayMixin.prototype.every = function (iteratee, context) {
        var fun = toPredicateFunction(iteratee);
        return this.firstMatch(function (m) { return fun(m) ? void 0 : false; }, context) === void 0;
    };
    ArrayMixin.prototype.pluck = function (key) {
        return this.map(function (model) { return model[key]; });
    };
    ArrayMixin.prototype.first = function () { return this.models[0]; };
    ArrayMixin.prototype.last = function () { return this.models[this.models.length - 1]; };
    ArrayMixin.prototype.at = function (a_index) {
        var index = a_index < 0 ? a_index + this.models.length : a_index;
        return this.models[index];
    };
    return ArrayMixin;
}());
export { ArrayMixin };
var noOp = function (x) { return x; };
function toPredicateFunction(iteratee) {
    if (iteratee == null)
        return noOp;
    switch (typeof iteratee) {
        case 'function': return iteratee;
        case 'object':
            var keys_1 = Object.keys(iteratee);
            return function (x) {
                for (var _i = 0, keys_2 = keys_1; _i < keys_2.length; _i++) {
                    var key = keys_2[_i];
                    if (iteratee[key] !== x[key])
                        return false;
                }
                return true;
            };
        default: throw new Error('Invalid iteratee');
    }
}
//# sourceMappingURL=arrayMethods.js.map