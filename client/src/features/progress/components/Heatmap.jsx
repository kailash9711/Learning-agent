import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

export default function Heatmap({ data }) {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="heatmap-container p-6 bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-100/50"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
             <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Learning Intensity</h3>
        </div>
        
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Less</span>
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-slate-200/50" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-200" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">More</span>
        </div>
      </div>
      
      <div className="px-2">
        <CalendarHeatmap
          startDate={oneYearAgo}
          endDate={today}
          values={data}
          classForValue={(value) => {
            if (!value || value.count === 0) return 'color-empty';
            if (value.count < 3) return 'color-scale-1';
            if (value.count < 6) return 'color-scale-2';
            return 'color-scale-3';
          }}
          tooltipDataAttrs={(value) => {
            if (!value || !value.date) return null;
            return {
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-content': `${value.date}: ${value.count} activities`,
            };
          }}
          showWeekdayLabels={false}
        />
      </div>
      <Tooltip id="heatmap-tooltip" className="!rounded-xl !bg-slate-900 !px-3 !py-2 !text-xs !font-bold" />
      
      <style>{`
        .react-calendar-heatmap .color-empty { fill: #f1f5f9; }
        .react-calendar-heatmap .color-scale-1 { fill: #a7f3d0; }
        .react-calendar-heatmap .color-scale-2 { fill: #34d399; }
        .react-calendar-heatmap .color-scale-3 { fill: #059669; }
        .react-calendar-heatmap rect { rx: 3px; ry: 3px; }
        .react-calendar-heatmap text { font-size: 8px; fill: #94a3b8; font-weight: 600; }
      `}</style>
    </motion.div>
  );
}
