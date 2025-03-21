// main.ts
import "./style.css";
import { Graph, GraphConfigInterface } from "@cosmograph/cosmos";
import { select } from "d3-selection";
import scrollama from "scrollama";

import { createBarChart } from './metadata-bar-chart.ts';
import { createMultiLineChart } from './metadata-multiline.ts';


import {
  pointPositions,
  pointColors,
  pointColorsBicolor,
  // pointSizes,
  pointSizesGraph,
  pointSizesEmbeddings,
  pointLabelToIndex,
  links,
  pointIndexToLabel,
  linkColorsHigh,
  linkColorsLow,
  linkColorsDisabled,
  pointMetadata,
  sentences,
  cosmosSpaceSize, // Import the space size
  fixedColors,
} from "./data";

import { CosmosLabels } from "./labels";

const initialZoom = 0.75;
let currentZoom = initialZoom;

// let barChart: any;
// let multiLineChart: any;

// console.log("sentences")
// console.log(sentences)
// document.addEventListener('DOMContentLoaded', () => {
//   createBarChart('barChartCanvas');
//   createMultiLineChart('multiLineChartCanvas');
// });
// document.addEventListener('DOMContentLoaded', () => {
//   const barChart = createBarChart('barChartCanvas');
//   const { chart: multiLineChart, filterByTopic, resetChart } = createMultiLineChart('multiLineChartCanvas');

//   document.addEventListener('topicSelected', (event: CustomEvent) => {
//     const selectedTopic = event.detail;
//     filterByTopic(selectedTopic);
//   });

//   const resetButton = document.getElementById('resetButton');
//   if (resetButton) {
//     resetButton.addEventListener('click', resetChart);
//   }
// });

const barChart = createBarChart('barChartCanvas');
const { chart: multiLineChart, filterByTopic, resetChart } = createMultiLineChart('multiLineChartCanvas');

document.addEventListener('topicSelected', (event: CustomEvent) => {
  const selectedTopic = event.detail;
  filterByTopic(selectedTopic);
});

document.addEventListener('resetChart', () => {
  resetChart();
});


// console.log("fixedColors")
// console.log(fixedColors)

// Initial Cosmos settings
export const config: GraphConfigInterface = {
  backgroundColor: "rgb(47, 40, 54)",
  linkWidth: 0.1,
  linkColor: linkColorsLow,
  // linkColor: 'rgba(244,253,117,0.2)',
  linkArrows: false,
  fitViewOnInit: false,
  enableDrag: true,
  disableZoom: true,
  spaceSize: cosmosSpaceSize, // Use the same space size as in data normalization
  disableSimulation: false,
  // simulationGravity: 0.02,
  simulationGravity: 0.02,
  simulationLinkDistance: 300,
  // simulationLinkDistance: 500,
  simulationLinkSpring: 1,
  // simulationRepulsion: 0.2,
  simulationRepulsion: 0.5,
  simulationRepulsionTheta: 1.5,
  simulationFriction: 1.5,
  simulationDecay: 10000,
  // pointSamplingDistance: 50,
  onSimulationTick: () => {
    const trackedPointPositions = graph.getTrackedPointPositionsMap();
    let i = 0;
    trackedPointPositions.forEach((positions, pointIndex) => {
      updatedPointPositions[pointIndex * 2] = positions[0];
      updatedPointPositions[pointIndex * 2 + 1] = positions[1];
      i++;
    });
    cosmosLabels.update(graph);
  },
  onZoom: () => graph && cosmosLabels.update(graph),
};

const canvas = document.querySelector("#cosmos-01-canvas") as HTMLCanvasElement;
const labelsDiv = document.querySelector("#labels") as HTMLDivElement;
const mainContent = document.querySelector("#main-content") as HTMLDivElement;
const cosmosLabels = new CosmosLabels(labelsDiv);

let currentLocationLabel = ["Barcelona"];
let currentSourceLabel = ["decidim.barcelona"];
console.log(currentLocationLabel);
console.log(currentSourceLabel);

const currentSourceContainer = select("#current-src");
currentSourceContainer.html(currentLocationLabel);

const currentLocationContainer = select("#current-location");
currentLocationContainer.html(currentSourceLabel);

// Scrollama setup
const scroller = scrollama();

// Setup your steps
const steps = [
  "section-0",
  "section-1",
  "section-2",
  "section-3",
  "section-4",
  "section-5",
].map((id) => document.getElementById(id));


