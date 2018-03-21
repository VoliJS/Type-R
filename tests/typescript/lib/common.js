import { Model } from 'type-r';
export var SecondsInterval = Model.extend({
    units: [
        'seconds',
        'minutes',
        'hours',
        'days',
        'weeks',
        'months',
        'years'
    ],
    defaults: {
        value: 1,
        interval: String.value('months')
    },
    properties: {
        seconds: function () { return this.getUnitValue(1); },
        minutes: function () { return this.getUnitValue(60); },
        hours: function () { return this.getUnitValue(3600); },
        days: function () { return this.getUnitValue(86400); },
        weeks: function () { return this.getUnitValue(604800); },
        months: function () { return this.getUnitValue(2628000); },
        years: function () { return this.getUnitValue(31536000); }
    },
    getUnitValue: function (value) {
        return value;
    },
    parse: function (data) {
        var res = {
            value: 1,
            interval: 'months'
        };
        data = typeof data === 'object' ? 0 : data;
        for (var i = this.units.length; i > 0; i--) {
            var l = this.units[i - 1];
            if (data % this[l] == 0) {
                res.value = Math.floor(data / this[l]);
                res.interval = l;
                return res;
            }
        }
        return res;
    },
    toInteger: function () {
        return this.value * this[this.interval];
    },
    toJSON: function () {
        return this.toInteger();
    },
    getUnits: function () {
        var _this = this;
        var units = {};
        Object.keys(this.units).forEach(function (name) {
            units[name] = _this[name];
        });
        return units;
    }
});
export var MinutesInterval = SecondsInterval.extend({
    units: [
        'minutes',
        'hours',
        'days',
        'weeks',
        'months',
        'years'
    ],
    getUnitValue: function (value) {
        return value / 60;
    },
});
//# sourceMappingURL=common.js.map