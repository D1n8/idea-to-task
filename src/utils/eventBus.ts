// src/utils/eventBus.ts
import type { IHostInfo } from "../types/modules";

// Создаем типизированное событие
export class WidgetUpdateEvent extends Event {
  detail: IHostInfo;

  constructor(detail: IHostInfo) {
    super("widget-update");
    this.detail = detail;
  }
}

// Простой EventTarget для общения внутри пакета
export const widgetEventBus = new EventTarget();

/**
 * Функция, которую будет вызывать разработчик доски.
 * Она просто "кричит" всем виджетам: "Эй, пришли данные!"
 */
export const getInfo = (data: IHostInfo) => {
  widgetEventBus.dispatchEvent(new WidgetUpdateEvent(data));
};