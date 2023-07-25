const SuiStatsAddressDayHour = require('./SuiStatsAddressDayHour.js');
const ss = require('simple-statistics');

class SuiStatsAddressDay extends EventTarget {
    constructor(params = {}) {
        super();

        this.suiMaster = params.suiMaster;
        if (!this.suiMaster) {
            throw new Error('suiMaster is required');
        }
        this.address = params.address;

        if (!this.address) {
            throw new Error('address is required');
        }

        this._transactions = [];

        this._hoursIds = {};
        this._id = params.id || null;
        this._forTheDate = params.forTheDate || null;

        this.transactionsCount = 0;
    }

    get title() {
        return (this.forTheDate.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) + ' UTC');

        // return ''+this.forTheDate;
    }

    get forTheDate() {
        return this._forTheDate;
    }

    get id() {
        return this._id;
    }

    get hours() {
        const ret = [];
        for (let i = 0; i < 24; i++) {
            if (this._hoursIds[''+i]) {
                ret.push( this._hoursIds[''+i] );
            } else {
                this._hoursIds[''+i] = new SuiStatsAddressDayHour({
                    suiMaster: this.suiMaster,
                    address: this.address,
                    id: (''+i),
                });

                ret.push( this._hoursIds[''+i] );
            }
        }

        return ret;
    }

    get transactions() {
        return this._transactions;
    }

    pushTransaction(suiTransaction) {
        const date = new Date(suiTransaction.timestampMs);
        if (isNaN(date.getTime())) {
            // just ingore invalid dates. Too recent transactions may not get timestamp
            return false;
        }

        if (!this._id) {
            this._id = '' + date.getUTCDate() + '-' + date.getUTCMonth() + '-' + date.getUTCFullYear();
        }

        const hoursId = '' + date.getUTCHours();

        if (this._hoursIds[hoursId]) {
            this._hoursIds[hoursId].pushTransaction(suiTransaction);
        } else {
            this._hoursIds[hoursId] = new SuiStatsAddressDayHour({
                suiMaster: this.suiMaster,
                address: this.address,
            });
            this._hoursIds[hoursId].pushTransaction(suiTransaction);
        }

        this._transactions.push(suiTransaction);

        this.transactionsCount++;

        this.dispatchEvent(new CustomEvent('transaction', {detail: suiTransaction}));
    }

    getScore24() {
        const hours = this.hours;
        let s = 100;
        let c = 0;
        for (const hour of hours) {
            if (hour.transactionsCount) {
                c++;
                if (c > 8) {
                    s = s * 0.9;
                }
            }
        }

        return s;
    }

    getScoreAnger() {
        const hours = this.hours;
        let s = 100;
        for (const hour of hours) {
            if (hour.transactionsCount) {
                s = s * ( 1 - 0.01 * (Math.sqrt(Math.sqrt(hour.transactionsCount)) - 1) );
            }
        }

        return s;
    }

    getScoreManageableAnger() {
        const hours = this.hours;
        let max = 0;
        for (const hour of hours) {
            if (hour.transactionsCount && hour.transactionsCount > max) {
                max = hour.transactionsCount;
            }
        }

        if (max) {
            return 100 * ( 1 - 0.01 * ((Math.sqrt(max)) - 1) );
        }

        return 100;
    }

    getScorePomodoro() {
        const hours = this.hours;
        let s = 100;
        for (const hour of hours) {
            const topDelay = hour.topDelay();
            if (topDelay && topDelay < 5 * 60000) {
                s = s * 0.95;
            }
            if (topDelay && topDelay < 2 * 60000) {
                s = s * 0.95;
            }
            if (topDelay && topDelay < 60000) {
                s = s * 0.9;
            }
        }

        return s;
    }


    getScoreHoursDeviation() {
        const hours = this.hours;
        const medianDelays = [];
        for (const hour of hours) {
            medianDelays.push(hour.quantileDelay(0.5));
        }

        return ss.standardDeviation(medianDelays);
    }
}

module.exports = SuiStatsAddressDay;