import { Chart, ChartConfiguration, TooltipItem } from "chart.js/auto";
import 'chartjs-adapter-date-fns';
import { sentences } from "./sentences_top20";
import { assignedColors } from "./data";
import * as d3 from 'd3';

Chart.defaults.font.family = "'DM Sans', sans-serif";

function createBubbleChart(canvasId: string) {
  // Step 1: Group by year and select the top document per year by supports
  const topDocumentsByYear = sentences
    .filter((sentence) => sentence.type === "document" && sentence.supports != null && sentence.timestamp != null)
    .reduce((acc, sentence) => {
      const year = new Date(sentence.timestamp!).getFullYear();
      if (year >= 2016 && year <= 2024) {
        if (!acc[year] || (sentence.supports! > acc[year].supports!)) {
          acc[year] = sentence;
        }
      }
      return acc;
    }, {} as Record<number, typeof sentences[number]>);

  // Step 2: Convert to array and sort by year
  const bubbleData = Object.entries(topDocumentsByYear)
    .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
    .map(([year, sentence]) => ({
      x: new Date(sentence.timestamp!).getTime(),
      y: sentence.supports!,
      r: (sentence.comments || 0) + 1, // Ensure non-zero value for log scale
      backgroundColor: assignedColors[Number(year) % assignedColors.length],
      label: sentence.label || "",
      topic: sentence.topic_label_str || "",
      year: Number(year)
    }));

  // Create a logarithmic scale for bubble sizes
  const minComments = Math.min(...bubbleData.map(d => d.r));
  const maxComments = Math.max(...bubbleData.map(d => d.r));
  const logScale = d3.scaleLog()
    .domain([minComments, maxComments])
    .range([5, 50]); // Adjust the range as needed

  // Apply the logarithmic scale to bubble sizes
  const scaledBubbleData = bubbleData.map(d => ({
    ...d,
    r: logScale(d.r)
  }));

  // Step 3: Chart configuration
  const config: ChartConfiguration<"bubble", { x: number; y: number; r: number }[], unknown> = {
    type: "bubble",
    data: {
      datasets: [{
        data: scaledBubbleData.map(d => ({
          x: d.x,
          y: d.y,
          r: d.r,
        })),
        backgroundColor: scaledBubbleData.map(d => d.backgroundColor),
      }]
    },
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
          title: { 
            display: true, 
            text: "Supports",
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
          
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(47, 39, 54, 0.5)', // Custom background color
          padding: 10, // Add padding for better text fit
          bodyFont: {
            size: 14 // Adjust font size for readability
          },
          position: 'nearest',
          callbacks: {
            label: (context: TooltipItem<"bubble">) => {
              const dataIndex = context.dataIndex;
              return `${bubbleData[dataIndex].topic}: \n ${bubbleData[dataIndex].label}`;
            }
          }
        }
      }
    }
  };

  // Step 4: Render the chart
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
  if (ctx) {
    new Chart(ctx, config);
  } else {
    console.error(`Canvas element with id '${canvasId}' not found.`);
  }
}

export { createBubbleChart };