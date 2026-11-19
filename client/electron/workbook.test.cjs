const test = require('node:test');
const assert = require('node:assert/strict');
const XLSX = require('xlsx');
const { changeWorkbook, nextBookingId } = require('./workbook.cjs');

const stations = [{ id: 1, name: 'Sensys' }, { id: 2, name: 'C80 Calvet' }];
const booking = { id: 2, userName: 'Test user', experimentName: 'Test', description: 'Original', stationId: 1, startDateTime: '2026-11-19T10:00:00', endDateTime: '2026-11-19T12:00:00' };
const state = { stations, bookings: [booking] };
const headers = ['Booking ID', 'Equipment', 'User', 'Client', 'Material', 'Experiment', 'Description', 'Date', 'Total time'];
const excelDate = (Date.UTC(2026, 10, 19) - Date.UTC(1899, 11, 30)) / 86400000;
function fixture() {
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([headers, [2, 'Sensys', 'Test user', 'Old client', 'Old material', 'Test', 'Original', excelDate, 2 / 24], [8, 'Historical', 'Other user', '', '', 'Old', '', excelDate, 1 / 24]]), 'All bookings');
	XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Keep this sheet']]), 'Equipment');
	return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
function rows(buffer) {
	const workbook = XLSX.read(buffer);
	return { workbook, rows: XLSX.utils.sheet_to_json(workbook.Sheets['All bookings'], { header: 1, defval: '' }) };
}

test('editing updates only the matching booking and preserves history and other sheets', () => {
	const edited = { ...booking, experimentName: 'Changed', stationId: 2 };
	const result = rows(changeWorkbook(fixture(), state, { stations, bookings: [edited] }));
	assert.deepEqual(result.rows[1].slice(0, 7), [2, 'C80 Calvet', 'Test user', 'Old client', 'Old material', 'Changed', 'Original']);
	assert.equal(result.rows[2][1], 'Historical');
	assert.equal(result.workbook.Sheets.Equipment.A1.v, 'Keep this sheet');
});

test('new bookings are appended with an unused ID', () => {
	const original = fixture();
	assert.equal(nextBookingId(original, state), 9);
	const added = { ...booking, id: 9 };
	const result = rows(changeWorkbook(original, state, { stations, bookings: [booking, added] }));
	assert.equal(result.rows.length, 4);
	assert.equal(result.rows[2][1], 'Historical');
	assert.equal(result.rows[3][0], 9);
});

test('conflicting or changed workbook rows are not overwritten', () => {
	const edited = { ...booking, description: 'Changed' };
	assert.throws(() => changeWorkbook(fixture(), { stations, bookings: [{ ...booking, userName: 'Different' }] }, { stations, bookings: [edited] }), /differs/);
	assert.throws(() => changeWorkbook(fixture(), state, { stations, bookings: [booking, { ...booking, id: 8 }] }), /already exists/);
});

test('deleting a calendar booking leaves its workbook history unchanged', () => {
	assert.equal(changeWorkbook(fixture(), state, { stations, bookings: [] }), null);
});
