<template>

    <div>
        <SignInWithSui :defaultChain="defaultChain" @suiMaster="onSuiMaster" ref="sui" :visible="false" />

        <q-banner class="bg-primary text-white" inline-actions style="margin-bottom: -16px;" v-if="!suiStatsAddress">
            <q-input type="text" label="Account Address &ndash; 0x.." v-model="addressToRun"/>
            <template v-slot:action>
                <q-btn flat color="white" label="Check" @click="doRun"/>
            </template>
        </q-banner>


        <q-timeline color="primary">
            <q-timeline-entry heading>
                <q-banner class="bg-primary text-white" inline-actions style="margin-bottom: -16px;" v-if="suiStatsAddress">
                    Statistics for {{ suiStatsAddress.address }}
                    <q-spinner-dots
                    color="white"
                    size="2em"
                    v-if="isLoading"
                    />

                    <template v-slot:action>
                        <q-btn flat color="white" label="Stop" @click="doStop" v-if="isLoading"/>
                        <q-btn flat color="white" label="Try Other" @click="doOther" v-if="!isLoading"/>
                    </template>
                </q-banner>
            </q-timeline-entry>

            <template v-for="(day) in days" v-bind:key="day.id">
                <DayView :suiStatsAddressDay="day" v-if="day.transactionsCount" />
                <EmptyDayView :suiStatsAddressDay="day"  :suiStatsAddress="suiStatsAddress" v-if="!day.transactionsCount" />
            </template>
        </q-timeline>
    </div>

</template>

<style lang="css">

</style>

<script>
import { SignInWithSui } from 'vue-sui';
// import DateHuman from 'shared/components/Helpers/DateHuman.vue';
import DayView from './StatsView/DayView.vue';
import EmptyDayView from './StatsView/EmptyDayView.vue';
const SuiStats = require('./SuiStats.js');

export default {
	name: 'StatsBuilder',
	props: {
	},
	data() {
		return {
            defaultChain: 'sui:mainnet',

            addressToRun: '',

            suiStats: null,
            suiStatsAddress: null,

            commonStats: {
                loadedTransactionsCount: 0,
            },

            transactions: [],
            days: [],

            isLoading: true,
		}
	},
    emits: ['suiStatsAddress'],
	watch: {
	},
	computed: {
	},
	components: {
        SignInWithSui,
        // DateHuman,
        DayView,
        EmptyDayView,
	},
	methods: {
        doOther() {
            if (this.suiStatsAddress) {
                this.suiStatsAddress.removeEventListener('transaction', this.onTransaction);
                this.suiStatsAddress.removeEventListener('day', this.onDay);
                this.suiStatsAddress.removeEventListener('done', this.onDone);
                this.suiStats.removeAddress(this.suiStatsAddress.address);
            }
            this.suiStatsAddress = null;
            this.transactions = [];
            this.days = [];

        },
        doRun() {
            if (this.suiStatsAddress) {
                this.suiStatsAddress.removeEventListener('transaction', this.onTransaction);
                this.suiStatsAddress.removeEventListener('day', this.onDay);
                this.suiStatsAddress.removeEventListener('done', this.onDone);
            }

            if (this.suiMaster && this.addressToRun.indexOf('0x') === 0) {
                this.suiStatsAddress = this.suiStats.forAddress(this.addressToRun);
                this.suiStatsAddress.addEventListener('transaction', this.onTransaction);
                this.suiStatsAddress.addEventListener('day', this.onDay);
                this.suiStatsAddress.addEventListener('done', this.onDone);
                this.suiStatsAddress.askFromRPC();
                this.isLoading = true;

                this.$emit('suiStatsAddress', this.suiStatsAddress);
            }
        },
        doStop() {
            this.isLoading = false;
            this.suiStatsAddress.stop();
        },
        onDone() {
            this.isLoading = false;
        },
        onSuiMaster(suiMaster) {
            this.$q.notify('SuiMaster is connected to '+suiMaster.connectedChain);

            this.suiMaster = suiMaster;
            this.suiStats = SuiStats.singleInstance({
                suiMaster: suiMaster,
            });

        },
        onTransaction(ev) {
            this.transactions.push(ev.detail);
        },
        onDay(ev) {
            this.days.push(ev.detail);
        },
        async interval() {
            if (!this.suiStatsAddress) {
                return false;
            }

            this.commonStats.loadedTransactionsCount = this.suiStatsAddress.loadedTransactionsCount;
        },
	},
	beforeMount: function() {
	},
	mounted: async function() {
        this.isLoading = true;
        this.$refs.sui.requestSuiMaster();

        this.__checkInterval = setInterval(()=>{
            this.interval();
        }, 500);
	},
    unmounted: function() {
        clearInterval(this.__checkInterval);
    },
}
</script>
