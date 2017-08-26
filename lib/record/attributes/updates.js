import { transactionApi } from "../../transactions";
var _begin = transactionApi.begin, _markAsDirty = transactionApi.markAsDirty, commit = transactionApi.commit;
import { eventsApi } from '../../object-plus';
var trigger3 = eventsApi.trigger3;
export function setAttribute(record, name, value) {
    var isRoot = begin(record), options = {}, attributes = record.attributes, spec = record._attributes[name], prev = attributes[name];
    var update = spec.canBeUpdated(prev, value, options);
    if (update) {
        var nestedTransaction = prev._createTransaction(update, options);
        if (nestedTransaction) {
            nestedTransaction.commit(record);
            if (spec.propagateChanges) {
                markAsDirty(record, options);
                trigger3(record, 'change:' + name, record, prev, options);
            }
        }
    }
    else {
        var next = spec.transform(value, options, prev, record);
        attributes[name] = next;
        if (spec.isChanged(next, prev)) {
            spec.handleChange(next, prev, record);
            markAsDirty(record, options);
            trigger3(record, 'change:' + name, record, next, options);
        }
    }
    isRoot && commit(record);
}
function begin(record) {
    if (_begin(record)) {
        record._previousAttributes = new record.Attributes(record.attributes);
        record._changedAttributes = null;
        return true;
    }
    return false;
}
function markAsDirty(record, options) {
    if (record._changedAttributes) {
        record._changedAttributes = null;
    }
    return _markAsDirty(record, options);
}
export var UpdateRecordMixin = {
    transaction: function (fun, options) {
        if (options === void 0) { options = {}; }
        var isRoot = begin(this);
        fun.call(this, this);
        isRoot && commit(this);
    },
    _onChildrenChange: function (child, options) {
        var _ownerKey = child._ownerKey, attribute = this._attributes[_ownerKey];
        if (!attribute || attribute.propagateChanges)
            this.forceAttributeChange(_ownerKey, options);
    },
    forceAttributeChange: function (key, options) {
        if (options === void 0) { options = {}; }
        var isRoot = begin(this);
        if (markAsDirty(this, options)) {
            trigger3(this, 'change:' + key, this, this.attributes[key], options);
        }
        isRoot && commit(this);
    },
    _createTransaction: function (a_values, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var isRoot = begin(this), changes = [], nested = [], attributes = this.attributes, values = options.parse ? this.parse(a_values, options) : a_values;
        if (values && values.constructor === Object) {
            this.forEachAttr(values, function (value, key, attr) {
                var prev = attributes[key];
                var update;
                if (update = attr.canBeUpdated(prev, value, options)) {
                    var nestedTransaction = prev._createTransaction(update, options);
                    if (nestedTransaction) {
                        nested.push(nestedTransaction);
                        if (attr.propagateChanges)
                            changes.push(key);
                    }
                    return;
                }
                var next = attr.transform(value, options, prev, _this);
                attributes[key] = next;
                if (attr.isChanged(next, prev)) {
                    changes.push(key);
                    attr.handleChange(next, prev, _this);
                }
            });
        }
        else {
            this._log('error', 'incompatible argument type', values);
        }
        if (changes.length && markAsDirty(this, options)) {
            return new RecordTransaction(this, isRoot, nested, changes);
        }
        for (var _i = 0, nested_1 = nested; _i < nested_1.length; _i++) {
            var pendingTransaction = nested_1[_i];
            pendingTransaction.commit(this);
        }
        isRoot && commit(this);
    }
};
var RecordTransaction = (function () {
    function RecordTransaction(object, isRoot, nested, changes) {
        this.object = object;
        this.isRoot = isRoot;
        this.nested = nested;
        this.changes = changes;
    }
    RecordTransaction.prototype.commit = function (initiator) {
        var _a = this, nested = _a.nested, object = _a.object, changes = _a.changes;
        for (var _i = 0, nested_2 = nested; _i < nested_2.length; _i++) {
            var transaction = nested_2[_i];
            transaction.commit(object);
        }
        var attributes = object.attributes, _isDirty = object._isDirty;
        for (var _b = 0, changes_1 = changes; _b < changes_1.length; _b++) {
            var key = changes_1[_b];
            trigger3(object, 'change:' + key, object, attributes[key], _isDirty);
        }
        this.isRoot && commit(object, initiator);
    };
    return RecordTransaction;
}());
//# sourceMappingURL=updates.js.map