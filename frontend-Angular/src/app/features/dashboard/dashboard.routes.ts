import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

import { Component } from '@angular/core';

// --- COMPONENTES DE PRUEBA (DUMMY) ---

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  template: `
    <div class="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
      <h2 class="text-2xl font-bold text-gray-800">Panel de Resumen (Overview)</h2>
      <p class="text-gray-600 mt-2">Este es el contenido principal del Dashboard.</p>
      <div class="mt-4 p-4 bg-[#f6fbdd] rounded-lg text-[#2d4231]">
        Aquí irían tus gráficos y tarjetas de resumen.
      </div>
    </div>
  `
})
export class DashboardOverviewComponent { }

@Component({
  selector: 'app-transactions',
  standalone: true,
  template: `
    <div class="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
      <h2 class="text-2xl font-bold text-gray-800">Sección de Transacciones</h2>
      <p class="text-gray-600 mt-2">Listado de tus últimos movimientos financieros.</p>
      <ul class="mt-4 space-y-2 text-sm">
        <li class="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
          <span>Compra Supermercado</span>
          <span class="font-bold text-red-600">-$150.00</span>
        </li>
        <li class="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
          <span>Depósito Nómina</span>
          <span class="font-bold text-green-600">+$2,500.00</span>
        </li>
      </ul>
    </div>
  `
})
export class TransactionsComponent { }
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: '',
        component: DashboardOverviewComponent
      },
      {
        path: 'transactions',
        component: TransactionsComponent
      }
    ]
  }
];

//export const DASHBOARD_ROUTES: Routes = [
//  {
//    path: '',
//    component: Dashboard,
//    children: []
//  }
//];