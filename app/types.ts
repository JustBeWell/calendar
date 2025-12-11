/**
 * Tipos de datos para la aplicación de gestión de horas
 */

// Representa un cliente o trabajo
export interface Client {
  id: string;
  name: string;
  createdAt: string;
}

// Representa una entrada de trabajo (horas trabajadas en un día)
export interface WorkEntry {
  id: string;
  date: string; // formato: YYYY-MM-DD
  hours: number; // permite enteros y 0.5 (media hora)
  clientId: string;
  note?: string;
}

// Configuración de la aplicación
export interface AppConfig {
  hourlyRate: number; // precio por hora (por defecto 10€)
}

// Para los informes
export interface ReportData {
  totalHours: number;
  totalAmount: number;
  clientBreakdown: ClientReportItem[];
}

export interface ClientReportItem {
  clientId: string;
  clientName: string;
  hours: number;
  amount: number;
}