// Initialize Scrollama
scroller
  .setup({
    step: steps,
    offset: 0.5,
    debug: false,
  })
  .onStepEnter(handleStepEnter)
  .onStepExit(handleStepExit);

function ensureTopicNodesTracked() {
  // Get indices of all topic nodes
  const topicIndices = [];
  let topicNodeCount = 0;

  for (let i = 0; i < pointMetadata.length; i++) {
    if (pointMetadata[i] && pointMetadata[i].type === "topic") {
      topicIndices.push(i);
      topicNodeCount++;
    }
  }

  // Track these nodes in the graph
  if (topicIndices.length > 0) {
    graph.trackPointPositionsByIndices(topicIndices);
    // Main label tracker
    // console.log(`Tracking ${topicIndices.length} topic nodes for labels`);
  } else {
    console.warn("No topic nodes found to track!");
  }

  return topicNodeCount;
}

function handleStepEnter({ index, direction }) {
  console.log(`Entering step ${index}, direction: ${direction}`);

  // Always ensure topic nodes are tracked before any transitions
  ensureTopicNodesTracked();

  // Set label visibility based on step
  const shouldShowLabels = [1, 2, 4, 5].includes(index);
  cosmosLabels.setVisible(shouldShowLabels);

  // Step-specific step configurations
  if (index === 0) {
    graph.setPointColors(new Float32Array(pointColorsBicolor));
    graph.setConfig({
      spaceSize: cosmosSpaceSize,
      disableSimulation: false,
      simulationDecay: 10000,
      linkWidth: 0.1,
      linkColor: linkColorsLow,
    });

    currentZoom = initialZoom;
    graph.setZoomLevel(currentZoom, 500);

    // Update content visibility
    mainContent.classList.add("visible");
    mainContent.classList.add("top-layer");
    mainContent.classList.remove("invisible");
    mainContent.classList.remove("bottom-layer");
    canvas.classList.add("bottom-layer");
    canvas.classList.remove("top-layer");

    // Hide labels in step 0
    cosmosLabels.clearLabels();
    cosmosLabels.setVisible(false);

    // Force a final render
    graph.render();
  }

  if (index === 1) {
    graph.setConfig({
      linkWidth: 0.0,
      linkColor: linkColorsDisabled,
      disableSimulation: false,
      simulationDecay: 10000,
    });
    graph.setPointColors(new Float32Array(pointColorsBicolor));

    currentZoom = 1.25;
    graph.setZoomLevel(currentZoom, 500);
    

    // Update content visibility
    mainContent.classList.add("invisible");
    mainContent.classList.add("bottom-layer");
    mainContent.classList.remove("visible");
    mainContent.classList.remove("top-layer");
    canvas.classList.add("top-layer");
    canvas.classList.remove("bottom-layer");

    // Update as the transition happens
    cosmosLabels.setVisible(true);

    // Ensure the graph renders during the transition
    graph.render();

    // Schedule label updates during the zoom transition
    const transitionDuration = 500; // Match zoom transition time
    const updateInterval = 100; // Update every 100ms during transition

    for (let time = 0; time <= transitionDuration; time += updateInterval) {
      setTimeout(() => {
        cosmosLabels.update(graph, true);
      }, time);
    }

    // Final update after transition completes
    setTimeout(() => {
      ensureTopicNodesTracked();
      cosmosLabels.update(graph, true);
    }, transitionDuration + 100);
  }

  if (index === 2) {
    graph.setConfig({
      linkWidth: 0.4,
      linkColor: linkColorsHigh,
      disableSimulation: false,
      simulationDecay: 5000,
    });
    graph.setPointColors(new Float32Array(pointColorsBicolor));

    currentZoom = 0.5;
    graph.setZoomLevel(currentZoom, 500);

    // Update content visibility
    mainContent.classList.add("invisible");
    mainContent.classList.add("bottom-layer");
    mainContent.classList.remove("visible");
    mainContent.classList.remove("top-layer");
    canvas.classList.add("top-layer");
    canvas.classList.remove("bottom-layer");

    // Set labels visible and update continuously during transition
    cosmosLabels.setVisible(true);

    // Force render to update the graph
    graph.render();

    // Schedule updates during transition
    const transitionDuration = 500;
    const updateInterval = 100;

    for (let time = 0; time <= transitionDuration; time += updateInterval) {
      setTimeout(() => {
        cosmosLabels.update(graph, true);
      }, time);
    }

    // Final update after transition
    setTimeout(() => {
      ensureTopicNodesTracked();
      cosmosLabels.update(graph, true);
    }, transitionDuration + 100);
  }

  if (index === 3) {
    // Fixed positions view
    graph.setPointPositions(new Float32Array(pointPositions));
    graph.setConfig({
      disableSimulation: true, // Use fixed positions
      simulationDecay: 0, // Immediate stop
      linkWidth: 0.1,
      linkColor: linkColorsDisabled,
      enableDrag: false,
    });
    // Colors by cluster
    graph.setPointColors(new Float32Array(pointColors));
    graph.setPointSizes(new Float32Array(pointSizesEmbeddings));

    // graph.zoomToPointByIndex(sentences.length-16, 200, 0.1, false)

    // currentZoom = 0.5;
    // graph.setZoomLevel(currentZoom, 500);

    // Update content visibility
    mainContent.classList.add("visible");
    mainContent.classList.add("top-layer");
    mainContent.classList.remove("invisible");
    mainContent.classList.remove("bottom-layer");
    canvas.classList.remove("top-layer");
    canvas.classList.add("bottom-layer");

    // Clear existing labels during transition
    cosmosLabels.clearLabels();

    // Force a render to update positions
    graph.render();

    // For fixed positions, ensure positions are set before updating labels
    setTimeout(() => {
      ensureTopicNodesTracked();
      cosmosLabels.setVisible(false); // Hide labels in this step
      cosmosLabels.update(graph, true); // Still update positions
    }, 600);

    // zoom to node at the center 
    graph.zoomToPointByIndex(sentences.length-20, 800, 0.1, false)

  }

  if (index === 4) {
    graph.setPointPositions(new Float32Array(pointPositions));
    graph.setConfig({
      disableSimulation: true, // Use fixed positions
      simulationDecay: 0, // Immediate stop
      linkWidth: 0.1,
      linkColor: linkColorsDisabled,
      enableDrag: false,
    });
    // Colors by cluster
    graph.setPointColors(new Float32Array(pointColors));

    // Fit view to show all points
    // graph.fitViewByPointPositions(new Float32Array(pointPositions), 2500, 1.1);

    currentZoom = 0.25;
    graph.setZoomLevel(currentZoom, 500);

    // Update content visibility
    mainContent.classList.add("invisible");
    mainContent.classList.add("bottom-layer");
    mainContent.classList.remove("visible");
    mainContent.classList.remove("top-layer");
    canvas.classList.remove("bottom-layer");
    canvas.classList.add("top-layer");

    // Clear existing labels during transition
    cosmosLabels.clearLabels();

    // Force render to update the graph
    graph.render();

    // Wait for transitions to complete
    setTimeout(() => {
      ensureTopicNodesTracked();
      cosmosLabels.setVisible(true);
      cosmosLabels.update(graph, true); // Force update
      cosmosLabels.labelRenderer.draw(true);
    }, 600);
  }

  if (index === 5) {
    graph.setConfig({
      linkWidth: 0.0,
      linkColor: linkColorsDisabled,
      disableSimulation: false,
      simulationDecay: 10000,
    });
    graph.setPointColors(new Float32Array(pointColorsBicolor));


    currentZoom = 7;
    graph.setZoomLevel(currentZoom, 500);

    // Update content visibility
    mainContent.classList.add("visible");
    mainContent.classList.add("top-layer");
    mainContent.classList.remove("invisible");
    mainContent.classList.remove("bottom-layer");
    canvas.classList.remove("top-layer");
    canvas.classList.add("bottom-layer");

    // Clear labels during transition
    cosmosLabels.clearLabels();

    // Force render to update the graph
    graph.render();

    // Wait for zoom transition to complete
    setTimeout(() => {
      ensureTopicNodesTracked();
      cosmosLabels.setVisible(true);
      cosmosLabels.update(graph, true); // Force update
      cosmosLabels.labelRenderer.draw(true);
    }, 600);
  }

  steps[index].classList.add("is-active");
}

