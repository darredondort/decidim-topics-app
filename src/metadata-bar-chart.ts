import { Chart, ChartConfiguration, ChartTypeRegistry } from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { sentences } from './sentences_top20';
import { fixedColors, assignedColors } from "./data";

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
          font: { size: 16 },
          formatter: (value, context) => {
            const label = context.chart.data.labels[context.dataIndex];
            return `${label}: ${value.toString()}`;
          }
        }
      },
      scales: {
        x: {
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

// function createBarChart(canvasId: string) {
//   let chData: DataPoint[] = sentences
//     .filter(sentence => sentence.type === "topic" && sentence.topic !== -1)
//     .map(sentence => ({
//       label: sentence.label,
//       value: sentence.value,
//       topic: sentence.topic // Add this line to include the topic
//     }));

//   chData.sort((a, b) => b.value - a.value);

//   const maxValue = Math.max(...chData.map((d) => d.value)) * 2;

//   const config: ChartConfiguration<keyof ChartTypeRegistry, DataPoint[], number> = {
//     type: "bar",
//     plugins: [ChartDataLabels],
//     data: {
//       labels: chData.map((row) => row.label),
//       datasets: [{
//         label: "chart-01",
//         data: chData.map((row) => row.value),
//         backgroundColor: fixedColors,
//         borderColor: "rgba(40, 32, 48, 0.1)",
//         borderWidth: 1,
//         barThickness: 28,
//       }],
//     },
//     options: {
//       indexAxis: "y",
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         // tooltip: { enabled: false },
//         tooltip: {
//           position: 'nearest', // Use a valid default position
//         },
//         legend: { display: false },
//         datalabels: {
//           color: '#ECE6F0',
//           anchor: 'end',
//           align: 'end',
//           offset: 16,
//           font: { size: 16 },
//           formatter: (value: number, context: any) => {
//             const label = context.chart.data.labels[context.dataIndex];
//             return `${label}: ${value.toString()}`;
//           }
//         }
//       },
//       scales: {
//         x: {
//           beginAtZero: true,
//           max: maxValue,
//           title: { display: true, text: "Value" },
//           grid: { color: "rgba(200, 200, 200, 0.3)", display: false },
//         },
//         y: {
//           ticks: { display: false },
//           grid: { display: false },
//         },
//       },
//       // onClick: (event, elements) => {
//       //   if (elements.length > 0) {
//       //     const datasetIndex = elements[0].datasetIndex;
//       //     const index = elements[0].index;
//       //     const clickedTopic = chart.data.labels[index];
//       //     document.dispatchEvent(new CustomEvent('topicSelected', { detail: clickedTopic }));
//       //   }
//       // }
//       onClick: (event, elements) => {
//         if (elements.length > 0) {
//           const index = elements[0].index;
//           const clickedTopic = chData[index].topic; // Use the topic number
//           document.dispatchEvent(new CustomEvent('topicSelected', { detail: clickedTopic }));
//         } else {
//           // Dispatch a reset event when clicking outside of bars
//           document.dispatchEvent(new CustomEvent('resetChart'));
//         }
//       }
      
//     },
//   };

//   const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
//   // return new Chart(ctx, config);
//   const chart = new Chart(ctx, config);
//   return chart;
// }



export { createBarChart };

  
















// import { Chart, ChartConfiguration, ChartTypeRegistry } from "chart.js/auto";
// import ChartDataLabels from 'chartjs-plugin-datalabels';
// Chart.register(ChartDataLabels);

// // import { interpolatePlasma } from 'd3-scale-chromatic';

// import { fixedColors, assignedColors } from "./data";
// import { sentences } from './sentences'; 


// interface DataPoint {
//   label: string;
//   value: number;
// }

// async function createChart() {
//   let barScaleSize = 3;

//   let chData: DataPoint[] = sentences
//   .filter(sentence => sentence.type === "topic")
//   .filter(sentence => sentence.topic != -1)
//   .map(sentence => ({
//     label: sentence.label,
//     value: sentence.value
//   }));

//   // Sort data in descending order for better visualization
//   chData.sort((a, b) => b.value - a.value);

//   // Calculate color scale based on data values
//   // const maxValue = Math.max(...chData.map((d) => d.value));
//   // const getColor = (value: number) => interpolatePlasma(value / maxValue);


//   // Limit bar length to leave space to labels
//   const maxValue = Math.max(...chData.map((d) => d.value)) * barScaleSize; // Add a 50% buffer

//   const config: ChartConfiguration<
//   keyof ChartTypeRegistry,
//   DataPoint[],
//   number
// > = {
//   type: "bar",
//   data: {
//     labels: chData.map((row) => row.label),
//     datasets: [
//       {
//         label: "chart-01",
//         data: chData.map((row) => row.value),
//         backgroundColor: fixedColors,
//         borderColor: "rgba(40, 32, 48, 0.0)",
//         borderWidth: 1,
//         barThickness: 28, // Increase bar width (height in horizontal chart)
//       },
//     ],
//   },
//   options: {
//     indexAxis: "y",
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       tooltip: {
//         enabled: false,
//         external: externalTooltipHandler,
//       },
//       legend: {
//         display: false,
//       },
//       // datalabels: {
//       //   // color: '#000',
//       //   color: '##ece6f0',
//       //   anchor: 'start',
//       //   align: 'end',
//       //   offset: 16,
//       //   font: {
//       //     size: 24,
//       //     weight: 'bold'
//       //   },
//       //   formatter: function(value) {
//       //     return value;
//       //   }
//       // }
//       datalabels: {
//         color: '#ECE6F0',
//         anchor: 'end',
//         align: 'end',
//         offset: 16,
//         font: {
//           size: 20
//         },
//         formatter: function(value: number, context: any) {
//           const label = context.chart.data.labels[context.dataIndex];
//           return `${value.toString()}: ${label}`;
//         }
//       }
//     },
//     scales: {
//       x: {
//         display: false,
//         beginAtZero: true,
//         max: maxValue, // Set upper limit dynamically
//         ticks: {
//           display: false,
//         },
//         title: {
//           display: false,
//           text: "Document Count",
//         },
//         grid: {
//           color: "rgba(200, 200, 200, 0.0)",
//           display: false,
//         },
//       },
//       y: {
//         ticks: {
//           display: false, // Hide Y axis values
//           autoSkip: false,
//           callback: function (value) {
//             const label = this.getLabelForValue(value as number);
//             return label.length > 100 ? label.substr(0, 180) + "..." : label;
//           },
//           color: "#ECE6F0",
//           font: {
//             size: 14, // Increase font size
//           },
//           padding: 20, // Add padding to move labels to the right
//         },
//         grid: {
//           color: "rgba(200, 200, 200, 0.3)",
//           display: false,
//         },
//         position: 'top', // Position labels on top of bars
//       },
//     },
    
//     // scales: {
//     //   x: {
//     //     beginAtZero: true,
//     //     title: {
//     //       display: true,
//     //       text: "Value",
//     //     },
//     //     grid: {
//     //       color: "rgba(200, 200, 200, 0.3)",
//     //       display: false,
//     //     },
//     //   },
//     //   y: {
//     //     ticks: {
//     //       display: false, // Hide Y axis values
//     //       autoSkip: false,
//     //       callback: function (value) {
//     //         const label = this.getLabelForValue(value as number);
//     //         return label.length > 100 ? label.substr(0, 180) + "..." : label;
//     //       },
//     //       color: "#ECE6F0",
//     //       font: {
//     //         size: 14, // Increase font size
//     //       },
//     //       padding: 20, // Add padding to move labels to the right
//     //     },
//     //     grid: {
//     //       color: "rgba(200, 200, 200, 0.3)",
//     //       display: false,
//     //     },
//     //     position: 'top', // Position labels on top of bars
//     //   },
//     // },

//   },
// };


//   const ctx = document.getElementById("chart-01") as HTMLCanvasElement;
//   new Chart(ctx, config);
// }

// // Custom tooltip handler
// function externalTooltipHandler(context: any) {
//   const { chart, tooltip } = context;
//   let tooltipEl = chart.canvas.parentNode.querySelector("div");

//   if (!tooltipEl) {
//     tooltipEl = document.createElement("div");
//     tooltipEl.style.background = "rgba(40, 32, 48, 0.7)";
//     tooltipEl.style.borderRadius = "3px";
//     tooltipEl.style.color = "#ECE6F0";
//     tooltipEl.style.opacity = "1";
//     tooltipEl.style.pointerEvents = "none";
//     tooltipEl.style.position = "absolute";
//     tooltipEl.style.transform = "translate(-50%, 0)";
//     tooltipEl.style.transition = "all .1s ease";

//     const table = document.createElement("table");
//     table.style.margin = "0px";

//     tooltipEl.appendChild(table);
//     chart.canvas.parentNode.appendChild(tooltipEl);
//   }

//   if (tooltip.opacity === 0) {
//     tooltipEl.style.opacity = "0";
//     return;
//   }

//   if (tooltip.body) {
//     const titleLines = tooltip.title || [];
//     const bodyLines = tooltip.body.map((b: any) => b.lines);

//     const tableHead = document.createElement("thead");
//     titleLines.forEach((title: string) => {
//       const tr = document.createElement("tr");
//       tr.style.borderWidth = "0";

//       const th = document.createElement("th");
//       th.style.borderWidth = "0";
//       const text = document.createTextNode(title);

//       th.appendChild(text);
//       tr.appendChild(th);
//       tableHead.appendChild(tr);
//     });

//     const tableBody = document.createElement("tbody");
//     bodyLines.forEach((body: string[], i: number) => {
//       const colors = tooltip.labelColors[i];

//       const tr = document.createElement("tr");
//       tr.style.backgroundColor = "inherit";
//       tr.style.borderWidth = "0";

//       const td = document.createElement("td");
//       td.style.borderWidth = "0";

//       const text = document.createTextNode(body.join(": "));

//       td.appendChild(text);
//       tr.appendChild(td);
//       tableBody.appendChild(tr);
//     });

//     const tableRoot = tooltipEl.querySelector("table");
//     while (tableRoot.firstChild) {
//       tableRoot.firstChild.remove();
//     }

//     tableRoot.appendChild(tableHead);
//     tableRoot.appendChild(tableBody);
//   }

//   const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

//   tooltipEl.style.opacity = "1";
//   tooltipEl.style.left = positionX + tooltip.caretX + "px";
//   tooltipEl.style.top = positionY + tooltip.caretY + "px";
//   tooltipEl.style.font = tooltip.options.bodyFont.string;
//   tooltipEl.style.padding =
//     tooltip.options.padding + "px " + tooltip.options.padding + "px";
// }

// createChart();







// // multiLineChart.ts

// import { Chart, ChartConfiguration, ChartTypeRegistry } from "chart.js/auto";
// import ChartDataLabels from 'chartjs-plugin-datalabels';
// import 'chartjs-adapter-date-fns'; // For date/time axis support

// // Import your data
// import { sentencesTime } from './sentences-time.ts';


// // Define the structure of your data
// interface RawDataPoint {
//   Topic: number;
//   Words: string;
//   Frequency: number;
//   Timestamp: string;
// }

// // Define the structure for parsed data
// interface ParsedDataPoint {
//   topic: number;
//   label: string;
//   value: number;
//   timestamp: Date;
// }

// // Function to parse the raw data
// function parseData(data: RawDataPoint[]): ParsedDataPoint[] {
//   return data.map(item => ({
//     topic: item.Topic,
//     label: item.Words.split(',')[0].trim(),
//     value: item.Frequency,
//     timestamp: new Date(item.Timestamp)
//   }));
// }

// // Function to create the multi-line chart
// function createMultiLineChart(data: ParsedDataPoint[]) {
//   const topics = [...new Set(data.map(item => item.topic))];
//   const datasets = topics.map(topic => ({
//     label: `Topic ${topic}`,
//     data: data.filter(item => item.topic === topic).map(item => ({
//       x: item.timestamp,
//       y: item.value
//     })),
//     fill: false,
//     tension: 0.1
//   }));

//   const config: ChartConfiguration<'line', any, string> = {
//     type: 'line',
//     data: {
//       datasets: datasets
//     },
//     options: {
//       responsive: true,
//       scales: {
//         x: {
//           type: 'time',
//           time: {
//             unit: 'day'
//           },
//           title: {
//             display: true,
//             text: 'Date'
//           }
//         },
//         y: {
//           beginAtZero: true,
//           title: {
//             display: true,
//             text: 'Frequency'
//           }
//         }
//       },
//       plugins: {
//         tooltip: {
//           callbacks: {
//             label: (context) => {
//               const dataPoint = data.find(item => 
//                 item.timestamp.getTime() === context.parsed.x &&
//                 item.value === context.parsed.y
//               );
//               return dataPoint ? `${dataPoint.label}: ${dataPoint.value}` : '';
//             }
//           }
//         },
//         legend: {
//           position: 'top',
//         }
//       }
//     }
//   };

//   const ctx = document.getElementById('multiLineChart') as HTMLCanvasElement;
//   return new Chart(ctx, config);
// }

// // Main function to initialize the chart
// function initChart() {
//   const parsedData = parseData(sentencesTime);
//   createMultiLineChart(parsedData);
// }

// // Call initChart when the DOM is loaded
// document.addEventListener('DOMContentLoaded', initChart);


































//   // const config: ChartConfiguration<
//   //   keyof ChartTypeRegistry,
//   //   DataPoint[],
//   //   number
//   // > = {
//   //   type: "bar",
//   //   data: {
//   //     labels: chData.map((row) => row.label),
//   //     datasets: [
//   //       {
//   //         label: "chart-01",
//   //         data: chData.map((row) => row.value),
//   //         // backgroundColor: chData.map(row => getColor(row.value)), // d3 color interpolation
//   //         backgroundColor: assignedColors,
//   //         borderColor: "rgba(40, 32, 48, 0.1)",
//   //         borderWidth: 1,
//   //       },
//   //     ],
//   //   },
//   //   options: {
//   //     indexAxis: "y", // Make the chart horizontal
//   //     responsive: true,
//   //     maintainAspectRatio: false,
//   //     plugins: {
//   //       tooltip: {
//   //         enabled: false,
//   //         external: externalTooltipHandler,
//   //       },
//   //       legend: {
//   //         display: false, // Hide legend
//   //       },
//   //     },
//   //     scales: {
//   //       x: {
//   //         beginAtZero: true,
//   //         title: {
//   //           display: true,
//   //           text: "Value",
//   //         },
//   //         grid: {
//   //           color: "rgba(200, 200, 200, 0.3)",
//   //           display: false,
//   //         },
//   //       },
//   //       y: {
//   //         ticks: {
//   //           autoSkip: false,
//   //           callback: function (value) {
//   //             const label = this.getLabelForValue(value as number);
//   //             return label.length > 100 ? label.substr(0, 180) + "..." : label;
//   //           },
//   //           color: "#ECE6F0",
//   //         },
//   //         grid: {
//   //           color: "rgba(200, 200, 200, 0.3)",
//   //           display: false,
//   //         },
//   //       },
//   //     },
//   //   },
//   // };
