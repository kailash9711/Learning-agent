import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Download, Maximize2, RefreshCw, Share2, Sparkles, ZoomIn, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Custom Node Component ---
const MindMapNode = ({ data }) => {
  const isRoot = data.isRoot;
  const hasChildren = data.hasChildren;
  const isExpanded = data.isExpanded;

  return (
    <div 
      className={`relative px-4 py-3 rounded-2xl border-2 shadow-xl transition-all group ${
        isRoot 
          ? "bg-slate-900 border-slate-700 text-white min-w-[140px]" 
          : "bg-white border-slate-100 text-slate-800 min-w-[120px]"
      } hover:border-emerald-400 hover:shadow-emerald-100`}
      onClick={() => data.onToggle(data.id)}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />

      <div className="flex items-center gap-2">
        {hasChildren && (
          <div className={`shrink-0 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-emerald-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
          </div>
        )}
        <span className="text-sm font-bold truncate leading-tight">{data.label}</span>
      </div>

      {/* Decorative background glow for root */}
      {isRoot && (
        <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-emerald-400 to-cyan-400 opacity-20 blur-md -z-10" />
      )}
    </div>
  );
};

const nodeTypes = {
  mindmap: MindMapNode,
};

// --- Layout Helper ---
const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 200;
  const nodeHeight = 60;
  
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function MindMapTab({ doc, mermaidCode: jsonData, onGenerate, loading }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  // Toggle expansion state
  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Transform JSON to Flow Elements
  useEffect(() => {
    if (!jsonData || !jsonData.name) return;

    const flowNodes = [];
    const flowEdges = [];
    
    const processNode = (node, parentId = null, depth = 0) => {
      const id = parentId ? `${parentId}-${node.name}` : 'root';
      const isExpanded = expandedNodes.has(id);
      
      flowNodes.push({
        id,
        type: 'mindmap',
        data: { 
          label: node.name, 
          isRoot: depth === 0,
          hasChildren: node.children && node.children.length > 0,
          isExpanded,
          onToggle: toggleNode,
          id
        },
        position: { x: 0, y: 0 }, // Will be set by dagre
      });

      if (parentId) {
        flowEdges.push({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
        });
      }

      if (isExpanded && node.children) {
        node.children.forEach(child => processNode(child, id, depth + 1));
      }
    };

    processNode(jsonData);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [jsonData, expandedNodes, toggleNode, setNodes, setEdges]);

  if (!jsonData && !loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-8 py-24 bg-linear-to-b from-slate-50 to-white rounded-[32px] border border-dashed border-slate-300 shadow-inner"
      >
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500 shadow-xl shadow-emerald-200"
        >
          <Share2 className="h-12 w-12 text-white" />
        </motion.div>
        <div className="text-center space-y-3 px-6">
          <h3 className="text-2xl font-black text-slate-900">Interactive Map</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Generate a unique, clickable mind map to explore your document's concepts branch by branch.</p>
        </div>
        <button onClick={onGenerate} className="flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-slate-800 transition-all active:scale-95">
          <RefreshCw className="h-5 w-5" />
          Generate Map
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-[600px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Interactive Knowledge Map</h2>
          <p className="text-sm font-medium text-slate-500 italic">Click nodes to expand or collapse branches</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={onGenerate} disabled={loading} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
      </div>

      <div className="relative flex-1 rounded-[32px] border-2 border-slate-100 bg-slate-50 overflow-hidden shadow-2xl shadow-slate-200/50 group">
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-xl">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-lg shadow-emerald-100" />
              <p className="text-lg font-black text-slate-900">Building Network...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#cbd5e1" variant="dots" gap={20} size={1} />
          <Controls className="!bg-white !border-slate-200 !shadow-lg !rounded-xl overflow-hidden" />
          <Panel position="bottom-center" className="bg-white/80 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-xl mb-4">
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
               <div className="flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Click to Expand</div>
               <div className="h-1 w-1 rounded-full bg-slate-300" />
               <div className="flex items-center gap-1"><ZoomIn className="h-3 w-3" /> Scroll to Zoom</div>
             </div>
          </Panel>
        </ReactFlow>
      </div>

      <div className="flex items-center gap-3 rounded-3xl bg-emerald-500 p-4 text-white shadow-xl shadow-emerald-100">
        <Sparkles className="h-5 w-5 shrink-0" />
        <p className="text-xs font-bold leading-relaxed">
          <strong>Interactive Learning:</strong> Explore the document structure by expanding only the sections you want to focus on. This helps in "progressive disclosure," reducing cognitive load.
        </p>
      </div>
    </div>
  );
}
