const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bookitLocal', {
	load: () => ipcRenderer.invoke('bookit:load'),
	save: state => ipcRenderer.invoke('bookit:save', state)
});