// Debugging utility function
// function testLabelsVisibility() {
//   console.log("Testing label visibility...");
//   const topicCount = ensureTopicNodesTracked();

//   // Attempt to force-show labels
//   cosmosLabels.setVisible(true);
//   cosmosLabels.clearLabels();
//   cosmosLabels.update(graph, true);
//   cosmosLabels.labelRenderer.draw(true);

//   // Report results
//   console.log(`Attempted to show ${topicCount} topic labels`);
//   console.log("If labels are still not visible, check the following:");
//   console.log("1. Is your #labels div correctly styled and positioned?");
//   console.log("2. Are point positions valid in your data?");
//   console.log("3. Is the canvas or any other element obscuring the labels?");
// }

function handleStepExit({ index, direction }) {
  console.log(`Exiting step ${index}, direction: ${direction}`);
  steps[index].classList.remove("is-active");
  if (index === 3 && index === 4) {
    graph.setConfig({
      // linkWidth: 0.4,
      // linkColor: linkColorsHigh,
      disableSimulation: false,
      simulationDecay: 5000,
    });

    // currentZoom = 1.5;
    // graph.setZoomLevel(currentZoom, 500);

    // Update content visibility
    // mainContent.classList.add("invisible");
    // mainContent.classList.add("bottom-layer");
    // mainContent.classList.remove("visible");
    // mainContent.classList.remove("top-layer");
    // canvas.classList.add("top-layer");
    // canvas.classList.remove("bottom-layer");

    // Set labels visible and update continuously during transition
    // cosmosLabels.setVisible(true);

    // Force render to update the graph
    // graph.render();

    // Schedule updates during transition
    // const transitionDuration = 500;
    // const updateInterval = 100;

    // for (let time = 0; time <= transitionDuration; time += updateInterval) {
    //   setTimeout(() => {
    //     cosmosLabels.update(graph, true);
    //   }, time);
    // }

    // Final update after transition
    // setTimeout(() => {
    //   ensureTopicNodesTracked();
    //   cosmosLabels.update(graph, true);
    // }, transitionDuration + 100);
  }
}

