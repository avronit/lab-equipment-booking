import { Booking, BookingInput, Station } from './types';

export type BookingState = { stations: Station[]; bookings: Booking[] };

export function validateBooking(state: BookingState, input: BookingInput, exceptId?: number) {
  const start = new Date(input.startDateTime).getTime();
  const end = new Date(input.endDateTime).getTime();
  if (!input.userName.trim() || !input.experimentName.trim()) throw new Error('User name and experiment name are required.');
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('End time must be after start time.');
  if (!state.stations.some(station => station.id === input.stationId)) throw new Error('Equipment was not found.');
  if (state.bookings.some(booking => booking.id !== exceptId && booking.stationId === input.stationId && start < new Date(booking.endDateTime).getTime() && end > new Date(booking.startDateTime).getTime())) {
    throw new Error('This equipment is already reserved for that time.');
  }
}

export function updateBookingState(state: BookingState, id: number, input: BookingInput): BookingState {
  if (!state.bookings.some(booking => booking.id === id)) throw new Error('Booking was not found.');
  validateBooking(state, input, id);
  return {
    ...state,
    bookings: state.bookings.map(booking => booking.id === id
      ? { ...booking, ...input, station: state.stations.find(station => station.id === input.stationId) }
      : booking)
  };
}
