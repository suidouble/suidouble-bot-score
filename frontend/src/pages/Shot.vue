<template>

    <div style="position: fixed; background-color: white; z-index: 9999999; top: 0px; left: 0px; right: 0px; bottom: 0px;">
        <CurrentScore :value="percent" />
    </div>
  
  </template>
  
  <script>
  import CurrentScore from '../components/Sidebar/CurrentScore.vue';
  
  export default {
      name: 'Shot',
      path: '/shot/:percent',
      props: {
      },
      components: {
        CurrentScore,
      },
      data() {
          return {
            percent: 0,
          }
      },
      watch: {
      },
      methods: {
      },
      computed: {
      },
      beforeMount() {
      },
      mounted() {
        this.percent = this.$route.params.percent || 0;
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
  
  