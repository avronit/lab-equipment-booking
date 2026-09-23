const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const localFile = () => path.join(app.getPath('userData'), 'bookit-local.json');
const defaultStations = ['Sensys', 'C80 Calvet', 'Calvet DC', 'Alexsys', 'Themys LV', 'Themys', 'Labsys STA', 'STA449 Jupiter', 'DSC404', 'STA509 Jupiter', 'MicroDSC III', 'MicroDSC VII', 'DSC131', 'LFA467 HyperFlash', 'LFA467 HT HyperFlash', 'LFA427 HT HyperFlash', 'DIL L75 Horizontal', 'DIL L75 Vertical', 'DIL Vertical Combined with TGA-TOM', 'Levitation'].map((name, index) => ({ id: index + 1, name, status: 'Available' }));

async function readLocalState() {
	try {
		return JSON.parse(await fs.readFile(localFile(), 'utf8'));
	} catch {
		return { stations: defaultStations, bookings: [] };
	}
}

ipcMain.handle('bookit:load', () => readLocalState());
ipcMain.handle('bookit:save', async (_event, state) => {
		await fs.mkdir(path.dirname(localFile()), { recursive: true });
		await fs.writeFile(localFile(), JSON.stringify(state, null, 2), 'utf8');
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