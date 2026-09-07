import axios from 'axios';
import { Booking, BookingInput, ReportRow, Station } from './types';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api' });
export const getStations = () => api.get<Station[]>('/stations').then(r => r.data);
export const getBookings = () => api.get<Booking[]>('/bookings').then(r => r.data);
export const createBooking = (input: BookingInput) => api.post<Booking>('/bookings', input).then(r => r.data);
export const deleteBooking = (id: number) => api.delete(`/bookings/${id}`);
export const getUserReport = () => api.get<ReportRow[]>('/reports/users').then(r => r.data);
export const getStationReport = () => api.get<ReportRow[]>('/reports/stations').then(r => r.data);
