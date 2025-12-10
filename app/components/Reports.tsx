/**
 * Componente para generar y visualizar informes semanales y mensuales
 * Muestra el desglose de horas y dinero por cliente/trabajo
 */
'use client';

import { useState, useEffect } from 'react';
import { WorkEntry, Client } from '../types';
import { 
  WorkEntryStorage, 
  ClientStorage, 
  ConfigStorage 
} from '../storage';
import {
  formatDate,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  calculateReport,
  MONTH_NAMES,
  formatCurrency,
  formatHours,
} from '../utils';

type ReportType = 'weekly' | 'monthly';

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [hourlyRate, setHourlyRate] = useState(10);

  useEffect(() => {
    setEntries(WorkEntryStorage.getAll());
    setClients(ClientStorage.getAll());
    setHourlyRate(ConfigStorage.get().hourlyRate);
  }, []);

  // Calcular rango de fechas según el tipo de informe
  const getDateRange = (): { start: Date; end: Date; label: string } => {
    if (reportType === 'weekly') {
      const start = getWeekStart(selectedDate);
      const end = getWeekEnd(selectedDate);
      const label = `Semana del ${start.getDate()} de ${
        MONTH_NAMES[start.getMonth()]
      } al ${end.getDate()} de ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
      return { start, end, label };
    } else {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const start = getMonthStart(year, month);
      const end = getMonthEnd(year, month);
      const label = `${MONTH_NAMES[month]} ${year}`;
      return { start, end, label };
    }
  };

  const { start, end, label } = getDateRange();
  const startStr = formatDate(start);
  const endStr = formatDate(end);

  // Filtrar entradas en el rango de fechas
  const filteredEntries = entries.filter(
    e => e.date >= startStr && e.date <= endStr
  );

  // Calcular informe
  const report = calculateReport(filteredEntries, clients, hourlyRate);

  // Navegación de fecha
  const navigatePrevious = () => {
    if (reportType === 'weekly') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 7);
      setSelectedDate(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setSelectedDate(newDate);
    }
  };

  const navigateNext = () => {
    if (reportType === 'weekly') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 7);
      setSelectedDate(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">
        Informes de Horas y Pagos
      </h2>

      {/* Selector de tipo de informe */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Tipo de Informe
        </label>
        <div className="inline-flex rounded-lg border border-neutral-300 p-1 bg-neutral-50">
          <button
            onClick={() => setReportType('weekly')}
            className={`px-6 py-2.5 rounded-md transition font-medium ${
              reportType === 'weekly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-700 hover:text-neutral-900'
            }`}
          >
            📅 Semanal
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-6 py-2.5 rounded-md transition font-medium ${
              reportType === 'monthly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-700 hover:text-neutral-900'
            }`}
          >
            📆 Mensual
          </button>
        </div>
      </div>

      {/* Navegación de fecha */}
      <div className="flex items-center justify-between mb-8 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
        <button
          onClick={navigatePrevious}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium flex items-center gap-2"
        >
          <span>←</span> Anterior
        </button>
        
        <div className="text-center">
          <h3 className="text-xl font-bold text-neutral-900">{label}</h3>
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:text-blue-700 mt-1.5 font-medium"
          >
            Ir a hoy
          </button>
        </div>
        
        <button
          onClick={navigateNext}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium flex items-center gap-2"
        >
          Siguiente <span>→</span>
        </button>
      </div>

      {/* Resumen general */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 mb-8 text-white shadow-lg">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-blue-100 text-sm mb-2 font-medium">Total de Horas</p>
            <p className="text-4xl font-bold">{formatHours(report.totalHours)}h</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-2 font-medium">Total a Cobrar</p>
            <p className="text-4xl font-bold">{formatCurrency(report.totalAmount)}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-blue-500/30 text-sm text-blue-100 font-medium">
          💰 Tarifa: {hourlyRate}€/hora
        </div>
      </div>

      {/* Desglose por cliente */}
      {report.clientBreakdown.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-lg text-neutral-700 font-medium">No hay registros de horas en este período</p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Desglose por Cliente/Trabajo
          </h3>
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-100 border-b-2 border-neutral-300">
                  <th className="text-left p-4 font-semibold text-neutral-700">
                    Cliente/Trabajo
                  </th>
                  <th className="text-right p-4 font-semibold text-neutral-700">
                    Horas
                  </th>
                  <th className="text-right p-4 font-semibold text-neutral-700">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {report.clientBreakdown.map((item, index) => (
                  <tr
                    key={item.clientId}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition"
                  >
                    <td className="p-4 text-neutral-900 font-medium">
                      {item.clientName}
                    </td>
                    <td className="p-4 text-right text-neutral-800 font-medium">
                      {formatHours(item.hours)}h
                    </td>
                    <td className="p-4 text-right font-semibold text-neutral-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
                {/* Fila de totales */}
                <tr className="bg-blue-50 border-t-2 border-blue-300">
                  <td className="p-4 text-neutral-900 font-bold">
                    TOTAL
                  </td>
                  <td className="p-4 text-right text-neutral-900 font-bold">
                    {formatHours(report.totalHours)}h
                  </td>
                  <td className="p-4 text-right text-neutral-900 font-bold text-lg">
                    {formatCurrency(report.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Botón para imprimir */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition shadow-sm font-medium flex items-center gap-2"
            >
              <span>🖨️</span> Imprimir Informe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
