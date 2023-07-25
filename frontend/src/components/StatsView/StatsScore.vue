<template>

    <q-card class="my-card score-card text-white non-selectable	" :style="{ backgroundColor: color }">
        <q-card-section>
            <div class="text-subtitle2">{{ name }}</div>
            <div class="text-h5">{{ valueToDisplay }}%</div>
        </q-card-section>
    </q-card>
    
</template>
    
<style lang="css">
    .score-card {
        transition: all ease-in 1s;
    }
</style>

<script>
    
    export default {
        name: 'StatsScore',
        props: {
            name: {
                type: String,
                default: '',
            },
            value: {
                type: Number,
                default: 100,
            },
        },
        data() {
            return {
                valueToDisplay: null,
                color: '#167D2E',
                colors: [
                    '#167D23',
                    '#277D16',
                    '#3C7D16',
                    '#3C7D16',
                    '#547D16',
                    '#6F7D16',
                    '#7D7316',
                    '#7D5B16',
                    '#7D4216',
                    '#7D2E16',
                    '#7D2E16',
                    '#7D1616',
                ],
            }
        },
        emits: [],
        watch: {
            value: function() {
                this.formatValue();
            },
        },
        computed: {
        },
        components: {
        },
        methods: {
            formatValue() {
                let asFloat = parseFloat(''+this.value, 10);
                if (asFloat < 0) {
                    asFloat = 0;
                }
                if (asFloat > 100) {
                    asFloat = 100;
                }

                this.valueToDisplay = asFloat.toFixed(2);
                this.color = this.colors[10 - Math.floor(asFloat / 10)];
            },
        },
        beforeMount: function() {
        },
        mounted: function() {
            this.formatValue();
        },
    }
    </script>
    