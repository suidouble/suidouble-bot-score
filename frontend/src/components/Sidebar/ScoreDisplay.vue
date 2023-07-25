<template>

    <div class="fixed-bottom" style="bottom: 0px;">
    <div class="row" style="position: relative;">
            <div class="col-12 col-md-4">
                <div style="text-align: center; position: relative;">

                    <q-btn  color="primary" label="Mint as NFT" @click="doMint" disable  outline  />

                </div>
                <div style="height: 340px; width: 450px; margin: 0 auto; overflow: hidden; position: relative;">

                    <CurrentScore :value="currentScore" :loading="isLoading" />

                </div>
            </div>
            <div class="col-12 col-md-8">
            </div>
    </div>
    </div>
    
    </template>
    
    <style lang="css">
    
    </style>
    
    <script>
    import CurrentScore from './CurrentScore.vue';
    
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
            }
        },
        emits: [],
        watch: {
        },
        computed: {
        },
        components: {
            CurrentScore,
        },
        methods: {
            update() {
                if (this.suiStatsAddress) {
                    this.currentScore = this.suiStatsAddress.getCurrentScore();
                    this.isLoading = false;
                }
            },
            doMint() {

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
    