import { useState, useRef, useCallback, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { Handle, Position } from 'reactflow';

import { KanbanProvider, useKanbanContext } from './context/KanbanContext';
import { KanbanBoardWidget } from './components/KanbanBoardWidget';
import { MindMapWidget } from './components/MindMapWidget';

const InnerContent = () => {
  // @ts-ignore
  const { isMindMapVisible, measures, setMeasures, isConnectable } = useKanbanContext();
  
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizingSplitter, setIsResizingSplitter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startSplitterResize = () => setIsResizingSplitter(true);
  const stopSplitterResize = () => setIsResizingSplitter(false);
  
  const onSplitterResize = useCallback((e: MouseEvent) => {
    if (isResizingSplitter && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
    }
  }, [isResizingSplitter]);

  useEffect(() => {
    if (isResizingSplitter) {
      window.addEventListener('mousemove', onSplitterResize);
      window.addEventListener('mouseup', stopSplitterResize);
    } else {
      window.removeEventListener('mousemove', onSplitterResize);
      window.removeEventListener('mouseup', stopSplitterResize);
    }
    return () => {
        window.removeEventListener('mousemove', onSplitterResize);
        window.removeEventListener('mouseup', stopSplitterResize);
    };
  }, [isResizingSplitter, onSplitterResize]);

  return (
    <Resizable
      size={{ width: measures.width, height: measures.height }}
      onResizeStop={(_e, _direction, _ref, d) => {
        setMeasures({
          width: measures.width + d.width,
          height: measures.height + d.height,
        });
      }}
      minWidth={600}
      minHeight={400}
      enable={{ right: true, bottom: true, bottomRight: true }}

      handleClasses={{ right: 'nodrag', bottom: 'nodrag', bottomRight: 'nodrag' }}
      className="bg-white rounded-xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col relative"
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <div ref={containerRef} className="flex h-full w-full overflow-hidden relative nowheel cursor-auto">
        
        <div 
          className="h-full transition-all duration-75 ease-out border-r border-gray-200"
          style={{ width: isMindMapVisible ? `${leftWidth}%` : '100%' }}
        >
          <KanbanBoardWidget />
        </div>

        {isMindMapVisible && (
          <div
            onMouseDown={startSplitterResize}
            className="w-1.5 h-full cursor-col-resize hover:bg-blue-500 bg-gray-100 transition-colors z-50 flex-shrink-0 nodrag active:bg-blue-600"
            style={{ marginLeft: '-3px', marginRight: '-3px', position: 'relative' }}
          />
        )}

        {isMindMapVisible && (
          <div className="h-full bg-slate-50" style={{ width: `${100 - leftWidth}%` }}>
            <MindMapWidget />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </Resizable>
  );
};

export const App = ({ initialData, isConnectable }: { initialData?: any, isConnectable?: boolean }) => {
  return (
    <KanbanProvider initialData={initialData}>
      <InnerContentWithProps isConnectable={isConnectable} />
    </KanbanProvider>
  );
};

const InnerContentWithProps = ({ isConnectable }: { isConnectable?: boolean }) => {
    const ctx = useKanbanContext();
    // @ts-ignore
    ctx.isConnectable = isConnectable; 
    return <InnerContent />;
}

export default App;