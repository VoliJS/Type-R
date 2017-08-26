var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { tools, definitions, mixinRules, define } from '../object-plus';
import { Transactional } from '../transactions';
import { AnyType, AggregatedType, setAttribute, UpdateRecordMixin } from './attributes';
var assign = tools.assign, isEmpty = tools.isEmpty, log = tools.log;
var _cidCounter = 0;
var Record = (function (_super) {
    __extends(Record, _super);
    function Record(a_values, a_options) {
        var _this = _super.call(this, _cidCounter++) || this;
        _this.attributes = {};
        var options = a_options || {}, values = (options.parse ? _this.parse(a_values, options) : a_values) || {};
        var attributes = options.clone ? cloneAttributes(_this, values) : _this.defaults(values);
        _this.forEachAttr(attributes, function (value, key, attr) {
            var next = attributes[key] = attr.transform(value, options, void 0, _this);
            attr.handleChange(next, void 0, _this);
        });
        _this.attributes = _this._previousAttributes = attributes;
        _this.initialize(a_values, a_options);
        if (_this._localEvents)
            _this._localEvents.subscribe(_this, _this);
        return _this;
    }
    Record_1 = Record;
    Record.onDefine = function (definition, BaseClass) { };
    Record.defaults = function (attrs) {
        return this.extend({ attributes: attrs });
    };
    Record.attributes = function (attrs) {
        return this.extend({ attributes: attrs });
    };
    Record.prototype.previousAttributes = function () { return new this.Attributes(this._previousAttributes); };
    Object.defineProperty(Record.prototype, "__inner_state__", {
        get: function () { return this.attributes; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Record.prototype, "changed", {
        get: function () {
            var changed = this._changedAttributes;
            if (!changed) {
                var prev = this._previousAttributes;
                changed = {};
                var _a = this, _attributes = _a._attributes, attributes = _a.attributes;
                for (var _i = 0, _b = this._keys; _i < _b.length; _i++) {
                    var key = _b[_i];
                    var value = attributes[key];
                    if (_attributes[key].isChanged(value, prev[key])) {
                        changed[key] = value;
                    }
                }
                this._changedAttributes = changed;
            }
            return changed;
        },
        enumerable: true,
        configurable: true
    });
    Record.prototype.changedAttributes = function (diff) {
        if (!diff)
            return this.hasChanged() ? assign({}, this.changed) : false;
        var val, changed = false, old = this._transaction ? this._previousAttributes : this.attributes, attrSpecs = this._attributes;
        for (var attr in diff) {
            if (!attrSpecs[attr].isChanged(old[attr], (val = diff[attr])))
                continue;
            (changed || (changed = {}))[attr] = val;
        }
        return changed;
    };
    Record.prototype.hasChanged = function (key) {
        var _previousAttributes = this._previousAttributes;
        if (!_previousAttributes)
            return false;
        return key ?
            this._attributes[key].isChanged(this.attributes[key], _previousAttributes[key]) :
            !isEmpty(this.changed);
    };
    Record.prototype.previous = function (key) {
        if (key) {
            var _previousAttributes = this._previousAttributes;
            if (_previousAttributes)
                return _previousAttributes[key];
        }
        return null;
    };
    Record.prototype.isNew = function () {
        return this.id == null;
    };
    Record.prototype.has = function (key) {
        return this[key] != void 0;
    };
    Record.prototype.unset = function (key, options) {
        return this.set((_a = {}, _a[key] = void 0, _a), options);
        var _a;
    };
    Record.prototype.clear = function (options) {
        var _this = this;
        var nullify = options && options.nullify;
        this.transaction(function () {
            _this.forEachAttr(_this.attributes, function (value, key) { return _this[key] = nullify ? null : void 0; });
        }, options);
        return this;
    };
    Record.prototype.getOwner = function () {
        var owner = this._owner;
        return this._ownerKey ? owner : owner && owner._owner;
    };
    Object.defineProperty(Record.prototype, "id", {
        get: function () { return this.attributes[this.idAttribute]; },
        set: function (x) { setAttribute(this, this.idAttribute, x); },
        enumerable: true,
        configurable: true
    });
    Record.prototype.forEachAttr = function (attrs, iteratee) {
        var _attributes = this._attributes;
        var unknown;
        for (var name_1 in attrs) {
            var spec = _attributes[name_1];
            if (spec) {
                iteratee(attrs[name_1], name_1, spec);
            }
            else {
                unknown || (unknown = []);
                unknown.push("'" + name_1 + "'");
            }
        }
        if (unknown) {
            this._log('warn', "attributes " + unknown.join(', ') + " are not defined", attrs);
        }
    };
    Record.prototype.each = function (iteratee, context) {
        var fun = context !== void 0 ? function (v, k) { return iteratee.call(context, v, k); } : iteratee, attributes = this.attributes;
        for (var _i = 0, _a = this._keys; _i < _a.length; _i++) {
            var key = _a[_i];
            var value = attributes[key];
            if (value !== void 0)
                fun(value, key);
        }
    };
    Record.prototype.keys = function () {
        var keys = [], attributes = this.attributes;
        for (var _i = 0, _a = this._keys; _i < _a.length; _i++) {
            var key = _a[_i];
            attributes[key] === void 0 || keys.push(key);
        }
        return keys;
    };
    Record.prototype.values = function () {
        return this.map(function (value) { return value; });
    };
    Record.prototype._toJSON = function () { return {}; };
    Record.prototype._parse = function (data) { return data; };
    Record.prototype.defaults = function (values) { return {}; };
    Record.prototype.initialize = function (values, options) { };
    Record.prototype.clone = function (options) {
        if (options === void 0) { options = {}; }
        var copy = new this.constructor(this.attributes, { clone: true });
        if (options.pinStore)
            copy._defaultStore = this.getStore();
        return copy;
    };
    Record.prototype.deepClone = function () { return this.clone(); };
    ;
    Record.prototype._validateNested = function (errors) {
        var _this = this;
        var length = 0;
        this.forEachAttr(this.attributes, function (value, name, attribute) {
            var error = attribute.validate(_this, value, name);
            if (error) {
                errors[name] = error;
                length++;
            }
        });
        return length;
    };
    Record.prototype.get = function (key) {
        return this[key];
    };
    Record.prototype.toJSON = function () {
        var _this = this;
        var json = {};
        this.forEachAttr(this.attributes, function (value, key, _a) {
            var toJSON = _a.toJSON;
            if (value !== void 0) {
                var asJson = toJSON.call(_this, value, key);
                if (asJson !== void 0)
                    json[key] = asJson;
            }
        });
        return json;
    };
    Record.prototype.parse = function (data, options) {
        return this._parse(data);
    };
    Record.prototype.deepSet = function (name, value, options) {
        var _this = this;
        this.transaction(function () {
            var path = name.split('.'), l = path.length - 1, attr = path[l];
            var model = _this;
            for (var i = 0; i < l; i++) {
                var key = path[i];
                var next = model.get ? model.get(key) : model[key];
                if (!next) {
                    var attrSpecs = model._attributes;
                    if (attrSpecs) {
                        var newModel = attrSpecs[key].create();
                        if (options && options.nullify && newModel._attributes) {
                            newModel.clear(options);
                        }
                        model[key] = next = newModel;
                    }
                    else
                        return;
                }
                model = next;
            }
            if (model.set) {
                model.set((_a = {}, _a[attr] = value, _a), options);
            }
            else {
                model[attr] = value;
            }
            var _a;
        });
        return this;
    };
    Object.defineProperty(Record.prototype, "collection", {
        get: function () {
            return this._ownerKey ? null : this._owner;
        },
        enumerable: true,
        configurable: true
    });
    Record.prototype.dispose = function () {
        var _this = this;
        if (this._disposed)
            return;
        this.forEachAttr(this.attributes, function (value, key, attribute) {
            attribute.dispose(_this, value);
        });
        _super.prototype.dispose.call(this);
    };
    Record.prototype._log = function (level, text, value) {
        tools.log[level]("[Model Update] " + this.getClassName() + ": " + text, value, 'Attributes spec:', this._attributes);
    };
    Record.prototype.getClassName = function () {
        return _super.prototype.getClassName.call(this) || 'Model';
    };
    Record.prototype._createTransaction = function (values, options) { return void 0; };
    Record = Record_1 = __decorate([
        define({
            cidPrefix: 'm',
            _changeEventName: 'change',
            idAttribute: 'id',
            _keys: ['id']
        }),
        definitions({
            defaults: mixinRules.merge,
            attributes: mixinRules.merge,
            collection: mixinRules.merge,
            Collection: mixinRules.value,
            idAttribute: mixinRules.protoValue
        })
    ], Record);
    return Record;
    var Record_1;
}(Transactional));
export { Record };
;
assign(Record.prototype, UpdateRecordMixin);
function cloneAttributes(record, a_attributes) {
    var attributes = new record.Attributes(a_attributes);
    record.forEachAttr(attributes, function (value, name, attr) {
        attributes[name] = attr.clone(value, record);
    });
    return attributes;
}
var BaseRecordAttributes = (function () {
    function BaseRecordAttributes(x) {
        this.id = x.id;
    }
    return BaseRecordAttributes;
}());
Record.prototype.Attributes = BaseRecordAttributes;
Record.prototype._attributes = { id: AnyType.create({ value: void 0 }, 'id') };
Record.prototype.defaults = function (attrs) {
    if (attrs === void 0) { attrs = {}; }
    return { id: attrs.id };
};
Record._attribute = AggregatedType;
//# sourceMappingURL=record.js.map