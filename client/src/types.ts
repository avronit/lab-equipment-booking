export type StationStatus = 'Available' | 'Occupied' | 'Maintenance';
export type Station = { id: number; name: string; status: StationStatus };
export type Booking = { id: number; userName: string; experimentName: string; description: string; stationId: number; station?: Station; startDateTime: string; endDateTime: string };
export type BookingInput = Omit<Booking, 'id' | 'station'>;
export type ReportRow = { key: string; bookingCount: number; totalUsageHours: number; experimentName: string; description: string; userName: string };
