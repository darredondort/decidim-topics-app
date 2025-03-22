import { Chart, ChartConfiguration, ChartTypeRegistry } from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { sentences } from './sentences_top20';
import { assignedColors } from "./data";

import { Tooltip } from 'chart.js';

Tooltip.positioners.myCustomPositioner = function(elements, eventPosition) {
  // Your custom positioning logic here
  return {
    x: 0,
    y: 0
  };
};



// Ensure Chart.js uses instance mode
Chart.defaults.plugins.datalabels = false;
Chart.defaults.font.family = "'DM Sans', sans-serif";


interface DataPoint {
  label: string;
  value: number;
}



function createBarChart(canvasId: string) {
  let chData = sentences
    .filter(sentence => sentence.type === "topic" && sentence.topic !== -1)
    .map((sentence, index) => ({
      label: sentence.label,
      value: sentence.value,
      topic: sentence.topic,
      // color: fixedColors[index % fixedColors.length] // Assign colors cyclically
      color: assignedColors[index % assignedColors.length] // Assign colors cyclically
    }));

  chData.sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...chData.map(d => d.value)) * 2;

  const config: ChartConfiguration<keyof ChartTypeRegistry, DataPoint[], number> = {
    type: "bar",
    plugins: [ChartDataLabels],
    data: {
      labels: chData.map(row => row.label),
      datasets: [{
        label: "chart-01",
        data: chData.map(row => row.value),
        backgroundColor: chData.map(row => row.color), // Use mapped colors
        borderColor: "rgba(40, 32, 48, 0.1)",
        borderWidth: 1,
        barThickness: 28,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: { position: 'nearest' },
        legend: { display: false },
        datalabels: {
          color: '#ECE6F0',
          anchor: 'end',
          align: 'end',
          offset: 16,
          font: { size: 18 },
          formatter: (value, context) => {
            const label = context.chart.data.labels[context.dataIndex];
            return `${label}: ${value.toString()}`;
          }
        }
      },
      scales: {
        x: {
          display: false,
          beginAtZero: true,
          max: maxValue,
          title: { display: true, text: "Value" },
          grid: { color: "rgba(200, 200, 200, 0.3)", display: false },
        },
        y: {
          ticks: { display: false },
          grid: { display: false },
        },
      },
      onClick(event, elements) {
        if (elements.length > 0) {
          const index = elements[0].index;
          const clickedTopic = chData[index].topic; // Use topic value
          document.dispatchEvent(new CustomEvent('topicSelected', { detail: clickedTopic }));
        } else {
          document.dispatchEvent(new CustomEvent('resetChart'));
        }
      }
    },
  };

  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
  return new Chart(ctx, config);
}



export { createBarChart };