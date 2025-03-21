import { Chart, ChartConfiguration, ChartTypeRegistry } from "chart.js/auto";
import 'chartjs-adapter-date-fns';
import { sentencesTime } from './sentences-time.ts';

import { fixedColors } from "./data";


import { Tooltip } from 'chart.js';

Tooltip.positioners.myCustomPositioner = function(elements, eventPosition) {
  // Your custom positioning logic here
  return {
    x: 0,
    y: 0
  };
};


// Ensure Chart.js uses instance mode
Chart.defaults.plugins.tooltip = false;

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

// function createMultiLineChart(canvasId: string) {
//   const parsedData = parseData(sentencesTime);
//   const topics = [...new Set(parsedData.map(item => item.topic))];
//   const datasets = topics.map(topic => ({
//     label: `Topic ${topic}`,
//     data: parsedData.filter(item => item.topic === topic).map(item => ({
//       x: item.timestamp,
//       y: item.value
//     })),
//     fill: false,
//     tension: 0.1
//   }));

//   const config: ChartConfiguration<'line', any, string> = {
//     type: 'line',
//     data: { datasets: datasets },




// function createMultiLineChart(canvasId: string) {
//   const parsedData = parseData(sentencesTime);
//   const topics = [...new Set(parsedData.map(item => item.topic))];
//   const datasets = topics.map(topic => ({
//     label: `Topic ${topic}`,
//     data: parsedData.filter(item => item.topic === topic).map(item => ({
//       x: item.timestamp,
//       y: item.value
//     })),
//     fill: false,
//     tension: 0.1
//   }));


//   const config: ChartConfiguration<'line', any, string> = {
//     type: 'line',
//     data: { datasets: datasets },
//     options: {
//       responsive: true,
//       scales: {
//         x: {
//           type: 'time',
//           time: { unit: 'day' },
//           title: { display: true, text: 'Date' }
//         },
//         y: {
//           beginAtZero: true,
//           title: { display: true, text: 'Frequency' }
//         }
//       },
//       plugins: {
//         tooltip: {
//           position: 'nearest', // Use a valid default position
//         },
//         // tooltip: {
//         //   callbacks: {
//         //     label: (context) => {
//         //       const dataPoint = parsedData.find(item => 
//         //         item.timestamp.getTime() === context.parsed.x &&
//         //         item.value === context.parsed.y
//         //       );
//         //       return dataPoint ? `${dataPoint.label}: ${dataPoint.value}` : '';
//         //     }
//         //   }
//         // },
//         legend: { position: 'top' }
//       }
//     }
//   };

//   // const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
//   // const chart = new Chart(ctx, config);

//   // function filterByTopic(topic: number) {
//   //   chart.data.datasets = originalDatasets.filter(dataset => dataset.label === `Topic ${topic}`);
//   //   chart.update();
//   // }

//   // function resetChart() {
//   //   chart.data.datasets = originalDatasets;
//   //   chart.update();
//   // }
//   // // return new Chart(ctx, config);
//   // return { chart, filterByTopic, resetChart };

//   // const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
//   // const chart = new Chart(ctx, config);

//   // // Store the original datasets
//   // const originalDatasets = [...datasets];

//   // function filterByTopic(topic: number) {
//   //   chart.data.datasets = originalDatasets.filter(dataset => dataset.label === `Topic ${topic}`);
//   //   chart.update();
//   // }

//   // function resetChart() {
//   //   chart.data.datasets = originalDatasets;
//   //   chart.update();
//   // }

//   // return { chart, filterByTopic, resetChart };

//   const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
//   const chart = new Chart(ctx, config);

//   // Store the original datasets
//   const originalDatasets = [...datasets];

//   function filterByTopic(topic: number) {
//     chart.data.datasets = originalDatasets.filter(dataset => {
//       const datasetTopic = parseInt(dataset.label.split(' ')[1]);
//       return datasetTopic === topic;
//     });
//     chart.update();
//   }

//   function resetChart() {
//     chart.data.datasets = originalDatasets;
//     chart.update();
//   }

//   return { chart, filterByTopic, resetChart };

  
// function createMultiLineChart(canvasId: string) {
//   const parsedData = parseData(sentencesTime);
//   const topics = [...new Set(parsedData.map(item => item.topic))];
//   const datasets = topics.map(topic => ({
//     label: `Topic ${topic}`,
//     data: parsedData.filter(item => item.topic === topic).map(item => ({
//       x: item.timestamp,
//       y: item.value
//     })),
//     fill: false,
//     tension: 0.1
//   }));
// function createMultiLineChart(canvasId: string) {
//   const parsedData = parseData(sentencesTime);
//   const topics = [...new Set(parsedData.map(item => item.topic))];
  
