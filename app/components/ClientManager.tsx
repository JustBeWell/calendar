/**
 * Componente para gestionar clientes/trabajos
 * Permite crear, editar y eliminar clientes
 */
'use client';

import { useState, useEffect } from 'react';
import { Client } from '../types';
import { ClientStorage, WorkEntryStorage, generateId } from '../storage';

export default function ClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    setClients(ClientStorage.getAll());
  }, []);

  const loadData = () => {
    setClients(ClientStorage.getAll());
  };

  // Iniciar modo añadir
  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ name: '' });
    setError('');
  };

  // Iniciar modo editar
  const startEditing = (client: Client) => {
    setEditingId(client.id);
    setIsAdding(false);
    setFormData({ name: client.name });
    setError('');
  };

  // Cancelar formulario
  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '' });
    setError('');
  };

  // Guardar cliente (nuevo o editado)
  const saveClient = () => {
    const name = formData.name.trim();
    
    if (!name) {
      setError('El nombre no puede estar vacío');
      return;
    }

    // Verificar que no exista otro cliente con el mismo nombre
    const existing = clients.find(
      c => c.name.toLowerCase() === name.toLowerCase() && c.id !== editingId
    );
    if (existing) {
      setError('Ya existe un cliente con ese nombre');
      return;
    }

    if (editingId) {
      // Actualizar existente
      ClientStorage.update(editingId, { name });
    } else {
      // Crear nuevo
      const newClient: Client = {
        id: generateId(),
        name,
        createdAt: new Date().toISOString(),
      };
      ClientStorage.save(newClient);
    }

    cancelForm();
    loadData();
  };

  // Eliminar cliente
  const deleteClient = (clientId: string) => {
    const entries = WorkEntryStorage.getByClient(clientId);
    
    if (entries.length > 0) {
      alert(
        `No se puede eliminar este cliente porque tiene ${entries.length} registro(s) de horas asociados. ` +
        'Elimina primero las entradas de trabajo.'
      );
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      ClientStorage.delete(clientId);
      loadData();
    }
  };

  // Obtener número de entradas por cliente
  const getEntriesCount = (clientId: string): number => {
    return WorkEntryStorage.getByClient(clientId).length;
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-neutral-900">
          Gestión de Clientes
        </h2>
        {!isAdding && !editingId && (
          <button
            onClick={startAdding}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span className="text-lg">+</span> Nuevo Cliente
          </button>
        )}
      </div>

      {/* Formulario para nuevo/editar cliente */}
      {(isAdding || editingId) && (
        <div className="mb-4 sm:mb-6 p-4 sm:p-5 border-2 border-blue-300 rounded-xl bg-blue-50/50">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-neutral-900">
            {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Nombre del Cliente/Trabajo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ name: e.target.value })}
                onKeyPress={e => e.key === 'Enter' && saveClient()}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Ej: Academia X, Cliente A..."
                autoFocus
              />
              {error && (
                <div className="text-red-600 text-sm mt-2 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
              )}
            </div>
            <div className="flex sm:items-end gap-2">
              <button
                onClick={saveClient}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm"
              >
                Guardar
              </button>
              <button
                onClick={cancelForm}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      {clients.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-lg mb-2 text-neutral-700 font-medium">No tienes clientes/trabajos creados</p>
          <p className="text-sm">Crea uno para empezar a registrar horas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => {
            const entriesCount = getEntriesCount(client.id);
            const isEditing = editingId === client.id;

            return (
              <div
                key={client.id}
                className={`border rounded-xl p-4 sm:p-5 transition-all ${
                  isEditing
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">
                          {client.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 font-medium">
                          {entriesCount === 0 
                            ? '📭 Sin registros de horas' 
                            : `📊 ${entriesCount} registro${entriesCount > 1 ? 's' : ''} de horas`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  {!isAdding && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => startEditing(client)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm text-sm sm:text-base"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm text-sm sm:text-base"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
