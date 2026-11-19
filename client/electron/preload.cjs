const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bookitLocal', {
	load: () => ipcRenderer.invoke('bookit:load'),
	nextBookingId: () => ipcRenderer.invoke('bookit:next-id'),
	save: state => ipcRenderer.invoke('bookit:save', state)
});