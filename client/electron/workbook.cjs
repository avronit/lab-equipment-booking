const XLSX = require('xlsx');

const headers = ['Booking ID', 'Equipment', 'User', 'Client', 'Material', 'Experiment', 'Description', 'Date', 'Total time'];
const fields = ['userName', 'experimentName', 'description', 'stationId', 'startDateTime', 'endDateTime'];

function openWorkbook(buffer) {
	const workbook = XLSX.read(buffer, { type: 'buffer', cellStyles: true });
	const sheet = workbook.Sheets['All bookings'];
	if (!sheet || !sheet['!ref']) throw new Error('The Excel workbook does not contain an All bookings sheet.');
	for (let column = 0; column < headers.length; column++) {
		const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: column })];
		if (!cell || cell.v !== headers[column]) throw new Error('The Excel workbook has unexpected column headers; no changes were made.');
	}
	return { workbook, sheet, range: XLSX.utils.decode_range(sheet['!ref']) };
}

function bookingRows(sheet, range, id) {
	const rows = [];
	for (let row = 1; row <= range.e.r; row++) {
		const cell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
		if (cell && String(cell.v) === String(id)) rows.push(row);
	}
	return rows;
}

function nextBookingId(buffer, state) {
	const { sheet, range } = openWorkbook(buffer);
	let max = state.bookings.reduce((value, booking) => Math.max(value, booking.id), 0);
	for (let row = 1; row <= range.e.r; row++) {
		const cell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
		if (cell && Number.isSafeInteger(Number(cell.v))) max = Math.max(max, Number(cell.v));
	}
	return max + 1;
}

function excelDate(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) throw new Error('The booking has an invalid date.');
	return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(1899, 11, 30)) / 86400000;
}

function rowValues(booking, state) {
	const station = state.stations.find(item => item.id === booking.stationId);
	if (!station) throw new Error('The booking equipment was not found.');
	const duration = (new Date(booking.endDateTime).getTime() - new Date(booking.startDateTime).getTime()) / 86400000;
	if (!Number.isFinite(duration) || duration <= 0) throw new Error('The booking has an invalid duration.');
	return [booking.id, station.name, booking.userName, booking.client ?? '', booking.material ?? '', booking.experimentName, booking.description ?? '', excelDate(booking.startDateTime), duration];
}

function changeWorkbook(buffer, before, after) {
	const oldById = new Map(before.bookings.map(booking => [booking.id, booking]));
	const changes = after.bookings.filter(booking => {
		const old = oldById.get(booking.id);
		return !old || fields.some(field => old[field] !== booking[field]);
	});
	if (changes.length === 0) return null;
	if (changes.length !== 1) throw new Error('Only one booking can be saved at a time.');
	const booking = changes[0];
	const old = oldById.get(booking.id);
	const { workbook, sheet, range } = openWorkbook(buffer);
	const rows = bookingRows(sheet, range, booking.id);
	let row;
	if (old) {
		if (rows.length !== 1) throw new Error('The matching Excel row was not found or is ambiguous; no changes were made.');
		row = rows[0];
		const expected = rowValues(old, before);
		for (const column of [1, 2, 5, 6, 7, 8]) {
			const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
			const actual = cell ? cell.v : '';
			const matches = column >= 7 ? Math.abs(Number(actual) - expected[column]) < 0.000001 : String(actual ?? '') === String(expected[column] ?? '');
			if (!matches) throw new Error('The Excel row differs from the calendar booking; no changes were made. Check the workbook before retrying.');
		}
	} else {
		if (rows.length) throw new Error('The new booking ID already exists in Excel; no changes were made.');
		row = range.e.r + 1;
	}
	const values = rowValues(booking, after);
	for (let column = 0; column < values.length; column++) {
		if (old && (column === 3 || column === 4)) continue;
		const address = XLSX.utils.encode_cell({ r: row, c: column });
		const previous = sheet[address];
		if (previous && previous.f) throw new Error('The Excel row contains a formula in a booking column; no changes were made.');
		sheet[address] = { ...previous, t: typeof values[column] === 'number' ? 'n' : 's', v: values[column] };
		delete sheet[address].w;
		if (column === 7) sheet[address].z = 'yyyy-mm-dd';
		if (column === 8) sheet[address].z = '[h]:mm';
	}
	range.e.r = Math.max(range.e.r, row);
	range.e.c = Math.max(range.e.c, headers.length - 1);
	sheet['!ref'] = XLSX.utils.encode_range(range);
	return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', cellStyles: true });
}

module.exports = { changeWorkbook, nextBookingId };
