/**
 * Aplicación de Gestión de Horas de Trabajo
 * Permite registrar horas trabajadas, gestionar clientes y generar informes
 */
'use client';

import { useState } from 'react';
import Calendar from './components/Calendar';
import ClientManager from './components/ClientManager';
import Reports from './components/Reports';

type Tab = 'calendar' | 'clients' | 'reports';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('calendar');

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                Gestor de pago/horas
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-6">
          <nav className="flex gap-1 -mb-px">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all relative ${
                activeTab === 'calendar'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <span className="text-lg">📅</span>
              Calendario
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all relative ${
                activeTab === 'clients'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <span className="text-lg">👥</span>
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all relative ${
                activeTab === 'reports'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <span className="text-lg">📊</span>
              Informes
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'clients' && <ClientManager />}
        {activeTab === 'reports' && <Reports />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm">
            <p className="text-neutral-600">
              © 2025 Gestión de pagos/horas made by JustBeWell
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
