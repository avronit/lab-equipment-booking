import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { createBooking, deleteBooking, updateBooking } from '../api';
import { BookingInput, Station } from '../types';

type Props = { open: boolean; stations: Station[]; initial?: Partial<BookingInput> & { id?: number; station?: Station }; onClose: () => void; onSaved: () => void };
const empty: BookingInput = { userName: '', experimentName: '', description: '', stationId: 0, startDateTime: '', endDateTime: '' };

function localDateTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function message(error: unknown) {
  if (axios.isAxiosError(error) && typeof error.response?.data === 'string') return error.response.data;
  return error instanceof Error ? error.message : 'Unable to save booking.';
}

export default function BookingDialog({ open, stations, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<BookingInput>(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      setError('');
      setForm({
        ...empty, ...initial,
        stationId: initial?.stationId ?? stations[0]?.id ?? 0,
        startDateTime: localDateTime(initial?.startDateTime ?? ''),
        endDateTime: localDateTime(initial?.endDateTime ?? '')
      });
    }
  }, [open, initial, stations]);
  const update = (key: keyof BookingInput, value: string | number) => setForm(current => ({ ...current, [key]: value }));
  const save = async () => {
    setError('');
    setSaving(true);
    try {
      if (initial?.id) await updateBooking(initial.id, form);
      else await createBooking(form);
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(message(e));
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!initial?.id) return;
    setError('');
    setSaving(true);
    try {
      await deleteBooking(initial.id);
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(message(e));
    } finally {
      setSaving(false);
    }
  };
  const isEditing = Boolean(initial?.id);
  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm"><DialogTitle>{isEditing ? 'Edit reservation' : 'New reservation'}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
    {error && <Alert severity="error">{error}</Alert>}
    <TextField label="User name" value={form.userName} onChange={e => update('userName', e.target.value)} required disabled={saving} />
    <TextField label="Experiment name" value={form.experimentName} onChange={e => update('experimentName', e.target.value)} required disabled={saving} />
    <TextField label="Description" multiline minRows={3} value={form.description} onChange={e => update('description', e.target.value)} disabled={saving} />
    <TextField select label="Equipment" value={form.stationId} onChange={e => update('stationId', Number(e.target.value))} disabled={saving}>{stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</TextField>
    <TextField label="Start" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.startDateTime} onChange={e => update('startDateTime', e.target.value)} required disabled={saving} />
    <TextField label="End" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.endDateTime} onChange={e => update('endDateTime', e.target.value)} required disabled={saving} />
  </Stack></DialogContent><DialogActions>{isEditing && <Button color="error" onClick={remove} disabled={saving}>Delete booking</Button>}<Button onClick={onClose} disabled={saving}>Close</Button><Button variant="contained" onClick={save} disabled={saving || !form.userName.trim() || !form.experimentName.trim() || !form.startDateTime || !form.endDateTime}>{isEditing ? 'Save changes' : 'Reserve'}</Button></DialogActions></Dialog>;
}
