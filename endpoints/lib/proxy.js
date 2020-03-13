import { __awaiter, __generator } from "tslib";
var parseOptions = { parse: true, strict: true };
export function proxyIO(record, options) {
    if (options === void 0) { options = {}; }
    return new ProxyEndpoint(record, options);
}
var ProxyEndpoint = (function () {
    function ProxyEndpoint(record, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.options = {};
        this.Record = record;
        if (options.createAttrs) {
            this.options.createAttrs = options.createAttrs.split(/\s+/);
        }
        if (options.updateAttrs) {
            this.options.updateAttrs = options.updateAttrs.split(/\s+/);
        }
        var source = Object.getPrototypeOf(this.endpoint);
        Object.keys(source).forEach(function (key) {
            if (!_this[key] && typeof source[key] === 'function') {
                _this[key] = function () {
                    return source[key].apply(this.endpoint, arguments);
                };
            }
        });
    }
    Object.defineProperty(ProxyEndpoint.prototype, "endpoint", {
        get: function () {
            return this.Record.prototype._endpoint;
        },
        enumerable: true,
        configurable: true
    });
    ProxyEndpoint.prototype.subscribe = function (events, target) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.endpoint.subscribe(events, target)];
            });
        });
    };
    ProxyEndpoint.prototype.unsubscribe = function (events, target) {
        this.endpoint.unsubscribe(events, target);
    };
    ProxyEndpoint.prototype.list = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var coll;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        coll = new this.Record.Collection();
                        return [4, coll.fetch(options)];
                    case 1:
                        _a.sent();
                        return [2, coll.toJSON()];
                }
            });
        });
    };
    ProxyEndpoint.prototype.update = function (id, json, options) {
        return __awaiter(this, void 0, void 0, function () {
            var doc, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        json.id = id;
                        doc = this.Record.from(json, parseOptions);
                        return [4, doc.save(options)];
                    case 1:
                        _a.sent();
                        res = { _cas: doc._cas };
                        fillAttrs(res, doc, this.options.updateAttrs);
                        return [2, res];
                }
            });
        });
    };
    ProxyEndpoint.prototype.create = function (json, options) {
        return __awaiter(this, void 0, void 0, function () {
            var doc, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doc = this.Record.from(json, parseOptions);
                        return [4, doc.save(options)];
                    case 1:
                        _a.sent();
                        res = { id: doc.id, _cas: doc._cas, _type: doc._type };
                        fillAttrs(res, doc, this.options.createAttrs);
                        return [2, res];
                }
            });
        });
    };
    ProxyEndpoint.prototype.read = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doc = new this.Record({ id: id });
                        return [4, doc.fetch(options)];
                    case 1:
                        _a.sent();
                        return [2, doc.toJSON()];
                }
            });
        });
    };
    ProxyEndpoint.prototype.destroy = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.endpoint.destroy(id, options)];
            });
        });
    };
    return ProxyEndpoint;
}());
export { ProxyEndpoint };
function fillAttrs(res, doc, attrs) {
    if (attrs) {
        var json = doc.toJSON();
        for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
            var key = attrs_1[_i];
            res[key] = json[key];
        }
    }
}
//# sourceMappingURL=proxy.js.map