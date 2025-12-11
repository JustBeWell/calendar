/**
 * Modal para gestionar las horas trabajadas en un día específico
 * Sistema robusto con validación de horas enteras y medias horas
 */
'use client';

import { useState, useEffect } from 'react';
import { WorkEntry, Client } from '../types';
import { WorkEntryStorage, ClientStorage, generateId, ConfigStorage } from '../storage';
import { parseDate, validateHours, formatCurrency } from '../utils';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

interface DayModalProps {
  date: string;
  onClose: () => void;
}

export default function DayModal({ date, onClose }: DayModalProps) {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hourlyRate, setHourlyRate] = useState(10);
  
  // Confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    hours: '',
    clientId: '',
    note: '',
  });
  const [error, setError] = useState('');

  const loadData = () => {
    setEntries(WorkEntryStorage.getByDate(date));
    setClients(ClientStorage.getAll());
    setHourlyRate(ConfigStorage.get().hourlyRate);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const dateObj = parseDate(date);
  const dateString = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ hours: '', clientId: '', note: '' });
    setError('');
  };

  const startEditing = (entry: WorkEntry) => {
    setEditingId(entry.id);
    setIsAdding(false);
    setFormData({
      hours: entry.hours.toString(),
      clientId: entry.clientId,
      note: entry.note || '',
    });
    setError('');
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ hours: '', clientId: '', note: '' });
    setError('');
  };

  const saveEntry = () => {
    // Validaciones
    if (!formData.clientId) {
      setError('Debes seleccionar un cliente/trabajo');
      return;
    }

    const hours = parseFloat(formData.hours);
    if (isNaN(hours)) {
      setError('Introduce un número válido de horas');
      return;
    }

    const validation = validateHours(hours);
    if (!validation.valid) {
      setError(validation.error || 'Horas inválidas');
      return;
    }

    if (editingId) {
      WorkEntryStorage.update(editingId, {
        hours,
        clientId: formData.clientId,
        note: formData.note || undefined,
      });
    } else {
      const newEntry: WorkEntry = {
        id: generateId(),
        date,
        hours,
        clientId: formData.clientId,
        note: formData.note || undefined,
      };
      WorkEntryStorage.save(newEntry);
    }

    cancelForm();
    loadData();
  };

  const confirmDelete = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteConfirm(true);
  };

  const deleteEntry = () => {
    if (entryToDelete) {
      WorkEntryStorage.delete(entryToDelete);
      setEntryToDelete(null);
      loadData();
    }
  };

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const totalAmount = totalHours * hourlyRate;

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={dateString.charAt(0).toUpperCase() + dateString.slice(1)}
        size="lg"
      >
        {/* Resumen del día */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
          <div className="grid grid-cols-2 gap-4 sm:gap-0 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm mb-1 font-medium">Total del Día</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalHours}h</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-xs sm:text-sm mb-1 font-medium">A Cobrar</p>
              <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Lista de entradas */}
        {entries.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-neutral-900">
              Horas registradas
            </h3>
            <div className="space-y-3">
              {entries.map(entry => {
                const client = clients.find(c => c.id === entry.clientId);
                const isEditing = editingId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isEditing ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-neutral-200 bg-white hover:shadow-sm'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                              Horas *
                            </label>
                            <input
                              type="number"
                              min="0.5"
                              max="24"
                              step="0.5"
                              value={formData.hours}
                              onChange={e => setFormData({ ...formData, hours: e.target.value })}
                              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                              placeholder="Ej: 8 o 8.5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                              Cliente/Trabajo *
                            </label>
                            <select
                              value={formData.clientId}
                              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                              <option value="">Seleccionar...</option>
                              {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                  {client.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Nota (opcional)
                          </label>
                          <input
                            type="text"
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Descripción del trabajo..."
                          />
                        </div>
                        {error && (
                          <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg font-medium">
                            {error}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={saveEntry}
                            className="flex-1 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelForm}
                            className="flex-1 px-5 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition font-medium"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-900 text-base sm:text-lg">
                            {client?.name || 'Cliente desconocido'}
                          </div>
                          <div className="text-sm text-neutral-600 mt-1.5 font-medium">
                            {entry.hours}h • {formatCurrency(entry.hours * hourlyRate)}
                          </div>
                          {entry.note && (
                            <div className="text-sm text-neutral-500 mt-2 italic bg-neutral-50 px-3 py-2 rounded-lg">
                              {entry.note}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => startEditing(entry)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => confirmDelete(entry.id)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Formulario para nueva entrada */}
        {isAdding ? (
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 sm:p-5 bg-blue-50/50">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-neutral-900">
              Nueva entrada
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Horas *
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={formData.hours}
                    onChange={e => setFormData({ ...formData, hours: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Ej: 8 o 8.5"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Horas enteras o medias (0.5 en 0.5)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Cliente/Trabajo *
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Seleccionar...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Descripción del trabajo..."
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg font-medium">
                  {error}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveEntry}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm flex-1"
                >
                  Añadir
                </button>
                <button
                  onClick={cancelForm}
                  className="px-6 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition font-medium flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : !editingId && (
          <button
            onClick={startAdding}
            className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition font-medium"
          >
            + Añadir horas trabajadas
          </button>
        )}

        {/* Advertencia si no hay clientes */}
        {clients.length === 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-xl">
            <p className="text-amber-800 text-sm font-medium">
              ⚠️ No tienes clientes/trabajos creados. Ve a la pestaña &quot;Clientes&quot; para crear uno.
            </p>
          </div>
        )}
      </Modal>

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deleteEntry}
        title="Eliminar entrada"
        message="¿Estás seguro de que quieres eliminar esta entrada de horas? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
}
