import { Chart, ChartConfiguration, ChartTypeRegistry } from "chart.js/auto";
import 'chartjs-adapter-date-fns';
import { sentencesTime } from './sentences-time.ts';

import { fixedColors, assignedColors } from "./data";


import { Tooltip } from 'chart.js';

// Custom tooltip positioner (keep your existing implementation)
Tooltip.positioners.myCustomPositioner = function(elements, eventPosition) {
  return { x: 0, y: 0 };
};


// Ensure Chart.js uses instance mode
Chart.defaults.plugins.tooltip = false;
Chart.defaults.font.family = "'DM Sans', sans-serif";


interface RawDataPoint {
  Topic: number;
  Words: string;
  Frequency: number;
  Timestamp: string;
}

interface ParsedDataPoint {
  topic: number;
  label: string;
  value: number;
  timestamp: Date;
}

function parseData(data: RawDataPoint[]): ParsedDataPoint[] {
  return data.map(item => ({
    topic: item.Topic,
    label: item.Words.split(',')[0].trim(),
    value: item.Frequency,
    timestamp: new Date(item.Timestamp)
  }));
}



function createMultiLineChart(canvasId: string) {
  const parsedData = parseData(sentencesTime);
  const topics = [...new Set(parsedData.map(item => item.topic))];

  // Map topics to colors
  const topicColors = topics.reduce((acc, topic, index) => {
    acc[topic] = assignedColors[index % assignedColors.length];
    return acc;
  }, {} as Record<number, string>);

  const datasets = topics.map(topic => ({
    // label: `Topic ${topic + 1}: ${parsedData.find(item => item.topic === topic)?.label || ''}`,
    label: `${parsedData.find(item => item.topic === topic)?.label || ''}`,
    data: parsedData.filter(item => item.topic === topic).map(item => ({
      x: item.timestamp,
      y: item.value
    })),
    borderColor: topicColors[topic],
    backgroundColor: topicColors[topic],
    fill: false,
    tension: 0.1,
    hidden: false // Add hidden state tracking
  }));

  const allValues = parsedData.map(item => item.value);
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);

  const config: ChartConfiguration<'line', any, string> = {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: { unit: 'year' },
          title: { 
            display: true,
            text: 'Year',
            font: { 
              size: 16,
            },
            // color: '#ece6f0' // Add title color
            color: 'rgba(236, 230, 240, 0.5)' // Add title color
          },
          ticks: {
            // color: '#ece6f0' // X-axis tick color
            color: 'rgba(236, 230, 240, 0.5)' // X-axis tick color
          }
        },
        y: {
          beginAtZero: true,
          min: minY,
          max: maxY,
          title: { 
            display: true,
            text: 'Related proposals',
            font: { 
              size: 16,
            },
            // color: '#ece6f0' // Add title color
            color: 'rgba(236, 230, 240, 0.5)' // X-axis tick color
          },
          ticks: {
            // color: '#ece6f0' // Y-axis tick color
            color: 'rgba(236, 230, 240, 0.5)' // X-axis tick color
          }
        }
      },
      plugins: {
        tooltip: {
          position: 'nearest',
          backgroundColor: 'rgba(40, 32, 48, 0.9)',
          titleColor: '#ece6f0',
          bodyColor: '#ece6f0',
          callbacks: {
            title: (context) => {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleDateString();
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value}`;
            }
          }
        },
        legend: {
          display:true,
          position: 'top',
          labels: {
            font: { 
              size: 18,
              family: "'DM Sans', sans-serif", // Ensure a readable font
            },
            boxWidth: 16,
            // boxHeight: 8,
            usePointStyle: true, // This can help with color visibility
            generateLabels: (chart) => {
              return chart.data.datasets.map((dataset, index) => ({
                text: dataset.label || '',
                fontColor: 'rgba(236, 230, 240, 1)',
                fillStyle: dataset.borderColor as string,
                hidden: !chart.getDatasetMeta(index).visible,
                lineCap: 'round',
                // lineWidth: 8,
                strokeStyle: dataset.borderColor as string,
                pointStyle: 'rect',
                index: index
              }));
            }
          },
          onClick: (e,legendItem, legend) => {
            const index = legendItem.index;
            const chart = legend.chart;
            const meta = chart.getDatasetMeta(index);
            meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
            chart.update();
          }
        }
      },
      // Add click handler for resetting filters
      onClick: (e, elements) => {
        if (elements.length === 0) {
          datasets.forEach((dataset, index) => {
            const meta = chart.getDatasetMeta(index);
            if (meta.hidden) {
              meta.hidden = false;
            }
          });
          chart.update();
        }
      }
    }
  };

  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
  const chart = new Chart(ctx, config);

    // Filtering functions (keep your existing implementations)
    const filterByTopic = (topic: number) => { /* ... */ };
    const resetChart = () => { /* ... */ };
  
    return { chart, filterByTopic, resetChart };

}





export { createMultiLineChart };
