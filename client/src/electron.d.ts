type LocalState = {
	stations: import('./types').Station[];
	bookings: import('./types').Booking[];
};

interface Window {
	bookitLocal: {
		load: () => Promise<LocalState>;
		save: (state: LocalState) => Promise<LocalState>;
	};
}