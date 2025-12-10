/**
 * Servicio de almacenamiento local para gestionar datos en localStorage
 */

import { Client, WorkEntry, AppConfig } from './types';

// Claves para localStorage
const STORAGE_KEYS = {
  CLIENTS: 'worktime_clients',
  ENTRIES: 'worktime_entries',
  CONFIG: 'worktime_config',
};

// Configuración por defecto
const DEFAULT_CONFIG: AppConfig = {
  hourlyRate: 10,
};

/**
 * Gestión de clientes/trabajos
 */
export const ClientStorage = {
  // Obtener todos los clientes
  getAll(): Client[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },

  // Guardar un nuevo cliente
  save(client: Client): void {
    const clients = this.getAll();
    clients.push(client);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  // Actualizar un cliente existente
  update(clientId: string, updates: Partial<Client>): void {
    const clients = this.getAll();
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    }
  },

  // Eliminar un cliente
  delete(clientId: string): boolean {
    // Verificar que no tenga entradas de trabajo asociadas
    const entries = WorkEntryStorage.getByClient(clientId);
    if (entries.length > 0) {
      return false; // No se puede eliminar si tiene registros
    }
    
    const clients = this.getAll();
    const filtered = clients.filter(c => c.id !== clientId);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(filtered));
    return true;
  },

  // Obtener un cliente por ID
  getById(clientId: string): Client | undefined {
    return this.getAll().find(c => c.id === clientId);
  },
};

/**
 * Gestión de entradas de trabajo (horas)
 */
export const WorkEntryStorage = {
  // Obtener todas las entradas
  getAll(): WorkEntry[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? JSON.parse(data) : [];
  },

  // Guardar una nueva entrada
  save(entry: WorkEntry): void {
    const entries = this.getAll();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  },

  // Actualizar una entrada existente
  update(entryId: string, updates: Partial<WorkEntry>): void {
    const entries = this.getAll();
    const index = entries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    }
  },

  // Eliminar una entrada
  delete(entryId: string): void {
    const entries = this.getAll();
    const filtered = entries.filter(e => e.id !== entryId);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filtered));
  },

  // Obtener entradas por fecha
  getByDate(date: string): WorkEntry[] {
    return this.getAll().filter(e => e.date === date);
  },

  // Obtener entradas por cliente
  getByClient(clientId: string): WorkEntry[] {
    return this.getAll().filter(e => e.clientId === clientId);
  },

  // Obtener entradas en un rango de fechas
  getByDateRange(startDate: string, endDate: string): WorkEntry[] {
    return this.getAll().filter(e => e.date >= startDate && e.date <= endDate);
  },
};

/**
 * Gestión de configuración
 */
export const ConfigStorage = {
  // Obtener configuración
  get(): AppConfig {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  },

  // Guardar configuración
  save(config: AppConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  // Actualizar solo la tarifa por hora
  updateHourlyRate(rate: number): void {
    const config = this.get();
    config.hourlyRate = rate;
    this.save(config);
  },
};

/**
 * Utilidad para generar IDs únicos
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
