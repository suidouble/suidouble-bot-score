
// import { useSessionUserStore } from './sessionUser.js';
// import { useApiStore } from './api.js';
import { useColorStore } from './color.js';

export default () => {
	return {
		color: useColorStore(),
		// sessionUser: useSessionUserStore(),
		// settings: useSettingsStore(),
	}
};