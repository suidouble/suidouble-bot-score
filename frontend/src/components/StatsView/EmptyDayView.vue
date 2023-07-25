<template>

<q-timeline-entry
    v-if="show"
    :subtitle="'No transactions for ' + skipDays + ' days'" />

</template>

<style lang="css"></style>

<script>

export default {
	name: 'EmptyDayView',
	props: {
        suiStatsAddressDay: {
            type: Object,
            default: null,
        },
        suiStatsAddress: {
            type: Object,
            default: null,
        },
	},
	data() {
		return {
            show: false,
            skipDays: 0,
		}
	},
    emits: [],
	watch: {
	},
	computed: {
	},
	components: {
	},
	methods: {
	},
	beforeMount: function() {
	},
	mounted: function() {
        if (!this.suiStatsAddress.hasEmptyDaysAfter(this.suiStatsAddressDay.forTheDate)) {
            this.show = true;
        } else {
            this.show = false;
        }

        // if no recent trasacations till
        const checkDate = new Date(this.suiStatsAddressDay.forTheDate);
        checkDate.setUTCDate(checkDate.getUTCDate() + 1);
        if (checkDate.getTime() > (new Date()).getTime()) {
            this.show = true;
        }

        this.skipDays = this.suiStatsAddress.emptyDaysBefore(this.suiStatsAddressDay.forTheDate);
	},
}
</script>
