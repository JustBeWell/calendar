/**
 * Script para añadir datos de ejemplo a la aplicación
 * Ejecuta este código en la consola del navegador para probar la aplicación
 */

// IMPORTANTE: Ejecuta esto en la consola del navegador (F12 > Console)
// mientras la aplicación está abierta en http://localhost:3000

// Datos de ejemplo
const exampleClients = [
  { id: 'client-1', name: 'Academia X', createdAt: '2025-12-01T10:00:00.000Z' },
  { id: 'client-2', name: 'Cliente A', createdAt: '2025-12-01T10:30:00.000Z' },
  { id: 'client-3', name: 'Proyecto Freelance', createdAt: '2025-12-01T11:00:00.000Z' },
];

const exampleEntries = [
  // Semana actual
  { id: 'entry-1', date: '2025-12-09', hours: 3.5, clientId: 'client-1', note: 'Clases de matemáticas' },
  { id: 'entry-2', date: '2025-12-09', hours: 2, clientId: 'client-2', note: 'Desarrollo web' },
  { id: 'entry-3', date: '2025-12-10', hours: 4, clientId: 'client-1', note: 'Clases de física' },
  
  // Días anteriores de diciembre
  { id: 'entry-4', date: '2025-12-05', hours: 5, clientId: 'client-3', note: 'Diseño de interfaz' },
  { id: 'entry-5', date: '2025-12-06', hours: 3, clientId: 'client-1', note: 'Clases de química' },
  { id: 'entry-6', date: '2025-12-06', hours: 1.5, clientId: 'client-2', note: 'Reunión de proyecto' },
  
  // Primera semana de diciembre
  { id: 'entry-7', date: '2025-12-02', hours: 4, clientId: 'client-1', note: 'Clases grupales' },
  { id: 'entry-8', date: '2025-12-03', hours: 6, clientId: 'client-3', note: 'Desarrollo backend' },
  { id: 'entry-9', date: '2025-12-04', hours: 2.5, clientId: 'client-2', note: 'Consultoría' },
  
  // Noviembre (para probar informes mensuales)
  { id: 'entry-10', date: '2025-11-25', hours: 8, clientId: 'client-3', note: 'Sprint final' },
  { id: 'entry-11', date: '2025-11-26', hours: 3, clientId: 'client-1', note: 'Exámenes finales' },
  { id: 'entry-12', date: '2025-11-27', hours: 4.5, clientId: 'client-2', note: 'Revisión de código' },
];

const exampleConfig = {
  hourlyRate: 10
};

// Guardar en localStorage
localStorage.setItem('worktime_clients', JSON.stringify(exampleClients));
localStorage.setItem('worktime_entries', JSON.stringify(exampleEntries));
localStorage.setItem('worktime_config', JSON.stringify(exampleConfig));

console.log('✅ Datos de ejemplo cargados correctamente!');
console.log('📊 Clientes creados:', exampleClients.length);
console.log('⏰ Entradas de trabajo:', exampleEntries.length);
console.log('💰 Tarifa por hora:', exampleConfig.hourlyRate + '€');
console.log('');
console.log('🔄 Recarga la página para ver los datos');

// Calcular estadísticas
const totalHours = exampleEntries.reduce((sum, e) => sum + e.hours, 0);
const totalAmount = totalHours * exampleConfig.hourlyRate;
console.log('');
console.log('📈 Estadísticas totales:');
console.log('   Total de horas:', totalHours.toFixed(2) + 'h');
console.log('   Total a cobrar:', totalAmount.toFixed(2) + '€');

// Por cliente
console.log('');
console.log('👥 Por cliente:');
exampleClients.forEach(client => {
  const clientEntries = exampleEntries.filter(e => e.clientId === client.id);
  const clientHours = clientEntries.reduce((sum, e) => sum + e.hours, 0);
  const clientAmount = clientHours * exampleConfig.hourlyRate;
  console.log(`   ${client.name}: ${clientHours.toFixed(2)}h - ${clientAmount.toFixed(2)}€`);
});
