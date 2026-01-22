import type { IHostInfo } from "../types/modules";

export class WidgetUpdateEvent extends Event {
  detail: IHostInfo;

  constructor(detail: IHostInfo) {
    super("widget-update");
    this.detail = detail;
  }
}

export const widgetEventBus = new EventTarget();

export const getInfo = (data: IHostInfo) => {
  widgetEventBus.dispatchEvent(new WidgetUpdateEvent(data));
};