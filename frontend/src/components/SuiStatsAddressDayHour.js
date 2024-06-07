import * as ss from 'simple-statistics';

export default class SuiStatsAddressDayHour extends EventTarget {
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
        this._id = params.id || null;

        this._stats = params.stats || null;
        this._transactionsCount = params.transactionsCount || null;
    }

    get id() {
        return this._id;
    }

    get transactionsCount() {
        if (this._transactionsCount) {
            return this._transactionsCount;
        }

        return this._transactions.length;
    }

    get delaysAsArray() {
        return this._transactions.map((t)=>{
            return t.timeToNextTransaction;
        });
    }

    get medianDelay() {
        return ss.median(this.delaysAsArray);
    }

    quantileDelay(p) {
        if (this._stats && this._stats['quantileDelay_'+p]) {
            return this._stats['quantileDelay_'+p];
        }

        try {
            return ss.quantile(this.delaysAsArray.filter((i)=>{ return (i < 3600000); }), p);
        } catch (e) {
            return 0;
        }
    }

    topDelay() {
        try {
            return ss.max(this.delaysAsArray.filter((i)=>{ return (i < 3600000); }));
        } catch (e) {
            return 0;
        }        
    }

    pushTransaction(suiTransaction) {
        const date = new Date(suiTransaction.timestampMs);
        if (isNaN(date.getTime())) {
            // just ingore invalid dates. Too recent transactions may not get timestamp
            return false;
        }
        if (!this._id) {
            this._id = '' + date.getUTCHours();
        }

        this._transactions.push(suiTransaction);
    }
}

// module.exports = SuiStatsAddressDayHour;