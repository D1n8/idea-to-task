import { memo } from 'react';
import { type NodeProps } from 'reactflow';
import { App } from '../App';

export const ReactFlowIdeaNode = memo(({ id, data, isConnectable }: NodeProps) => {
  const initialData = {
      ...data,
      widgetId: data.widgetId || id 
  };

  return (

     <App initialData={initialData} isConnectable={isConnectable} />
  );
});