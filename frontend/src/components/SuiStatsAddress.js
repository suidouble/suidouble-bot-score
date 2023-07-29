const SuiStatsAddressDay = require('./SuiStatsAddressDay.js');
const ss = require('simple-statistics');
const Pack = require('./pack/Pack.js');

class SuiStatsAddress extends EventTarget {
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

        this.isInitialized = false;

        this.fetching = false;
        this.loadedTransactionsCount = 0;

        this.paginatedResponse = null;

        this._days = [];
        this._daysIds = {};

        this._transactions = [];
        this._mostRecentTransaction = null;
        this._packedVersion = params.packedVersion || null;
    }

    get packedVersion() {
        return this._packedVersion;
    }

    readyForTheMint() {

        if (this._transactions.length > 10000) {
            return true;
        }

        let ret = 0;
        let i = 0;
        let checkDate = new Date();

        do {
            const dayId = '' + checkDate.getUTCDate() + '-' + checkDate.getUTCMonth() + '-' + checkDate.getUTCFullYear();

            if (this._daysIds[dayId] && this._daysIds[dayId].transactionsCount) {
                ret++;
            }
            i++
            checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        } while (i < 100);

        if (ret > 3) {
            return true;
        }

        return false;
    }

    static unpack(data, params) {
        const binaryHeader = data.slice(0, 8);

        const header = Pack.unpack(">II", binaryHeader);

        const version = header[0];
        const count = header[1];

        console.log('ver', version);

        params.packedVersion = version;
        const suiStatsAddress = new SuiStatsAddress(params);

        let offsetNow = 8;
        for (let i = 0; i < count; i++) {
            // 16*24 + 32
            const suiStatsAddressDay = SuiStatsAddressDay.unpack(data, offsetNow, {
                suiMaster: params.suiMaster,
                address: params.address,
            });
            console.error('suiStatsAddressDay', suiStatsAddressDay);

            if (suiStatsAddressDay.packedVersion != 1 && suiStatsAddressDay.packedVersion != 2 && suiStatsAddressDay.packedVersion != 3) {
                suiStatsAddress.fillDayGaps(suiStatsAddressDay.forTheDate);
            }

            const dayId = '' + suiStatsAddressDay.forTheDate.getUTCDate() + '-' + suiStatsAddressDay.forTheDate.getUTCMonth() + '-' + suiStatsAddressDay.forTheDate.getUTCFullYear();
            suiStatsAddress._days.push(suiStatsAddressDay);
            suiStatsAddress._daysIds[dayId] = suiStatsAddressDay;

            offsetNow += (16*24+32);
        }

        return suiStatsAddress;
    }

    pack() {
        let ret = [];
        let daysRet = [];

        let daysCount = 0;
        let di = 0;
        do {
            if (this._days[di] && this._days[di].transactionsCount) {
                daysRet = daysRet.concat(this._days[di].pack());
                daysCount++;
            }
            di++;
        } while (daysCount < 21 && this._days[di]);

        const version = 4;
        const binaryHeader = Pack.pack(">II", [version, daysCount]);
        ret = ret.concat(binaryHeader);
        ret = ret.concat(daysRet);

        return ret;

        // return ret;
    }

    getCurrentScore() {
        let scores = [];
        let daysCount = 0;
        let di = 0;

        let isFirstDay = true;
        do {
            if (this._days[di]) {
                if (this._days[di].transactionsCount) {
                    try { scores.push(this._days[di].getScorePomodoro()); } catch (e) { console.error(e); }
                    try { scores.push(this._days[di].getScoreManageableAnger()); } catch (e) { console.error(e); }
                    try { scores.push(this._days[di].getScoreAnger()); } catch (e) { console.error(e); }
                    try { scores.push(this._days[di].getScore24()); } catch (e) { console.error(e); }

                    if (!isFirstDay) {
                        // double the scores weight
                        scores.push(scores[scores.length - 4]);
                        scores.push(scores[scores.length - 4]);
                        scores.push(scores[scores.length - 4]);
                        scores.push(scores[scores.length - 4]);
                    }

                    daysCount++;

                    isFirstDay = false;
                }
            }
            di++;
        } while (daysCount < 7 && this._days[di]);

        if (scores.length > 8) {
            // de-double score for the last day
            scores.pop();
            scores.pop();
            scores.pop();
            scores.pop();
        }

        try {
            return ss.quantile(scores, 0.5);
        } catch (e) {
            return 100;
        }
    }

    get days() {
        return this._days;
    }

    fillDayGaps(tillDate) {
        let date = new Date();
        const tillDateDayId = '' + tillDate.getUTCDate() + '-' + tillDate.getUTCMonth() + '-' + tillDate.getUTCFullYear();

        do {
            const dayId = '' + date.getUTCDate() + '-' + date.getUTCMonth() + '-' + date.getUTCFullYear();
            if (dayId == tillDateDayId) {
                // do not add last needed here
                return;
            }

            if (!this._daysIds[dayId]) {
                const day = new SuiStatsAddressDay({
                    suiMaster: this.suiMaster,
                    address: this.address,
                    id: dayId,
                    forTheDate: new Date(date.getTime()),
                });
                this._daysIds[dayId] = day;
                this._days.push(day);

                this.dispatchEvent(new CustomEvent('day', {detail: this._daysIds[dayId]}));
            }
            date.setUTCDate(date.getUTCDate() - 1);
        } while (date > tillDate);
    }

    hasEmptyDaysAfter(theDate) {
        let checkDate = new Date(theDate.getTime());
        checkDate.setUTCDate(checkDate.getUTCDate() + 1);

        const dayId = '' + checkDate.getUTCDate() + '-' + checkDate.getUTCMonth() + '-' + checkDate.getUTCFullYear();
        if (!this._daysIds[dayId] || !this._daysIds[dayId].transactionsCount) {
            return true;
        }

        return false;
    }

    emptyDaysBefore(theDate) {
        let ret = 0;
        let checkDate = new Date(theDate.getTime());

        do {
            const dayId = '' + checkDate.getUTCDate() + '-' + checkDate.getUTCMonth() + '-' + checkDate.getUTCFullYear();

            if (!this._daysIds[dayId] || !this._daysIds[dayId].transactionsCount) {
                ret++;
            } else {
                return ret;
            }

            checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        } while (ret < 100);

        return ret;
    }

    pushTransactionToDay(suiTransaction) {
        const date = new Date(suiTransaction.timestampMs);
        if (isNaN(date.getTime())) {
            // just ingore invalid dates. Too recent transactions may not get timestamp
            return false;
        }

        const dayId = '' + date.getUTCDate() + '-' + date.getUTCMonth() + '-' + date.getUTCFullYear();

        if (this._mostRecentTransaction) {
            // most recent is the next one
            if (this._mostRecentTransaction.timestampMs) {
                suiTransaction.timeToNextTransaction = Math.abs(suiTransaction.timestampMs - this._mostRecentTransaction.timestampMs);
            }
        }
        this._mostRecentTransaction = suiTransaction;

        if (!suiTransaction.timeToNextTransaction) {
            return false; // just skip
        }

        if (this._daysIds[dayId]) {
            this._daysIds[dayId].pushTransaction(suiTransaction);
        } else {
            this.fillDayGaps(date);

            this._daysIds[dayId] = new SuiStatsAddressDay({
                suiMaster: this.suiMaster,
                address: this.address,
                forTheDate: new Date(date.getTime()),
            });
            this._daysIds[dayId].pushTransaction(suiTransaction);

            this._days.push(this._daysIds[dayId]);

            this.dispatchEvent(new CustomEvent('day', {detail: this._daysIds[dayId]}));
        }


        this._transactions.push(suiTransaction);

        this.dispatchEvent(new CustomEvent('transaction', {detail: suiTransaction}));

        return true;
    }

    async askFromRPC() {
        this.isFetching = true;

        this.paginatedResponse = await this.suiMaster.fetchTransactions({
            fromAddress: this.address,
        });

        try {
            let gonnaStop = false;
            do {
                await this.paginatedResponse.forEach(async (suiTransaction)=>{
                    this.loadedTransactionsCount++;
        
                    this.pushTransactionToDay(suiTransaction);
        
                    // await new Promise((res)=>setTimeout(res, 100));
        
                    if (!this.isFetching) {
                        throw new Error('asked to stop');
                    }
                }, Infinity);

                if (!this.paginatedResponse.hasNextPage) {
                    gonnaStop = true;
                }
            } while (!gonnaStop);
        } catch (e) {
            console.error(e);
        }

        this.dispatchEvent(new CustomEvent('done', {detail: false}));
    }

    stop() {
        this.isFetching = false;
    }
}

module.exports = SuiStatsAddress;