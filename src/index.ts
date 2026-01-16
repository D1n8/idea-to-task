import './style.css';

// Экспорт React компонента
export { ReactFlowIdeaNode as IdeaToTaskWidget } from './wrappers/ReactFlowIdeaNode';

// Экспорт функции для общения с виджетом
export { getInfo } from './utils/eventBus';

export * from './types/modules';