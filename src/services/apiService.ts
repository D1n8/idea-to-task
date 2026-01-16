// services/apiService.ts
import type { ITaskData, ColumnData } from "../types/modules";

// Токен из вашего сообщения
const MODULE_TOKEN = 'KX3NRVSrA0s0yCZV6IEihbaQCBl9y+JMPI+i/o1sPbHc+gCfGYpID1qYXHo8ZvdIuoQzaHOA9Il8zSDirYFe1w==';
// Базовый URL (замените example.com на реальный, если он другой)
const BASE_URL = 'http://85.234.22.160:1111'; 

// Структура данных, которую мы будем хранить на сервере
export interface SavedState {
  kanbanTasks: ITaskData[];
  mindMapTasks: ITaskData[];
  columns: ColumnData[];
  isSynced: boolean;
  updatedAt: string; // Полезно для отладки
}

export const apiService = {
  /**
   * Загрузка данных (GET)
   */
  async loadData(): Promise<SavedState | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/stats/module/metrics`, {
        method: 'GET',
        headers: {
          'X-Module-Token': MODULE_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        console.log('Данные на сервере не найдены, используем локальные (mock) данные.');
        return null; // Вернем null, чтобы контекст инициализировал моковые данные
      }

      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as SavedState;
    } catch (error) {
      console.error('API Load Error:', error);
      return null;
    }
  },

  /**
   * Сохранение данных (PUT)
   */
  async saveData(data: Omit<SavedState, 'updatedAt'>): Promise<void> {
    try {
      const payload: SavedState = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${BASE_URL}/api/stats/module/metrics`, {
        method: 'PUT',
        headers: {
          'X-Module-Token': MODULE_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Ошибка сохранения: ${response.statusText}`);
      } else {
        // console.log('Сохранено успешно'); // Можно раскомментировать для отладки
      }
    } catch (error) {
      console.error('API Save Error:', error);
    }
  },
};