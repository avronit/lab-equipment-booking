import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { createBooking, deleteBooking } from '../api';
import { BookingInput, Station } from '../types';

type Props = { open: boolean; stations: Station[]; initial?: Partial<BookingInput> & { id?: number; station?: Station }; onClose: () => void; onSaved: () => void };
const empty: BookingInput = { userName: '', experimentName: '', description: '', stationId: 0, startDateTime: '', endDateTime: '' };
export default function BookingDialog({ open, stations, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<BookingInput>(empty); const [error, setError] = useState('');
  useEffect(() => { if (open) setForm({ ...empty, ...initial, stationId: initial?.stationId ?? stations[0]?.id ?? 0 }); }, [open, initial, stations]);
  const update = (key: keyof BookingInput, value: string | number) => setForm(current => ({ ...current, [key]: value }));
  const save = async () => { setError(''); try { await createBooking(form); onSaved(); onClose(); } catch (e: any) { setError(e.response?.data ?? 'Unable to save booking.'); } };
  const remove = async () => { if (!initial?.id) return; await deleteBooking(initial.id); onSaved(); onClose(); };
  const isDetails = Boolean(initial?.id);
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><DialogTitle>New reservation</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
    {error && <Alert severity="error">{error}</Alert>}
    <TextField label="User name" value={form.userName} onChange={e => update('userName', e.target.value)} required disabled={isDetails} />
    <TextField label="Experiment name" value={form.experimentName} onChange={e => update('experimentName', e.target.value)} required disabled={isDetails} />
    <TextField label="Description" multiline minRows={3} value={form.description} onChange={e => update('description', e.target.value)} disabled={isDetails} />
    <TextField select label="Equipment" value={form.stationId} onChange={e => update('stationId', Number(e.target.value))} disabled={isDetails}>{stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</TextField>
    <TextField label="Start" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.startDateTime} onChange={e => update('startDateTime', e.target.value)} required disabled={isDetails} />
    <TextField label="End" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.endDateTime} onChange={e => update('endDateTime', e.target.value)} required disabled={isDetails} />
  </Stack></DialogContent><DialogActions>{isDetails && <Button color="error" onClick={remove}>Delete booking</Button>}<Button onClick={onClose}>Close</Button>{!isDetails && <Button variant="contained" onClick={save} disabled={!form.userName || !form.experimentName || !form.startDateTime || !form.endDateTime}>Reserve</Button>}</DialogActions></Dialog>;
}
