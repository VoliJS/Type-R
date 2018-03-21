import { Model, Transactional, ChainableAttributeSpec } from 'type-r'

export const SecondsInterval = Model.extend({
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
        seconds: function() { return this.getUnitValue(1) },
        minutes: function() { return this.getUnitValue(60) },
        hours: function() { return this.getUnitValue(3600) },
        days: function() { return this.getUnitValue(86400) },
        weeks: function() { return this.getUnitValue(604800) },
        months: function() { return this.getUnitValue(2628000) },
        years: function() { return this.getUnitValue(31536000) }
    },

    getUnitValue( value ){
        return value;
    },

    parse: function (data) {
        var res = {
            value: 1,
            interval: 'months'
        };

        data = typeof data === 'object' ? 0 : data;

        for( var i = this.units.length; i > 0; i-- ){
            let l = this.units[i-1];
            if ( data % this[l] == 0 ) {
                res.value = Math.floor( data / this[l]);
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

    getUnits(){
        let units = {}
        Object.keys( this.units ).forEach( name => {
            units[name] = this[name];
        });

        return units;
    }
});
    
export const MinutesInterval = SecondsInterval.extend({
    units: [
        'minutes',
        'hours',
        'days',
        'weeks',
        'months',
        'years'
    ],

    getUnitValue( value ){
        return value / 60;
    },
});