import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Star } from 'lucide-react';

interface LatencyChartProps {
  data: number[];
}

export default function LatencyChart({ data }: LatencyChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; index: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length < 1) return;

    // Standard fallback values if only 1 data point is present
    const chartData = data.length === 1 ? [data[0], data[0]] : data;

    const width = 600;
    const height = 180;
    const margin = { top: 20, right: 30, bottom: 25, left: 40 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create X scale
    const x = d3.scaleLinear()
      .domain([0, chartData.length - 1])
      .range([margin.left, width - margin.right]);

    const maxVal = d3.max(chartData) || 100;
    const yMax = maxVal + Math.max(10, maxVal * 0.15);

    // Create Y scale
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);

    // Create high-contrast grid lines
    const yTicks = y.ticks(4);
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#f1f5f9') // slate-100 gridline
      .attr('stroke-width', 1);

    // Add Area under the trace
    const area = d3.area<number>()
      .x((_, i) => x(i))
      .y0(height - margin.bottom)
      .y1(d => y(d))
      .curve(d3.curveMonotoneX);

    // Gradient definitions inside SVG
    const defs = svg.append('defs');
    const areaGradient = defs.append('linearGradient')
      .attr('id', 'chart-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4338ca') // indigo-700
      .attr('stop-opacity', '0.15');

    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4338ca')
      .attr('stop-opacity', '0.0');

    svg.append('path')
      .datum(chartData)
      .attr('fill', 'url(#chart-area-grad)')
      .attr('d', area);

    // Add Spark Path Line with animated drawing effect
    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(d))
      .curve(d3.curveMonotoneX);

    const path = svg.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5') // indigo-600
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('d', line);

    // Length of path for drawing animation
    const totalLength = path.node()?.getTotalLength() || 1000;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Chart axes with Space Grotesk labels
    const xAxis = d3.axisBottom(x)
      .ticks(Math.min(chartData.length, 10))
      .tickFormat(d => `Node ${Number(d) + 1}`);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .select('.domain').attr('stroke', '#cbd5e1')
      .style('display', 'none'); // Hide the default horizontal line

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}ms`))
      .select('.domain').attr('stroke', '#cbd5e1')
      .style('display', 'none'); // Hide the default vertical line

    // Customize ticks text
    svg.selectAll('text')
      .attr('font-family', '"Space Grotesk", sans-serif')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('fill', '#94a3b8');

    // Add interactive point nodes
    const focusGroup = svg.append('g');
    
    chartData.forEach((val, idx) => {
      const cx = x(idx);
      const cy = y(val);

      // Invisible larger hover target to make hover touch indicators easy
      focusGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 12)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseenter', () => {
          setHoveredPoint({ x: cx, y: cy, val, index: idx });
        })
        .on('mouseleave', () => {
          setHoveredPoint(null);
        });

      // Visual point node circle
      focusGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 4.5)
        .attr('fill', '#ffffff')
        .attr('stroke', '#4f46e5')
        .attr('stroke-width', 2.5)
        .style('pointer-events', 'none');
    });

  }, [data]);

  return (
    <div className="relative group w-full bg-slate-50/50 p-4 border border-slate-150 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase font-display font-medium font-bold text-slate-400 tracking-wider flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          Node Ping Traceroute (RTT)
        </span>
        <span className="text-[10px] font-mono font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded leading-normal">
          AVG: {Math.round(data.reduce((a, b) => a + b, 0) / (data.length || 1))}ms
        </span>
      </div>

      <svg 
        ref={svgRef} 
        width="100%" 
        height="180" 
        viewBox="0 0 600 180" 
        className="w-full h-auto overflow-visible select-none" 
      />

      {/* Floating details popup when data point is hovered */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-[10px] font-mono shadow-md pointer-events-none"
            style={{
              left: `${(hoveredPoint.x / 600) * 100}%`,
              top: `${(hoveredPoint.y / 180) * 100 - 30}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <span className="text-indigo-400 font-extrabold block uppercase tracking-wide">NODE {hoveredPoint.index + 1}</span>
            <span className="font-bold text-slate-100">{hoveredPoint.val} ms RTT</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
