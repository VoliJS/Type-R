import { __assign, __awaiter, __generator, __rest } from "tslib";
import { Model, log, isProduction } from '@type-r/models';
import { memoryIO } from './memory';
export function create(url, fetchOptions) {
    return new RestfulEndpoint(url, fetchOptions);
}
export { create as restfulIO };
var RestfulEndpoint = (function () {
    function RestfulEndpoint(url, _a) {
        if (_a === void 0) { _a = {}; }
        var mockData = _a.mockData, _b = _a.simulateDelay, simulateDelay = _b === void 0 ? 1000 : _b, fetchOptions = __rest(_a, ["mockData", "simulateDelay"]);
        this.url = url;
        this.fetchOptions = fetchOptions;
        this.memoryIO = mockData && !isProduction ? memoryIO(mockData, simulateDelay) : null;
        if (mockData && isProduction) {
            log('error', 'Type-R:RestfulIO', "Mock data is used in production for " + url);
        }
    }
    RestfulEndpoint.prototype.create = function (json, options, model) {
        var url = this.collectionUrl(model, options);
        return this.memoryIO ?
            this.simulateIO('create', 'POST', url, arguments) :
            this.request('POST', url, options, json);
    };
    RestfulEndpoint.prototype.update = function (id, json, options, model) {
        var url = this.objectUrl(model, id, options);
        return this.memoryIO ?
            this.simulateIO('update', 'PUT', url, arguments) :
            this.request('PUT', url, options, json);
    };
    RestfulEndpoint.prototype.read = function (id, options, model) {
        var url = this.objectUrl(model, id, options);
        return this.memoryIO ?
            this.simulateIO('read', 'GET', url, arguments) :
            this.request('GET', url, options);
    };
    RestfulEndpoint.prototype.destroy = function (id, options, model) {
        var url = this.objectUrl(model, id, options);
        return this.memoryIO ?
            this.simulateIO('destroy', 'DELETE', url, arguments) :
            this.request('DELETE', url, options);
    };
    RestfulEndpoint.prototype.list = function (options, collection) {
        var url = this.collectionUrl(collection, options);
        return this.memoryIO ?
            this.simulateIO('list', 'GET', url, arguments) :
            this.request('GET', url, options);
    };
    RestfulEndpoint.prototype.subscribe = function (events) { };
    RestfulEndpoint.prototype.unsubscribe = function (events) { };
    RestfulEndpoint.prototype.simulateIO = function (method, httpMethod, url, args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log(isProduction ? "error" : "info", 'Type-R:SimulatedIO', httpMethod + " " + url);
                return [2, this.memoryIO[method].apply(this.memoryIO, args)];
            });
        });
    };
    RestfulEndpoint.prototype.objectUrl = function (model, id, options) {
        if (options === void 0) { options = {}; }
        return UrlBuilder
            .from(this.url, model, options)
            .modelId(model)
            .params(options.params)
            .toString();
    };
    RestfulEndpoint.prototype.collectionUrl = function (collection, options) {
        if (options === void 0) { options = {}; }
        return UrlBuilder
            .from(this.url, collection, options)
            .params(options.params)
            .toString();
    };
    RestfulEndpoint.prototype.buildRequestOptions = function (method, options, body) {
        var mergedOptions = __assign(__assign(__assign({}, RestfulEndpoint.defaultFetchOptions), this.fetchOptions), options);
        var headers = mergedOptions.headers, rest = __rest(mergedOptions, ["headers"]), resultOptions = __assign({ method: method, headers: __assign({ 'Content-Type': 'application/json' }, headers) }, rest);
        if (body) {
            resultOptions.body = JSON.stringify(body);
        }
        return resultOptions;
    };
    RestfulEndpoint.prototype.request = function (method, url, _a, body) {
        var options = _a.options;
        return fetch(url, this.buildRequestOptions(method, options, body))
            .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error(response.statusText);
            }
        });
    };
    RestfulEndpoint.defaultFetchOptions = {
        cache: "no-cache",
        credentials: "same-origin",
        mode: "cors",
        redirect: "error",
    };
    return RestfulEndpoint;
}());
export { RestfulEndpoint };
var UrlBuilder = (function () {
    function UrlBuilder(url) {
        this.url = url;
    }
    UrlBuilder.from = function (url, object, options) {
        if (options === void 0) { options = {}; }
        var rootUrl = typeof url === 'function' ?
            url(options, object instanceof Model ? object : null)
            : url;
        if (rootUrl.indexOf('./') === 0) {
            var owner = object.getOwner(), ownerUrl = owner.getEndpoint().objectUrl(owner, options);
            rootUrl = removeTrailingSlash(ownerUrl) + '/' + rootUrl.substr(2);
        }
        return new UrlBuilder(rootUrl);
    };
    UrlBuilder.prototype.modelId = function (model) {
        return model instanceof Model && !model.isNew()
            ? this.append(model.id)
            : this;
    };
    UrlBuilder.prototype.append = function (id) {
        return new UrlBuilder(removeTrailingSlash(this.url) + '/' + id);
    };
    UrlBuilder.prototype.params = function (params) {
        var esc = encodeURIComponent;
        return params ?
            new UrlBuilder(this.url + '?' + Object.keys(params)
                .map(function (k) { return esc(k) + '=' + esc(params[k]); })
                .join('&')) :
            this;
    };
    UrlBuilder.prototype.toString = function () {
        return this.url;
    };
    return UrlBuilder;
}());
export { UrlBuilder };
function removeTrailingSlash(url) {
    var endsWithSlash = url.charAt(url.length - 1) === '/';
    return endsWithSlash ? url.substr(0, url.length - 1) : url;
}
//# sourceMappingURL=restful.js.map