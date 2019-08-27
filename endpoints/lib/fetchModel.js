import * as tslib_1 from "tslib";
import { define, log, isProduction } from '@type-r/models';
import { RestfulEndpoint } from './restful';
export function fetchModelIO(method, url, options) {
    return new ModelFetchEndpoint(method, url, options);
}
function notSupported(method) {
    throw new ReferenceError("Method " + method + " is not supported. modelFetchIO supports only model.fetch().");
}
var ModelFetchEndpoint = (function (_super) {
    tslib_1.__extends(ModelFetchEndpoint, _super);
    function ModelFetchEndpoint(method, constructUrl, _a) {
        if (_a === void 0) { _a = {}; }
        var mockData = _a.mockData, options = tslib_1.__rest(_a, ["mockData"]);
        var _this = _super.call(this, '', mockData ? tslib_1.__assign({ mockData: [mockData] }, options) : options) || this;
        _this.method = method;
        _this.constructUrl = constructUrl;
        return _this;
    }
    ModelFetchEndpoint.prototype.list = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            notSupported('collection.fetch()');
            return [2];
        }); });
    };
    ModelFetchEndpoint.prototype.destroy = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            notSupported('model.destroy()');
            return [2];
        }); });
    };
    ModelFetchEndpoint.prototype.create = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            notSupported('model.save()');
            return [2];
        }); });
    };
    ModelFetchEndpoint.prototype.update = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            notSupported('model.save()');
            return [2];
        }); });
    };
    ModelFetchEndpoint.prototype.read = function (id, options, model) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.url = this.constructUrl(options.params, model);
                        if (!this.memoryIO) return [3, 2];
                        log(isProduction ? "error" : "info", 'Type-R:SimulatedIO', "GET " + this.url);
                        return [4, this.memoryIO.list(options)];
                    case 1: return [2, (_a.sent())[0]];
                    case 2: return [2, this.request(this.method, this.getRootUrl(model), options)];
                }
            });
        });
    };
    ModelFetchEndpoint = tslib_1.__decorate([
        define
    ], ModelFetchEndpoint);
    return ModelFetchEndpoint;
}(RestfulEndpoint));
//# sourceMappingURL=fetchModel.js.map