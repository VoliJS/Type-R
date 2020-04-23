import { __assign, __extends } from "tslib";
import React, { Component } from 'react';
import { attributes, Transactional, Linked } from '@type-r/models';
export function pureRenderProps(props, Comp) {
    var prototype = attributes(props).prototype, _attributes = prototype._attributes, keys = Object.keys(props);
    var createVector = new Function("props", "\n        return [\n            " + keys.map(function (key) {
        return propForType(_attributes[key].type, key);
    }).join(', ') + "\n        ]\n    ");
    var compareVector = new Function("props", "vector", "\n        return " + keys.map(function (key, idx) {
        return "vector[" + idx + "] !== ( " + propForType(_attributes[key].type, key) + " )";
    }).join(' || ') + ";\n    ");
    var PureRenderWrapper = (function (_super) {
        __extends(PureRenderWrapper, _super);
        function PureRenderWrapper(props) {
            var _this = _super.call(this, props) || this;
            _this._vector = createVector(_this.props);
            return _this;
        }
        PureRenderWrapper.prototype.shouldComponentUpdate = function (nextProps) {
            return compareVector(nextProps, this._vector);
        };
        PureRenderWrapper.prototype.componentDidUpdate = function () {
            this._vector = createVector(this.props);
        };
        PureRenderWrapper.prototype.render = function () {
            return React.createElement(Comp, __assign({}, this.props));
        };
        return PureRenderWrapper;
    }(Component));
    return PureRenderWrapper;
}
function propForType(type, key) {
    return type.prototype instanceof Transactional ? "props." + key + " && props." + key + "._changeToken" :
        type === Date ? "props." + key + " && props." + key + ".getTime()" :
            type === Linked ? "props." + key + " && props." + key + ".value" :
                "props." + key;
}
//# sourceMappingURL=pureRender.js.map