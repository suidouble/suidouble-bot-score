const SuiStatsAddressDayHour = require('./SuiStatsAddressDayHour.js');
const ss = require('simple-statistics');
const Pack = require('./pack/Pack.js');

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

        this.transactionsCount = params.transactionsCount || 0;

        this._scores = params.scores || null;
    }

    static unpack(data, offset, params = {}) {
        const binaryHeader = data.slice(offset, offset + 16);
        const header = Pack.unpack(">IQI", binaryHeader);

        const version = header[0];
        const dayDate = header[1];
        const dayDateLow = header[2];

        console.log('version', version);

        const date = (new Date());
        date.setTime(dayDate * 1000000 + dayDateLow);
        params.forTheDate = date;


        const binaryScores = data.slice(offset + 16, offset + 16 + 16);
        const unpackedScores = Pack.unpack(">IIII", binaryScores);

        const scores = {
            s24: unpackedScores[0] / 100,
            sAnger: unpackedScores[1] / 100,
            sManageableAnger: unpackedScores[2] / 100,
            sPomodoro: unpackedScores[3] / 100,
        };

        console.error(scores);

        params.scores = scores;

        let offsetNow = offset + 16 + 16;

        const suiStatsAddressDay = new SuiStatsAddressDay(params);

        for (let i = 0; i < 24; i++) {
            const hourBinary = data.slice(offsetNow, offsetNow + 16);
            const hourUnpacked = Pack.unpack(">IIII", hourBinary);

            console.log('hourUnpacked', hourUnpacked);

            const hourId = ''+i;
            suiStatsAddressDay._hoursIds[hourId] = new SuiStatsAddressDayHour({
                    suiMaster: suiStatsAddressDay.suiMaster,
                    address: suiStatsAddressDay.address,
                    transactionsCount: hourUnpacked[0],
                    stats: {
                        'quantileDelay_0.1': hourUnpacked[1],
                        'quantileDelay_0.5': hourUnpacked[2],
                        'quantileDelay_0.9': hourUnpacked[3],
                    },
                });

            offsetNow += 16;
        }


        return suiStatsAddressDay;
    }

    pack() {
        let ret = [];

        const version = 1;
        const dayDate = Math.round(this.forTheDate.getTime() / 1000000);
        const dayDateLow = this.forTheDate.getTime() - dayDate;

        const binaryHeader = Pack.pack(">IQI", [version, dayDate, dayDateLow]);
        ret = ret.concat(binaryHeader);

        const scores = {
            s24: 0,
            sAnger: 0,
            sManageableAnger: 0,
            sPomodoro: 0,
        };

        try {
            scores.s24 = this.getScore24();
            scores.sAnger = this.getScoreAnger();
            scores.sManageableAnger = this.getScoreManageableAnger();
            scores.sPomodoro = this.getScorePomodoro();
        } catch (e) {
            console.error(e);
        }

        for (let k in scores) {
            if (scores[k] < 0) scores[k] = 0;
            if (scores[k] > 100) scores[k] = 100;
            scores[k] = Math.floor(scores[k] * 100);
        }

        const binaryScores = Pack.pack(">IIII", [scores.s24, scores.sAnger, scores.sManageableAnger, scores.sPomodoro]);
        ret = ret.concat(binaryScores);

        const binaryHours = [];
        const hours = this.hours;

        for (let i = 0; i < 24; i++) {
            const hourData = {
                transactionsCount: 0,
                quantileDelay1: 0,
                quantileDelay5: 0,
                quantileDelay9: 0,
            };

            try {
                if (hours[i]) {
                    hourData.transactionsCount = Math.floor(hours[i].transactionsCount);
                    hourData.quantileDelay1 = Math.floor(hours[i].quantileDelay(0.1));
                    hourData.quantileDelay5 = Math.floor(hours[i].quantileDelay(0.5));
                    hourData.quantileDelay9 = Math.floor(hours[i].quantileDelay(0.9));
                }
            } catch (e) {
                console.error(e);
            }

            const binaryHour = Pack.pack(">IIII", [hourData.transactionsCount, hourData.quantileDelay1, hourData.quantileDelay5, hourData.quantileDelay9]);
            binaryHours.push(binaryHour);  

            ret = ret.concat(binaryHour);
        }

        return ret;
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
        if (this._scores) {
            return this._scores.s24;
        }

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
        if (this._scores) {
            return this._scores.sAnger;
        }

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
        if (this._scores) {
            return this._scores.sManageableAnger;
        }

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
        if (this._scores) {
            return this._scores.sPomodoro;
        }

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