/**
 * Componente de calendario mensual
 * Muestra un calendario con los días del mes y permite registrar horas trabajadas
 */
'use client';

import { useState, useEffect } from 'react';
import { WorkEntry } from '../types';
import { 
  formatDate, 
  getCalendarDays, 
  MONTH_NAMES, 
  DAY_NAMES 
} from '../utils';
import { WorkEntryStorage } from '../storage';
import DayModal from './DayModal';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    setEntries(WorkEntryStorage.getAll());
  }, []);

  const loadData = () => {
    setEntries(WorkEntryStorage.getAll());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = getCalendarDays(year, month);

  // Navegar al mes anterior
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navegar al mes siguiente
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Obtener horas totales para un día específico
  const getHoursForDay = (date: Date): number => {
    const dateStr = formatDate(date);
    const dayEntries = entries.filter(e => e.date === dateStr);
    return dayEntries.reduce((sum, e) => sum + e.hours, 0);
  };

  // Verificar si un día tiene entradas
  const hasEntries = (date: Date): boolean => {
    const dateStr = formatDate(date);
    return entries.some(e => e.date === dateStr);
  };

  // Abrir modal para un día específico
  const openDayModal = (date: Date) => {
    setSelectedDate(formatDate(date));
    setShowModal(true);
  };

  // Cerrar modal y recargar datos
  const closeModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    loadData();
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-neutral-200 p-3 sm:p-6">
      {/* Encabezado del calendario */}
      <div className="flex items-center justify-between mb-4 sm:mb-8 gap-2">
        <button
          onClick={previousMonth}
          className="px-3 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <span>←</span> <span className="hidden xs:inline">Anterior</span>
        </button>
        
        <h2 className="text-base sm:text-2xl font-bold text-neutral-900 text-center">
          <span className="hidden sm:inline">{MONTH_NAMES[month]} {year}</span>
          <span className="sm:hidden">{MONTH_NAMES[month].substring(0, 3)} {year}</span>
        </h2>
        
        <button
          onClick={nextMonth}
          className="px-3 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <span className="hidden xs:inline">Siguiente</span> <span>→</span>
        </button>
      </div>

      {/* Nombres de los días de la semana */}
      <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-3">
        {DAY_NAMES.map(day => (
          <div key={day} className="text-center font-semibold text-neutral-700 py-1 sm:py-2 text-xs sm:text-sm">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.substring(0, 2)}</span>
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1 sm:gap-3">
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month;
          const isToday = formatDate(date) === formatDate(new Date());
          const hours = getHoursForDay(date);
          const hasWork = hasEntries(date);

          return (
            <button
              key={index}
              onClick={() => openDayModal(date)}
              className={`
                min-h-[60px] sm:min-h-[90px] p-1.5 sm:p-3 border rounded-md sm:rounded-lg transition-all relative
                ${isCurrentMonth 
                  ? 'bg-white hover:bg-blue-50 border-neutral-200 hover:border-blue-300 hover:shadow-md' 
                  : 'bg-neutral-50 border-neutral-100 text-neutral-400'
                }
                ${isToday ? 'ring-1 sm:ring-2 ring-blue-500 ring-offset-1' : ''}
                ${hasWork ? 'border-emerald-400 bg-emerald-50/30' : ''}
              `}
            >
              <div className={`text-right font-semibold mb-0.5 sm:mb-1 text-xs sm:text-sm ${isToday ? 'text-blue-600' : ''}`}>
                {date.getDate()}
              </div>
              {hasWork && (
                <div className="text-xs text-center mt-auto">
                  <div className="bg-emerald-500 text-white rounded-sm sm:rounded-md px-1 sm:px-2 py-0.5 sm:py-1 font-medium shadow-sm text-[10px] sm:text-xs">
                    {hours.toFixed(1)}h
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-200 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-600">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-emerald-400 bg-emerald-50/30 rounded"></div>
          <span>Días con horas</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 ring-2 ring-blue-500 ring-offset-1 rounded"></div>
          <span>Hoy</span>
        </div>
      </div>

      {/* Modal para gestionar el día */}
      {showModal && selectedDate && (
        <DayModal
          date={selectedDate}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
