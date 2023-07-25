const SuiStatsAddress = require('./SuiStatsAddress.js');

class SuiStats extends EventTarget {
    constructor(params = {}) {
        super();

        this.suiMaster = params.suiMaster;
        if (!this.suiMaster) {
            throw new Error('suiMaster is required');
        }

        this.isInitialized = false;

        this._forAddress = {};
    }

    static singleInstance(params) {
        if (SuiStats.__instance) {
            return SuiStats.__instance;
        }

        SuiStats.__instance = new SuiStats(params);

        return SuiStats.__instance;
    }

    forAddress(address) {
        if (this._forAddress[address]) {
            return this._forAddress[address];
        }

        this._forAddress[address] = new SuiStatsAddress({
            suiMaster: this.suiMaster,
            address: address,
        });

        return this._forAddress[address];
    }

    removeAddress(address) {
        if (this._forAddress[address]) {
            delete this._forAddress[address];
        }
    }
}

module.exports = SuiStats;