window.addEventListener("resize", scroller.resize);
window.addEventListener("resize", () => {
  if (cosmosLabels && graph) {
    cosmosLabels.repositionLabels(graph);
  }
});

// Ensure continuous label updates
config.onSimulationTick = () => {
  const trackedPointPositions = graph.getTrackedPointPositionsMap();
  let i = 0;
  trackedPointPositions.forEach((positions, pointIndex) => {
    updatedPointPositions[pointIndex * 2] = positions[0];
    updatedPointPositions[pointIndex * 2 + 1] = positions[1];
    i++;
  });

  // Update labels on every simulation tick for smooth transitions
  cosmosLabels.update(graph);
};

// Add a CSS selector check to ensure the labels div is properly styled
function checkLabelsDivStyling() {
  // Make sure the labels div has position: absolute and pointer-events: none
  const labelsDivStyle = window.getComputedStyle(labelsDiv);
  if (
    labelsDivStyle.position !== "absolute" ||
    labelsDivStyle.pointerEvents !== "none"
  ) {
    console.warn(
      "Labels div might not be properly styled. It should have position: absolute and pointer-events: none"
    );

    // Fix it programmatically
    labelsDiv.style.position = "absolute";
    labelsDiv.style.pointerEvents = "none";
    labelsDiv.style.top = "0";
    labelsDiv.style.left = "0";
    labelsDiv.style.width = "100%";
    labelsDiv.style.height = "100%";
    labelsDiv.style.zIndex = "10"; // Make sure it's above the canvas
  }
}

// After the DOM is loaded...
document.addEventListener("DOMContentLoaded", checkLabelsDivStyling);

// Cosmos settings
let updatedPointPositions: number[] = [...pointPositions];

let graph: Graph;

graph = new Graph(canvas, config);

// Set point positions using the new pointPositions from data.ts
graph.setPointPositions(new Float32Array(pointPositions));
graph.setPointColors(new Float32Array(pointColorsBicolor));

graph.setPointSizes(new Float32Array(pointSizesGraph));
graph.setLinks(new Float32Array(links));
graph.setLinkColors(new Float32Array(linkColorsHigh));

graph.render();
graph.setZoomLevel(currentZoom);

// Track all points, using sentence label to get the ID from label mapping
graph.trackPointPositionsByIndices(
  sentences.map((sentence) => pointLabelToIndex.get(sentence.label) as number)
);

