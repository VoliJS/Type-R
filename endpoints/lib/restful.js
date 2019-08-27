import * as tslib_1 from "tslib";
import { log, isProduction } from '@type-r/models';
import { memoryIO } from './memory';
export function create(url, fetchOptions) {
    return new RestfulEndpoint(url, fetchOptions);
}
export { create as restfulIO };
var RestfulEndpoint = (function () {
    function RestfulEndpoint(url, _a) {
        if (_a === void 0) { _a = {}; }
        var mockData = _a.mockData, _b = _a.simulateDelay, simulateDelay = _b === void 0 ? 1000 : _b, fetchOptions = tslib_1.__rest(_a, ["mockData", "simulateDelay"]);
        this.url = url;
        this.fetchOptions = fetchOptions;
        this.memoryIO = mockData && !isProduction ? memoryIO(mockData, simulateDelay) : null;
        if (mockData && isProduction) {
            log('error', 'Type-R:RestfulIO', "Mock data is used in production for " + url);
        }
    }
    RestfulEndpoint.prototype.create = function (json, options, record) {
        var url = this.collectionUrl(record, options);
        return this.memoryIO ?
            this.simulateIO('create', 'POST', url, arguments) :
            this.request('POST', url, options, json);
    };
    RestfulEndpoint.prototype.update = function (id, json, options, record) {
        var url = this.objectUrl(record, id, options);
        return this.memoryIO ?
            this.simulateIO('update', 'PUT', url, arguments) :
            this.request('PUT', url, options, json);
    };
    RestfulEndpoint.prototype.read = function (id, options, record) {
        var url = this.objectUrl(record, id, options);
        return this.memoryIO ?
            this.simulateIO('read', 'GET', url, arguments) :
            this.request('GET', url, options);
    };
    RestfulEndpoint.prototype.destroy = function (id, options, record) {
        var url = this.objectUrl(record, id, options);
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                log(isProduction ? "error" : "info", 'Type-R:SimulatedIO', httpMethod + " " + url);
                return [2, this.memoryIO[method].apply(this.memoryIO, args)];
            });
        });
    };
    RestfulEndpoint.prototype.isRelativeUrl = function (url) {
        return url.indexOf('./') === 0;
    };
    RestfulEndpoint.prototype.removeTrailingSlash = function (url) {
        var endsWithSlash = url.charAt(url.length - 1) === '/';
        return endsWithSlash ? url.substr(0, url.length - 1) : url;
    };
    RestfulEndpoint.prototype.getRootUrl = function (recordOrCollection) {
        var url = this.url;
        if (this.isRelativeUrl(url)) {
            var owner = recordOrCollection.getOwner(), ownerUrl = owner.getEndpoint().getUrl(owner);
            return this.removeTrailingSlash(ownerUrl) + '/' + url.substr(2);
        }
        else {
            return url;
        }
    };
    RestfulEndpoint.prototype.getUrl = function (record) {
        var url = this.getRootUrl(record);
        return record.isNew()
            ? url
            : this.removeTrailingSlash(url) + '/' + record.id;
    };
    RestfulEndpoint.prototype.objectUrl = function (record, id, options) {
        return appendParams(this.getUrl(record), options.params);
    };
    RestfulEndpoint.prototype.collectionUrl = function (collection, options) {
        return appendParams(this.getRootUrl(collection), options.params);
    };
    RestfulEndpoint.prototype.buildRequestOptions = function (method, options, body) {
        var mergedOptions = tslib_1.__assign({}, RestfulEndpoint.defaultFetchOptions, this.fetchOptions, options);
        var headers = mergedOptions.headers, rest = tslib_1.__rest(mergedOptions, ["headers"]), resultOptions = tslib_1.__assign({ method: method, headers: tslib_1.__assign({ 'Content-Type': 'application/json' }, headers) }, rest);
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
function appendParams(url, params) {
    var esc = encodeURIComponent;
    return params
        ? url + '?' + Object.keys(params)
            .map(function (k) { return esc(k) + '=' + esc(params[k]); })
            .join('&')
        : url;
}
//# sourceMappingURL=restful.js.map