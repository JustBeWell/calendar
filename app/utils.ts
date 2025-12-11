/**
 * Utilidades para cálculos de fechas y generación de informes
 */

import { WorkEntry, Client, ReportData, ClientReportItem } from './types';

/**
 * Formatea una fecha al formato YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Convierte una cadena YYYY-MM-DD a objeto Date
 */
export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Obtiene el primer día de la semana (lunes) para una fecha dada
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
  return new Date(d.setDate(diff));
};

/**
 * Obtiene el último día de la semana (domingo) para una fecha dada
 */
export const getWeekEnd = (date: Date): Date => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

/**
 * Obtiene el primer día del mes
 */
export const getMonthStart = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

/**
 * Obtiene el último día del mes
 */
export const getMonthEnd = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

/**
 * Obtiene todos los días de un mes (incluyendo días de semanas parciales)
 */
export const getCalendarDays = (year: number, month: number): Date[] => {
  const firstDay = getMonthStart(year, month);
  const lastDay = getMonthEnd(year, month);
  
  // Obtener el lunes de la primera semana
  const calendarStart = getWeekStart(firstDay);
  
  // Obtener el domingo de la última semana
  const calendarEnd = getWeekEnd(lastDay);
  
  const days: Date[] = [];
  const current = new Date(calendarStart);
  
  while (current <= calendarEnd) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

/**
 * Calcula el informe para un rango de fechas
 */
export const calculateReport = (
  entries: WorkEntry[],
  clients: Client[],
  hourlyRate: number
): ReportData => {
  // Calcular totales generales
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalAmount = totalHours * hourlyRate;
  
  // Agrupar por cliente
  const clientMap = new Map<string, ClientReportItem>();
  
  entries.forEach(entry => {
    const client = clients.find(c => c.id === entry.clientId);
    const clientName = client?.name || 'Desconocido';
    
    if (clientMap.has(entry.clientId)) {
      const item = clientMap.get(entry.clientId)!;
      item.hours += entry.hours;
      item.amount += entry.hours * hourlyRate;
    } else {
      clientMap.set(entry.clientId, {
        clientId: entry.clientId,
        clientName,
        hours: entry.hours,
        amount: entry.hours * hourlyRate,
      });
    }
  });
  
  const clientBreakdown = Array.from(clientMap.values()).sort((a, b) => 
    a.clientName.localeCompare(b.clientName)
  );
  
  return {
    totalHours,
    totalAmount,
    clientBreakdown,
  };
};

/**
 * Nombres de los meses en español
 */
export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Nombres de los días de la semana en español
 */
export const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Valida que las horas sean válidas (enteras o media hora)
 */
export const validateHours = (hours: number): { valid: boolean; error?: string } => {
  if (hours <= 0) {
    return { valid: false, error: 'Las horas deben ser mayor a 0' };
  }
  
  // Validar que sean horas enteras o media hora (.5)
  const isInteger = Number.isInteger(hours);
  const isHalfHour = Number.isInteger(hours * 2); // ej: 1.5 * 2 = 3 (entero)
  
  if (!isInteger && !isHalfHour) {
    return { valid: false, error: 'Solo se permiten horas enteras o medias horas (ej: 1, 1.5, 2, 2.5...)' };
  }
  
  if (hours > 24) {
    return { valid: false, error: 'Las horas no pueden ser más de 24' };
  }
  
  return { valid: true };
};

/**
 * Formatea un número a dos decimales para mostrar dinero
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} €`;
};

/**
 * Formatea horas mostrando enteros o medias horas de forma legible
 */
export const formatHours = (hours: number): string => {
  if (Number.isInteger(hours)) {
    return hours.toString();
  }
  return hours.toFixed(1);
};

/**
 * Formatea horas para el calendario (ej: "8h" o "8h 30min")
 */
export const formatHoursCalendar = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = (hours - wholeHours) * 60;
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}min`;
};
