import { Booking, BookingInput, ReportRow, Station } from './types';

const load = () => window.bookitLocal.load();
const save = (state: { stations: Station[]; bookings: Booking[] }) => window.bookitLocal.save(state);

export const getLocalStations = async () => (await load()).stations;
export const getLocalBookings = async () => {
	const state = await load();
	return state.bookings.map(booking => ({ ...booking, station: state.stations.find(station => station.id === booking.stationId) }));
};

export const createLocalBooking = async (input: BookingInput) => {
	const state = await load();
	const start = new Date(input.startDateTime).getTime();
	const end = new Date(input.endDateTime).getTime();
	if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('End time must be after start time.');
	if (state.bookings.some(booking => booking.stationId === input.stationId && start < new Date(booking.endDateTime).getTime() && end > new Date(booking.startDateTime).getTime())) throw new Error('This equipment is already reserved for that time.');
	const booking: Booking = { ...input, id: state.bookings.reduce((max, current) => Math.max(max, current.id), 0) + 1, station: state.stations.find(station => station.id === input.stationId) };
	await save({ ...state, bookings: [...state.bookings, booking] });
	return booking;
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