<template>

    <div class="fixed-bottom" style="bottom: 50px; z-index: 99999;">
    <div class="row" style="position: relative;">
            <div class="col-12 col-md-4">
                <div style="text-align: center; position: relative; bottom: 10px;">

                    <q-btn  color="primary" label="Mint as NFT" @click="doMint"  :outline="minted" />

                </div>
                <div style="height: 340px; width: 450px; margin: 0 auto; overflow: hidden; position: relative;">

                    <CurrentScore :value="currentScore" :loading="isLoading" />

                </div>
            </div>
            <div class="col-12 col-md-8">
                <SignInWithSui :defaultChain="'sui:mainnet'" @suiMaster="onSuiMaster" ref="sui" :visible="false" />
            </div>
    </div>
    </div>
    
    </template>
    
    <style lang="css">
    
    </style>
    
    <script>
    import { SignInWithSui } from 'vue-sui';
    import CurrentScore from './CurrentScore.vue';
    // const SuiStatsAddress = require('../SuiStatsAddress.js');
    
    export default {
        name: 'ScoreDisplay',
        props: {
            suiStatsAddress: {
                type: Object,
                default: null,
            },
        },
        data() {
            return {
                currentScore: 100,
                isLoading: true,

                readyForTheMint: false,
                minted: false,
            }
        },
        emits: [],
        watch: {
        },
        computed: {
        },
        components: {
            CurrentScore,
            SignInWithSui,
        },
        methods: {
            onSuiMaster() {

            },
            update() {
                if (this.suiStatsAddress) {
                    this.currentScore = this.suiStatsAddress.getCurrentScore();
                    this.isLoading = false;

                    if (this.suiStatsAddress.readyForTheMint()) {
                        this.readyForTheMint = true;
                    } else {
                        this.readyForTheMint = false;
                    }
                }
            },
            async doMint() {
                if (!this.suiStatsAddress || !this.suiStatsAddress.readyForTheMint()) {
                    this.$q.notify('First run it to generate some data for at least few days');

                    return false;
                }
                const suiMaster = await this.$refs.sui.requestConnectedSuiMaster();

                const packed = this.suiStatsAddress.pack();

                const maintainer = '0x9bce0dae44d227a3ed945a686e2e61e7583a1cf39a0b8f95078972b56648a961';
                const contractAddress = '0xf4517da5dbd2379382d7d09934308aa55c5fdd9a9b0684c3e12e5e997cf5ce2c';
                const score = parseInt(''+this.currentScore, 10);

                const metadata = packed;
                const forAddress = this.suiStatsAddress.address;

                if (forAddress != suiMaster.address) {
                    this.$q.notify('Note: NFT will be minted for '+forAddress);
                }

                const contract = suiMaster.addPackage({ id: contractAddress, });
                await contract.isOnChain();  

                const module = await contract.getModule('suidouble_score');

                const moveCallParams = [
                    maintainer,
                    [{ type: 'SUI', amount: 200000000 }], // fee as vector<Coin<SUI>>
                    score,
                    forAddress,
                    metadata,
                ];

                const res = await module.moveCall('mint', moveCallParams);

                if (res && res.status && res.status == 'success') {
                    this.minted = true;
                }                
            },
        },
        beforeMount: function() {
        },
        mounted: async function() {
            this.__updateInterval = setInterval(this.update, 500);
        },
        unmounted: function() {
            clearTimeout(this.__updateInterval);
        },
    }
    </script>
    