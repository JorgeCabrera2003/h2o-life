import { supabase, isSupabaseConfigured } from './supabase';
import { Sale, Expense } from '@/types';

/**
 * Módulo de Sincronización Resiliente (Event Queue / Background Sync)
 * 
 * Implementa el patrón Offline-First solicitado en el Blueprint Arquitectónico.
 * Si una venta o gasto se realiza sin conexión (o si el servicio falla), 
 * se almacena en el localStorage y se intenta reenviar en segundo plano.
 */

const QUEUE_KEY = 'h2o_offline_queue';

interface QueueItem {
  id: string;
  type: 'SALE' | 'EXPENSE';
  payload: any;
  timestamp: number;
  retries: number;
}

export class OfflineSyncQueue {
  static getQueue(): QueueItem[] {
    try {
      const q = localStorage.getItem(QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  }

  static saveQueue(queue: QueueItem[]) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  }

  static enqueue(type: 'SALE' | 'EXPENSE', payload: any) {
    const queue = this.getQueue();
    queue.push({
      id: `${type}-${Date.now()}`,
      type,
      payload,
      timestamp: Date.now(),
      retries: 0
    });
    this.saveQueue(queue);
    
    // Intentar sincronizar inmediatamente en segundo plano
    this.processQueue();
  }

  static async processQueue() {
    if (!isSupabaseConfigured) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    const remainingQueue: QueueItem[] = [];

    for (const item of queue) {
      if (item.retries > 5) {
        console.error(`Item ${item.id} descartado después de 5 intentos fallidos.`);
        continue;
      }

      let success = false;
      try {
        if (item.type === 'SALE') {
          const sale = item.payload as Sale;
          const { error } = await supabase!.from('sales').insert({
            folio: sale.folio,
            client_id: sale.client_id,
            cashier_id: sale.worker_id,
            total_usd: sale.total_usd,
            total_bs: sale.total_bs,
            exchange_rate: sale.exchange_rate,
            status: sale.status,
            notes: sale.notes
          });
          if (!error) success = true;
          else console.error('Supabase Sync Error (Sale):', error);
        } else if (item.type === 'EXPENSE') {
          const expense = item.payload as Expense;
          const { error } = await supabase!.from('expenses').insert({
            category: expense.category,
            description: expense.description,
            amount_usd: expense.amount_usd,
            amount_bs: expense.amount_bs,
            payment_method: expense.payment_method,
            recorded_by: expense.recorded_by
          });
          if (!error) success = true;
          else console.error('Supabase Sync Error (Expense):', error);
        }
      } catch (e) {
        console.error('Error procesando cola:', e);
      }

      if (!success) {
        item.retries += 1;
        remainingQueue.push(item);
      }
    }

    this.saveQueue(remainingQueue);
  }
}

// Inicializar el listener para cuando vuelva la conexión
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    OfflineSyncQueue.processQueue();
  });
}
