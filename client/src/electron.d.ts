type LocalState = {
	stations: import('./types').Station[];
	bookings: import('./types').Booking[];
};

interface Window {
	bookitLocal: {
		load: () => Promise<LocalState>;
		nextBookingId: () => Promise<number>;
		save: (state: LocalState) => Promise<LocalState>;
	};
}