// When initializing the graph, track all points that should have labels
// Ensure we're tracking the right points for labels
function ensurePointsAreTracked() {
  // Track all "topic" type nodes for labels
  const topicNodeIndices = [];
  for (let i = 0; i < pointMetadata.length; i++) {
    if (pointMetadata[i] && pointMetadata[i].type === "topic") {
      topicNodeIndices.push(i);
    }
  }
  console.log(`Tracking ${topicNodeIndices.length} topic nodes for labels`);
  // Track these nodes specifically in addition to any currently tracked
  if (topicNodeIndices.length > 0) {
    graph.trackPointPositionsByIndices(topicNodeIndices);
  }
}

// Enable debug mode on the labels to help troubleshoot
// cosmosLabels.setDebugMode(true); // Uncomment this line for detailed debugging

// Ensure label container is properly styled
function ensureLabelContainerStyling() {
  const labelsDivStyle = window.getComputedStyle(labelsDiv);

  // Fix common styling issues
  labelsDiv.style.position = "absolute";
  labelsDiv.style.pointerEvents = "none";
  labelsDiv.style.top = "0";
  labelsDiv.style.left = "0";
  labelsDiv.style.width = "100%";
  labelsDiv.style.height = "100%";
  labelsDiv.style.zIndex = "10"; // Above the canvas

  // Verify styling was applied
  const updatedStyle = window.getComputedStyle(labelsDiv);
  console.log("Labels container styling:", {
    position: updatedStyle.position,
    pointerEvents: updatedStyle.pointerEvents,
    zIndex: updatedStyle.zIndex,
  });
}

// Initialize the visualization properly
function initializeVisualization() {
  // Ensure label container is properly styled
  ensureLabelContainerStyling();

  // Make sure nodes are tracked
  ensureTopicNodesTracked();

  // Set initial zoom level
  graph.setZoomLevel(currentZoom);

  // Render the graph
  graph.render();

  console.log("Visualization initialized successfully");
}

// Call the initialization function
initializeVisualization();

// Expose a debug function to the window for console debugging
window.debugCosmosLabels = function () {
  // Toggle debug mode
  cosmosLabels.setDebugMode(true);

  // Force update labels
  cosmosLabels.setVisible(true);
  cosmosLabels.update(graph, true);
  cosmosLabels.labelRenderer.draw(true);

  // Display number of topic nodes
  const topicNodes = pointMetadata.filter(
    (metadata) => metadata && metadata.type === "topic"
  );
  console.log(`Found ${topicNodes.length} topic nodes in data`);

  // Report tracked nodes
  const trackedPositions = graph.getTrackedPointPositionsMap();
  // console.log(`Graph is tracking ${trackedPositions.size} nodes`);

  // Check if topic nodes are being tracked
  const trackedTopicNodes = [];
  trackedPositions.forEach((positions, index) => {
    if (pointMetadata[index] && pointMetadata[index].type === "topic") {
      trackedTopicNodes.push(index);
    }
  });
  // console.log(`${trackedTopicNodes.length} topic nodes are being tracked`);

  return "Debug information logged to console";
};

let hoveredNodeIndex: number | undefined = undefined;

// Node hover handler for metadata retrieval
function handleCanvasHover(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Convert screen coordinates to space coordinates
  const spaceCoordinates = graph.screenToSpacePosition([x, y]);

  let closestPointIndex: number | undefined;
  let minDistance = Infinity;

  for (let i = 0; i < updatedPointPositions.length / 2; i++) {
    const pointX = updatedPointPositions[i * 2];
    const pointY = updatedPointPositions[i * 2 + 1];

    const dx = spaceCoordinates[0] - pointX;
    const dy = spaceCoordinates[1] - pointY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      closestPointIndex = i;
    }
  }

  if (closestPointIndex !== undefined && minDistance < 5) {
    if (closestPointIndex !== hoveredNodeIndex) {
      hoveredNodeIndex = closestPointIndex;
      const metadata = pointMetadata[closestPointIndex];

      const nodeType = metadata?.type || "unknown";
      console.log(`Hovered over ${nodeType} node`);
      console.log("Node metadata:", metadata || "No metadata available");
    }
  } else {
    hoveredNodeIndex = undefined;
  }

  cosmosLabels.update(graph);
}

// Mouse out handler
canvas.addEventListener("mousemove", handleCanvasHover);
canvas.addEventListener("mouseout", () => {
  hoveredNodeIndex = undefined;
  cosmosLabels.update(graph);
});
