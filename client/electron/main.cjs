const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { changeWorkbook, nextBookingId } = require('./workbook.cjs');

const dataDirectory = () => process.env.BOOKIT_DATA_DIR || path.join(app.getPath('documents'), 'Bookit');
const localFile = () => path.join(dataDirectory(), 'bookit-local.json');
const workbookFile = () => path.join(dataDirectory(), 'booking-data', 'LAB_EQUIPMENT_ALL_2026.xlsx');
const defaultStations = ['Sensys', 'C80 Calvet', 'Calvet DC', 'Alexsys', 'Themys LV', 'Themys', 'Labsys STA', 'STA449 Jupiter', 'DSC404', 'STA509 Jupiter', 'MicroDSC III', 'MicroDSC VII', 'DSC131', 'LFA467 HyperFlash', 'LFA467 HT HyperFlash', 'LFA427 HT HyperFlash', 'DIL L75 Horizontal', 'DIL L75 Vertical', 'DIL Vertical Combined with TGA-TOM', 'Levitation'].map((name, index) => ({ id: index + 1, name, status: 'Available' }));

async function readLocalState() {
	try {
		return JSON.parse(await fs.readFile(localFile(), 'utf8'));
	} catch (error) {
		if (error.code === 'ENOENT') return { stations: defaultStations, bookings: [] };
		throw error;
	}
}

ipcMain.handle('bookit:load', () => readLocalState());
ipcMain.handle('bookit:next-id', async () => nextBookingId(await fs.readFile(workbookFile()), await readLocalState()));
ipcMain.handle('bookit:save', async (_event, state) => {
	const previous = await readLocalState();
	const workbookPath = workbookFile();
	const original = await fs.readFile(workbookPath);
	const updated = changeWorkbook(original, previous, state);
	await fs.mkdir(path.dirname(localFile()), { recursive: true });
	const suffix = randomUUID();
	const jsonTemp = `${localFile()}.${suffix}.tmp`;
	const workbookTemp = `${workbookPath}.${suffix}.tmp`;
	const backup = `${workbookPath}.${suffix}.bak`;
	let workbookReplaced = false;
	try {
		await fs.writeFile(jsonTemp, JSON.stringify(state, null, 2), { encoding: 'utf8', flag: 'wx' });
		if (updated) {
			await fs.writeFile(workbookTemp, updated, { flag: 'wx' });
			await fs.copyFile(workbookPath, backup, require('node:fs').constants.COPYFILE_EXCL);
			if (!(await fs.readFile(backup)).equals(original)) throw new Error('The workbook changed while saving. Please retry.');
			await fs.rename(workbookTemp, workbookPath);
			workbookReplaced = true;
		}
		await fs.rename(jsonTemp, localFile());
	} catch (error) {
		if (workbookReplaced) {
			try {
				await fs.copyFile(backup, workbookPath);
			} catch (rollbackError) {
				throw new Error(`Saving failed: ${error.message}. Excel rollback also failed: ${rollbackError.message}. Restore the backup at ${backup}.`);
			}
		}
		throw new Error(`Unable to save booking and Excel workbook: ${error.message}`);
	} finally {
		await fs.rm(jsonTemp, { force: true });
		await fs.rm(workbookTemp, { force: true });
	}
	return state;
});

function createWindow() {
	const window = new BrowserWindow({
		width: 1440,
		height: 960,
		minWidth: 1024,
		minHeight: 700,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: path.join(__dirname, 'preload.cjs')
		}
	});

	if (!app.isPackaged) {
		window.loadURL('http://127.0.0.1:5173');
	} else {
		window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
	}
}

app.whenReady().then(() => {
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});