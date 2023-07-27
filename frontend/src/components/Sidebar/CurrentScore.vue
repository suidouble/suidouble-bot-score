<template>

<div class="fixed-bottom" style="bottom: 50px;">
<div class="row">
        <div class="col-12 col-md-4">
            <div style="height: 350px; width: 400px; margin: 0 auto; overflow: hidden; position: relative;">
            <ApexChartsAsync
                type="radialBar"
                :options="chartOptions"
                :series="[valueToDisplay]"/>


                <q-inner-loading :showing="true" style="margin-top: -25px;" v-if="loading">
                    <q-spinner color="primary" size="3em" :thickness="4" />
                </q-inner-loading>
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
import ApexChartsAsync from 'shared/components/AsyncComponents/ApexChartsAsync.js';

export default {
	name: 'CurrentScore',
	props: {
        value: {
            type: Number,
            default: 99,
        },
        loading: {
            type: Boolean,
            default: false,
        },
	},
	data() {
		return {
            color: null,
            valueToDisplay: 35,
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
		chartOptions() {
            let labels = [
                'Extremely Likely a Human',
                'Very Likely a Human',
                'Likely a Human',
                'Not Sure a Human',
                'Slightly Likely a Human',
                'Not Likely Human At All',
            ];

            const label = labels[5 - Math.floor(this.value / 20)];

			return {
				chart: {
					id: "radialBar",
					toolbar: {
						show: false,
					},
					height: 350,
				},
                plotOptions: {
                    radialBar: {
                        startAngle: -135,
                        endAngle: 225,
                        hollow: {
                            margin: 0,
                            size: '70%',
                            background: '#fff',
                            image: undefined,
                            imageOffsetX: 0,
                            imageOffsetY: 0,
                            position: 'front',
                            dropShadow: {
                                enabled: false,
                                top: 3,
                                left: 0,
                                blur: 4,
                                opacity: 0.24
                            }
                        },
                        track: {
                            background: this.color,
                            strokeWidth: '37%',
                            margin: 0, // margin is in pixels
                            dropShadow: {
                                enabled: false,
                                top: -3,
                                left: 0,
                                blur: 4,
                                opacity: 0.35
                            }
                        },
                        dataLabels: {
                            show: true,
                            name: {
                                offsetY: -10,
                                show: true,
                                color: this.color,
                                fontSize: '17px'
                            },
                            value: {
                                formatter: function(val) {
                                    return ''+parseInt(val)+'%';
                                },
                                color: this.color,
                                fontSize: '36px',
                                show: true,
                            }
                        }
                    }
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shade: 'dark',
                        type: 'horizontal',
                        shadeIntensity: 0.5,
                        gradientToColors: [this.color],
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 100]
                    }
                },
                stroke: {
                    lineCap: 'round'
                },
                labels: [label],
			};
		},
	},
	components: {
        ApexChartsAsync,
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
        this.formatValue();
	},
	mounted: async function() {
	},
}
</script>
