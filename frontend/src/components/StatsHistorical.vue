<template>

    <div>
        <SignInWithSui :defaultChain="defaultChain" @suiMaster="onSuiMaster" ref="sui" :visible="false" />

        <q-timeline color="primary">
            <q-timeline-entry heading>
                <q-banner class="bg-primary text-white" inline-actions style="margin-bottom: -16px;">
                    Metadata for nft {{ nftId }}
                    <q-spinner-dots
                    color="white"
                    size="2em"
                    v-if="isLoading"
                    />

                    <template v-slot:action>
                        <q-btn flat color="white" label="Try Other" href="/" v-if="!isLoading"/>
                    </template>
                </q-banner>

                <q-banner class="bg-primary text-white" inline-actions style="margin-bottom: -16px;" v-if="forAddress">
                    Generated for {{ forAddress }}
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
import SuiStatsAddress from './SuiStatsAddress.js';
// const SuiStatsAddress = require('./SuiStatsAddress.js');

export default {
	name: 'StatsHistorical',
	props: {
        nftId: {
            type: String,
            default: null,
        },
	},
	data() {
		return {
            defaultChain: 'sui:mainnet',

            suiStatsAddress: null,
            days: [],

            isLoading: true,
            isLoaded: false,

            forAddress: null,
		}
	},
    emits: ['suiStatsAddress', 'score'],
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
        async loadFromBlockchain() {
            const contractAddress = '0xf4517da5dbd2379382d7d09934308aa55c5fdd9a9b0684c3e12e5e997cf5ce2c';

            const contract = this.suiMaster.addPackage({ id: contractAddress, });
            await contract.isOnChain();  
            const contractModule = await contract.getModule('suidouble_score');
            contractModule.pushObject(this.nftId);

            await contractModule.fetchObjects();

            const object = contractModule.objectStorage.byAddress(this.nftId);

            console.error('object', object, object.fields, object.display);

            if (object && object.fields && object.fields.metadata) {
                this.isLoaded = true;

                this.$emit('score', parseInt(''+object.fields.score, 10));

                const forAddress = object.fields.for;
                this.forAddress = forAddress;

                const metadata = object.fields.metadata;
                const suiStatsAddress = SuiStatsAddress.unpack(metadata, {
                    suiMaster: this.suiMaster,
                    address: forAddress,
                });

                console.error(suiStatsAddress);

                this.suiStatsAddress = suiStatsAddress;

                const days = suiStatsAddress.days;
                for (const day of days) {
                    this.days.push(day);
                }
            } else {
                this.$q.notify('Can not get score metadata from blockchain for '+this.nftId);
            }

            this.isLoading = false;
        },
        onSuiMaster(suiMaster) {
            this.$q.notify('SuiMaster is connected to '+suiMaster.connectedChain);
            this.suiMaster = suiMaster;

            this.loadFromBlockchain();
        },
        interval() {

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
