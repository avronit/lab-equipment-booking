import { Booking, BookingInput, ReportRow, Station } from './types';
import { updateBookingState, validateBooking } from './bookingState';

const load = () => window.bookitLocal.load();
const save = (state: { stations: Station[]; bookings: Booking[] }) => window.bookitLocal.save(state);

export const getLocalStations = async () => (await load()).stations;
export const getLocalBookings = async () => {
	const state = await load();
	return state.bookings.map(booking => ({ ...booking, station: state.stations.find(station => station.id === booking.stationId) }));
};

export const createLocalBooking = async (input: BookingInput) => {
	const state = await load();
	validateBooking(state, input);
	const booking: Booking = { ...input, id: await window.bookitLocal.nextBookingId(), station: state.stations.find(station => station.id === input.stationId) };
	await save({ ...state, bookings: [...state.bookings, booking] });
	return booking;
};

export const updateLocalBooking = async (id: number, input: BookingInput) => {
	const state = updateBookingState(await load(), id, input);
	await save(state);
};

export const deleteLocalBooking = async (id: number) => {
	const state = await load();
	await save({ ...state, bookings: state.bookings.filter(booking => booking.id !== id) });
};

const report = async (byStation: boolean): Promise<ReportRow[]> => {
	const bookings = await getLocalBookings();
	const groups = new Map<string, ReportRow>();
	bookings.forEach(booking => {
		const key = byStation ? booking.station?.name ?? 'Unknown equipment' : booking.userName;
		const current = groups.get(key) ?? { key, bookingCount: 0, totalUsageHours: 0, experimentName: booking.experimentName, description: booking.description, userName: booking.userName };
		current.bookingCount += 1;
		current.totalUsageHours += (new Date(booking.endDateTime).getTime() - new Date(booking.startDateTime).getTime()) / 3600000;
		groups.set(key, current);
	});
	return [...groups.values()];
};

export const getLocalUserReport = () => report(false);
export const getLocalStationReport = () => report(true);