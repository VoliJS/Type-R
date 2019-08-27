import * as tslib_1 from "tslib";
import { DateType, ChainableAttributeSpec, type } from '@type-r/models';
var msDatePattern = /\/Date\(([0-9]+)\)\//;
var MicrosoftDateType = (function (_super) {
    tslib_1.__extends(MicrosoftDateType, _super);
    function MicrosoftDateType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MicrosoftDateType.prototype.convert = function (next) {
        if (typeof next === 'string') {
            var msDate = msDatePattern.exec(next);
            if (msDate) {
                return new Date(Number(msDate[1]));
            }
        }
        return DateType.prototype.convert.apply(this, arguments);
    };
    MicrosoftDateType.prototype.toJSON = function (value) { return value && "/Date(" + value.getTime() + ")/"; };
    return MicrosoftDateType;
}(DateType));
export { MicrosoftDateType };
export var MicrosoftDate = new ChainableAttributeSpec({
    type: Date,
    _metatype: MicrosoftDateType
});
export var Timestamp = type(Date).toJSON(function (x) { return x && x.getTime(); });
//# sourceMappingURL=dates.js.map