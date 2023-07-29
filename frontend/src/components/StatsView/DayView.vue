<template>
    <q-timeline-entry
    :title="'' + statsByDay + ' transactions'"
    :subtitle="(suiStatsAddressDay.packedVersion != 1 && suiStatsAddressDay.packedVersion != 2 && suiStatsAddressDay.packedVersion != 3) ? suiStatsAddressDay.title : 'Day'"
    >

        <q-card @click="onClick">
            <q-tabs
            v-model="currentTab"
            dense
            class="text-grey non-selectable	"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
            >
                <q-tab name="txbyhour" label="TX/h" />
                <q-tab name="txdelay" label="TX delays" />
                <q-tab name="scores" label="Scores" />
            </q-tabs>

        <q-separator />

            <q-tab-panels v-model="currentTab" animated @transition="onPanelTransition">

                <q-tab-panel name="txbyhour">
                    <div class="text-subtitle2">Transactions Per Hour</div>
                    
                    <div style="height: 300px; position: relative; overflow: hidden;">
                    <ApexChartsAsync
                        type="bar"
                        :options="chartOptions1"
                        :series="calculated.series1" v-if="!isLoading"/>
                    </div>
                </q-tab-panel>
                <q-tab-panel name="txdelay">
                    <div class="text-subtitle2">Delay Between Tranasctions (ms)</div>
                    
                    <div style="height: 300px; position: relative; overflow: hidden;">
                    <ApexChartsAsync
                        type="line"
                        :options="chartOptions2"
                        :series="calculated.series2" v-if="!isLoading"/>
                    </div>
                </q-tab-panel>
                <q-tab-panel name="scores">
                    <div class="text-subtitle2">Human Scores</div>
                    <div style="height: 300px; position: relative; overflow: hidden;">

                        <div class="row items-start q-gutter-md">

                            <StatsScore name="24x7" :value="suiStatsAddressDay.getScore24()"/>
                            <StatsScore name="Anger" :value="suiStatsAddressDay.getScoreAnger()"/>
                            <StatsScore name="Manageable Anger" :value="suiStatsAddressDay.getScoreManageableAnger()"/>
                            <StatsScore name="Pomodoro" :value="suiStatsAddressDay.getScorePomodoro()"/>
                            <StatsScore name="Sui Apollo" :value="100"/>

                        </div>

                    </div>
                </q-tab-panel>

            </q-tab-panels>

        </q-card>

    </q-timeline-entry>

</template>

<style lang="css">

.apexcharts-tooltip {
		/*background: #f3f3f3;*/
		color: black;
	}
	.apexcharts-xaxis-label {
		fill: var(--text-color);
	}
	body.body--dark .apexcharts-xaxis-label {
		fill: var(--text-color-dark);
	}

</style>

<script>
import ApexChartsAsync from 'shared/components/AsyncComponents/ApexChartsAsync.js';
import StatsScore from './StatsScore.vue';

export default {
	name: 'DayView',
	props: {
        suiStatsAddressDay: {
            type: Object,
            default: null,
        },
	},
	data() {
		return {
            isLoading: true,
            currentTab: 'txbyhour',
			calculated: {
				series1: [
					{
						name: "series-1",
						data: [0, 0, 0, 0, 0, 0, 0, 0],
					},
				],
				categories1: [],
				series2: [
					{
						name: "series-1",
						data: [0, 0, 0, 0, 0, 0, 0, 0],
					},
				],
				categories2: [],
			},

            statsByDay: 0,
		}
	},
    emits: [],
	watch: {
	},
	computed: {
        txUpdated() {
            return this.suiStatsAddressDay.transactionsCount;
        },
		chartOptions1() {
			return {
				chart: {
					id: "vuechart-example",
					toolbar: {
						show: false,
					},
					height: 300,
				},
				grid: {
					padding: {
						left: 0,
						right: 0,
					},
				},
				colors: ['#4099ff'],
				tooltip: {
					// fillSeriesColor: true,
				},
				yaxis: {
					show: false,
				},
				xaxis: {
					categories: this.calculated.categories1,
					labels: {
						style: {
							cssClass: 'apexcharts-xaxis-label',
						},
					},
				},
			};
		},
		chartOptions2() {
			return {
				chart: {
					id: "vuechart-example",
					toolbar: {
						show: false,
					},
					height: 300,
				},
				grid: {
					padding: {
						left: 0,
						right: 0,
					},
				},
				colors: ['#4099ff55', '#4099ff', '#4099ff55'],
				tooltip: {
					// fillSeriesColor: true,
				},
				yaxis: {
					show: false,
				},
				xaxis: {
					categories: this.calculated.categories2,
					labels: {
						style: {
							cssClass: 'apexcharts-xaxis-label',
						},
					},
				},
			};
		},
	},
	components: {
        ApexChartsAsync,
        StatsScore,
	},
	methods: {
		onClick() {
			// console.error(this.suiStatsAddressDay.pack());
		},
        onPanelTransition() {
            setTimeout(()=>{
                this.updateChart1();
                this.updateChart2();
            }, 50);
        },
		updateChart1() {
			const serie = {
				name: 'Tx/H',
				data: [],
			};
			const categories = [];

            const hours = this.suiStatsAddressDay.hours;

			for (let hour of hours) {
				serie.data.push(hour.transactionsCount);

                let cName = hour.id;
                if (hour.id == 12) {
                    cName = '12pm';
                } else if (hour.id == 0) {
                    cName = '12am';
                } else if (hour.id >= 12) {
                    cName = '' +(hour.id - 12) + 'pm';
                } else {
                    cName = '' +(hour.id) + 'am';
                }

				categories.push(cName);
			}

			this.calculated.series1 = [serie];
			this.calculated.categories1 = categories;

            this.isLoading = false;
		},
		updateChart2() {
			const serie01 = {
				name: 'Delay Bottom 10%',
				data: [],
			};
			const serie05 = {
				name: 'Delay Median',
				data: [],
			};
			const serie09 = {
				name: 'Delay Top 10%',
				data: [],
			};
			const categories = [];

            const hours = this.suiStatsAddressDay.hours;

			for (let hour of hours) {
				serie01.data.push(hour.quantileDelay(0.1));
				serie05.data.push(hour.quantileDelay(0.5));
				serie09.data.push(hour.quantileDelay(0.9));

                let cName = hour.id;
                if (hour.id == 12) {
                    cName = '12pm';
                } else if (hour.id == 0) {
                    cName = '12am';
                } else if (hour.id >= 12) {
                    cName = '' +(hour.id - 12) + 'pm';
                } else {
                    cName = '' +(hour.id) + 'am';
                }

				categories.push(cName);
			}

			this.calculated.series2 = [serie01, serie05, serie09];
			this.calculated.categories2 = categories;

            this.isLoading = false;
		},
        onTransaction() {
            clearTimeout(this.__updateTimeout);
            this.__updateTimeout = setTimeout(()=>{
                this.updateChart1();
                this.updateChart2();
            }, 10);

            this.statsByDay = this.suiStatsAddressDay.transactionsCount;
        },
	},
	beforeMount: function() {
	},
	mounted: async function() {
        this.suiStatsAddressDay.addEventListener('transaction', this.onTransaction);
        this.onTransaction();

        setTimeout(()=>{
                this.updateChart1();
                this.updateChart2();
            }, 500);
	},
    beforeUnmount: function() {
        try {
            this.suiStatsAddressDay.removeEventListener('transaction', this.onTransaction);
            clearTimeout(this.__updateTimeout);            
        } catch (e) {
            console.error(e);
        }
    },
}
</script>