//   // Group data by topic
//   const dataByTopic = topics.reduce((acc, topic) => {
//     acc[topic] = parsedData.filter(item => item.topic === topic);
//     return acc;
//   }, {} as Record<number, ParsedDataPoint[]>);

//   const datasets = Object.entries(dataByTopic).map(([topic, topicData]) => {
//     const words = topicData[0].label; // Assuming the first word is representative
//     return {
//       label: `Topic ${topic}: ${words}`,
//       data: topicData.map(item => ({
//         x: item.timestamp,
//         y: item.value
//       })),
//       fill: false,
//       tension: 0.1
//     };
//   });

//   // Calculate the min and max values for the y-axis
//   const allValues = parsedData.map(item => item.value);
//   const minY = Math.min(...allValues);
//   const maxY = Math.max(...allValues);

//   const config: ChartConfiguration<'line', any, string> = {
//     type: 'line',
//     data: { datasets: datasets },
//     options: {
//       responsive: true,
//       scales: {
//         x: {
//           type: 'time',
//           time: { unit: 'day' },
//           title: { display: true, text: 'Date' }
//         },
//         y: {
//           beginAtZero: true,
//           min: minY,  // Set the minimum value
//           max: maxY,  // Set the maximum value
//           title: { display: true, text: 'Frequency' }
//         }
//       },
//       plugins: {
//         tooltip: {
//           position: 'nearest',
//         },
//         legend: { position: 'top' }
//       },
//       onClick: (event, elements) => {
//         if (elements.length === 0) {
//           resetChart();
//         }
//       }
//     }
//   };

//   const ctx = document.getElementById(canvasId) as HTMLCanvasElement;





function createMultiLineChart(canvasId: string) {
  const parsedData = parseData(sentencesTime);
  const topics = [...new Set(parsedData.map(item => item.topic))];

  // Map topics to colors
  const topicColors = topics.reduce((acc, topic, index) => {
    acc[topic] = fixedColors[index % fixedColors.length]; // Assign colors cyclically
    return acc;
  }, {} as Record<number, string>);

  const datasets = topics.map(topic => ({
    label: `Topic ${topic + 1}: ${parsedData.find(item => item.topic === topic)?.label || ''}`,
    data: parsedData.filter(item => item.topic === topic).map(item => ({
      x: item.timestamp,
      y: item.value
    })),
    borderColor: topicColors[topic], // Use mapped color for line border
    backgroundColor: topicColors[topic], // Use mapped color for fill (if needed)
    fill: false,
    tension: 0.1
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
          time: { unit: 'day' },
          title: { display:true,text:'Date'}
         },y:{beginAtZero:true,min:minY,max:maxY,title:{display:true,text:'Frequency'}}
       },plugins:{tooltip:{position:'nearest'},legend:{position:'top'}}
     }};

     const ctx=document.getElementById(canvasId);

  const chart = new Chart(ctx, config);

  // Store the original datasets
  // const originalDatasets = [...datasets];

  // function filterByTopic(topic: number) {
  //   chart.data.datasets = originalDatasets.filter(dataset => {
  //     const datasetTopic = parseInt(dataset.label.split(' ')[1]);
  //     return datasetTopic === topic;
  //   });
  //   chart.update();
  // }

  // function filterByTopic(topic: number) {
  //   chart.data.datasets.forEach(dataset => {
  //     const datasetTopic = parseInt(dataset.label.split(':')[0].split(' ')[1]);
  //     dataset.hidden = datasetTopic !== topic;
  //   });
  //   chart.update();
  // }

  
  // function resetChart() {
  //   chart.data.datasets = originalDatasets;
  //   chart.update();
  // }

  function filterByTopic(topic: number) {
    chart.data.datasets.forEach(dataset => {
      const datasetTopic = parseInt(dataset.label.split(':')[0].split(' ')[1]);
      dataset.hidden = datasetTopic !== topic;
    });
    chart.update();
  }
  
  function resetChart() {
    chart.data.datasets.forEach(dataset => {
      dataset.hidden = false;
    });
    chart.update();
  }
  

  return { chart, filterByTopic, resetChart };
}





export { createMultiLineChart };
