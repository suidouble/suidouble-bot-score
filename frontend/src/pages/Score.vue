<template>

    <div>
      <div class="row">
          <div class="col-12 col-md-4">
  
  
              <q-banner class="bg-primary text-white q-mr-md" inline-actions >
                  Determine if Sui account is a bot or a human. <br /><br />
  
                  No need to connect a wallet to check the score.<br />Just paste an address and press "Check"
              </q-banner>
  
              <ScoreDisplay :score="score" />
  
          </div>
          <div class="col-12 col-md-8">
              <div>
                  <StatsHistorical :nftId="nftId" @score="onScore" />
  
                  <div style="height: 500px;"></div>
              </div>
          </div>
      </div>
  
  
  
    </div>
  
</template>
  
<script>
import StatsHistorical from '../components/StatsHistorical.vue';
// import CurrentScore from '../components/Sidebar/CurrentScore.vue';
import ScoreDisplay from '../components/Sidebar/ScoreDisplay.vue';
  
export default {
    name: 'Score Page',
    path: '/score/:id',
    props: {
    },
    components: {
        StatsHistorical,
        ScoreDisplay,
    },
    data() {
        return {
            nftId: null,
            score: null,
        }
    },
    watch: {
    },
    methods: {
        onScore(score) {
            this.score = score;
        }
    },
    computed: {
    },
    beforeMount() {
    },
    mounted() {
        this.nftId = this.$route.params.id;
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
  
  </style>
  
  