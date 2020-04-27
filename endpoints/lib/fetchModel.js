import { __assign, __awaiter, __decorate, __extends, __generator, __rest } from "tslib";
import { define, isProduction, log } from '@type-r/models';
import { RestfulEndpoint } from './restful';
export function fetchModelIO(method, url, options) {
    return new ModelFetchEndpoint(method, url, options);
}
function notSupported(method) {
    throw new ReferenceError("Method " + method + " is not supported. modelFetchIO supports only model.fetch().");
}
var ModelFetchEndpoint = (function (_super) {
    __extends(ModelFetchEndpoint, _super);
    function ModelFetchEndpoint(method, url, _a) {
        if (_a === void 0) { _a = {}; }
        var mockData = _a.mockData, options = __rest(_a, ["mockData"]);
        var _this = _super.call(this, '', mockData ? __assign({ mockData: [mockData] }, options) : options) || this;
        _this.method = method;
        _this.url = url;
        return _this;
    }
    ModelFetchEndpoint.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            notSupported('collection.fetch()');
            return [2];
        }); });
    };
    ModelFetchEndpoint.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            notSupported('model.destroy()');
            return [2];
        }); });
    };
    ModelFetchEndpoint.prototype.create = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            notSupported('model.save()');
            return [2];
        }); });
    };
    ModelFetchEndpoint.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            notSupported('model.save()');
            return [2];
        }); });
    };
    ModelFetchEndpoint.prototype.read = function (id, options, model) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.collectionUrl(model, options);
                        if (!this.memoryIO) return [3, 2];
                        log(isProduction ? "error" : "info", 'Type-R:SimulatedIO', "GET " + url);
                        return [4, this.memoryIO.list(options)];
                    case 1: return [2, (_a.sent())[0]];
                    case 2: return [2, this.request(this.method, url, options)];
                }
            });
        });
    };
    ModelFetchEndpoint = __decorate([
        define
    ], ModelFetchEndpoint);
    return ModelFetchEndpoint;
}(RestfulEndpoint));
//# sourceMappingURL=fetchModel.js.map