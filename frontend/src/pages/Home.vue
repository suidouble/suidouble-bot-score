<template>

  <div>
    <div class="row">
        <div class="col-12 col-md-4">


            <q-banner class="bg-primary text-white q-mr-md" inline-actions >
                Determine if Sui account is a bot or a human. 
            </q-banner>

            <ScoreDisplay :suiStatsAddress="suiStatsAddress" />

        </div>
        <div class="col-12 col-md-8">
            <div>
                <StatsBuilder @suiStatsAddress="onSuiStatsAddress"/>

                <div style="height: 500px;"></div>
            </div>
        </div>
    </div>



  </div>

</template>

<script>
import StatsBuilder from '../components/StatsBuilder.vue';
// import CurrentScore from '../components/Sidebar/CurrentScore.vue';
import ScoreDisplay from '../components/Sidebar/ScoreDisplay.vue';

export default {
	name: 'Home',
    path: '/',
	props: {
	},
    components: {
        StatsBuilder,
        // CurrentScore,
        ScoreDisplay,
    },
	data() {
		return {
            chain: 'sui:mainnet',
            suiStatsAddress: null,
		}
	},
    watch: {
    },
	methods: {
        async switchTo(chainName) {
            this.chain = null;
            await new Promise((res)=>setTimeout(res, 500));
            this.chain = chainName;
        },
        onSuiStatsAddress(suiStatsAddress) {
            this.suiStatsAddress = suiStatsAddress;
        },
	},
    computed: {
    },
    beforeMount() {
    },
    mounted() {
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    h6 {
        font-size: 16px;
        font-weight: bold;
        margin: 0 0 16px 0;
    }

    h5 {
        margin: 0 0 16px 0;
    }

    .active_one {
        font-weight: bold;
    }

</style>

