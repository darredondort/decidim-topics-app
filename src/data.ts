// data.ts

import { sentences } from "./sentences_top20.ts";
import { scaleLog, scalePow, scaleSymlog } from "d3-scale";
import { extent } from "d3-array";
import * as d3 from "d3";

// Define constants for Cosmos space
// Set up the boundaries and usable area for our visualization
const cosmosSpaceSize = 4096;
const paddingRatio = 0.001; // 0.1% padding on each side
const usableSpaceSize = cosmosSpaceSize * (1 - paddingRatio * 2);
const spaceMin = -cosmosSpaceSize / 2 + cosmosSpaceSize * paddingRatio;
const spaceMax = cosmosSpaceSize / 2 - cosmosSpaceSize * paddingRatio;

// Define color constants for visual coding topics VS documents
const TOPIC_COLOR = [244 / 255, 253 / 255, 117 / 255];
const TEXT_COLOR = [81 / 255, 66 / 255, 93 / 255];

let [minSizeDoc, maxSizeDoc]: number[] = [4, 4]
let [minSizeTopic, maxSizeTopic]: number[] = [48, 80]

// Link color intensities
const linkColorsHigh = "rgba(244,253,117,0.3)";
const linkColorsLow = "rgba(244,253,117,0.2)";
const linkColorsDisabled = "rgba(244,253,117,0.0)";

// Apply non-linear scaling to spread out data points
function applyNonLinearScaling(
  values: number[],
  targetRange: [number, number]
): number[] {
  const [min, max] = extent(values);

  // If the range is small, use power scale to spread data
  if (max - min < 1) {
    const scale = scalePow()
      // .exponent(5) // Adjust exponent as needed
      .exponent(1)
      .domain([min, max])
      .range(targetRange);
    return values.map((v) => scale(v));
  }

  // Use symlog for data with negative/zero values or clustered points
  if (min < 0 || values.some((v) => v === 0)) {
    const scale = scaleSymlog()
      .constant(10)
      // .constant(15)
      // .constant(5)
      .domain([min, max])
      .range(targetRange);
    return values.map((v) => scale(v));
  }

  // Use log scale for positive-only data
  const scale = scaleLog()
    .domain([Math.max(0.001, min), max])
    .range(targetRange);

  return values.map((v) => scale(Math.max(0.001, v)));
}

// Apply scaling to both X and Y coordinates
function scaleCoordinates(
  allX: number[],
  allY: number[]
): { scaledX: number[]; scaledY: number[] } {
  const scaledX = applyNonLinearScaling(allX, [spaceMin, spaceMax]);
  const scaledY = applyNonLinearScaling(allY, [spaceMin, spaceMax]);

  // console.log(
  //   "Scaled X range:",
  //   Math.min(...scaledX),
  //   "to",
  //   Math.max(...scaledX)
  // );
  // console.log(
  //   "Scaled Y range:",
  //   Math.min(...scaledY),
  //   "to",
  //   Math.max(...scaledY)
  // );

  return { scaledX, scaledY };
}

// Extract all X and Y coordinates from the sentences data
const allX = sentences.map((p) => p.x);
const allY = sentences.map((p) => p.y);

// Scale the coordinates to fit within our Cosmos space
const { scaledX, scaledY } = scaleCoordinates(allX, allY);

// Initialize data structures for storing node information
const pointLabelToIndex = new Map<string, number>();
const pointIndexToLabel = new Map<number, string>();
const pointPositions: number[] = [];
const pointColorsBicolor: number[] = [];
// const pointSizes: number[] = [];
const pointSizesGraph: number[] = [];
const pointSizesEmbeddings: number[] = [];
const pointMetadata: any[] = [];

// Create nodes with scaled positions
sentences.forEach((p, index) => {
  // Map labels to indices and vice versa
  pointLabelToIndex.set(p.label, index);
  pointIndexToLabel.set(index, p.label);

  // Store metadata for each point
  pointMetadata.push(p || {});

  // Use scaled coordinates for point positions
  pointPositions.push(scaledX[index], scaledY[index]);

  // Set colors based on whether the point is a topic or text
  const [r, g, b] = p.type === "topic" ? TOPIC_COLOR : TEXT_COLOR;
  pointColorsBicolor.push(r, g, b, 0.7);

  // const [lr, lg, lb, la] = LINK_COLOR_HIGH;
  // linkColorsHigh.push(lr, lg, lb, la);
  // console.log("")
  // console.log(lilinkColorsHighnkColorsHigh)

  // const [lr, lg, lb] = LINK_COLOR_HIGH;
  // const [lr, lg, lb] = LINK_COLOR_HIGH;
  // linkColorsHigh.push(r, g, b, 0.7);

  // linkColorsHigh.push(1, 0, 0, 0.5);
  // linkColorsLow.push(1, 0, 0, 0.1);
  // linkColorsDisabled.push(1, 0, 0, 0);

  // Determine point size based on type and value
  
  
  // graph node sizes
  const isTopic = p.type === "topic";
  const scaleParamsGraph = isTopic
    ? { scale: 0.8, min: minSizeTopic, max: maxSizeTopic }
    : { scale: 1, min: minSizeDoc*2, max: maxSizeDoc*2 };

  const rawValueGraph = Number(p.value);

  let sizeGraph = Math.min(
    scaleParamsGraph.max,
    Math.max(scaleParamsGraph.min, rawValueGraph * scaleParamsGraph.scale)
  );

  pointSizesGraph.push(sizeGraph);


    // embedding node sizes
    const scaleParamsEmbeddings = isTopic
      ? { scale: 0.8, min: minSizeTopic, max: maxSizeTopic }
      : { scale: 0.1, min: minSizeDoc, max: maxSizeDoc };
  
    const rawValueEmbeddings = Number(p.value);
  
    let sizeEmbeddings = Math.min(
      scaleParamsEmbeddings.max,
      Math.max(scaleParamsEmbeddings.min, rawValueEmbeddings * scaleParamsEmbeddings.scale)
    );
  
    pointSizesEmbeddings.push(sizeEmbeddings);
});

// Cluster colors using d3 scheme
// const topicLabels = [...new Set(pointMetadata.map(metadata => metadata.topic_label_str))];
// const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(topicLabels);
// const pointColors = pointMetadata.flatMap(metadata => {
//   const topicLabel = metadata.topic_label_str;
//   const color = colorScale(topicLabel) as string; // Get the color from the scale

//   // Convert the color to rgba with 0.5 opacity
//   const rgbaColor = d3.color(color)?.rgb();
//   const r = rgbaColor?.r || 0;
//   const g = rgbaColor?.g || 0;
//   const b = rgbaColor?.b || 0;

//   return [r / 255, g / 255, b / 255, 0.5]; // Normalize to 0-1 range and set opacity to 0.5
// });

// Cluster colors using color blind prefixed palette
// Define the fixed color array (RGBA strings)
let assignedColors: String =[]
const fixedColors = [
  "rgb(207,153,92)",
  "rgb(87,124,235)",
  "rgb(140,179,63)",
  "rgb(90,87,186)",
  "rgb(92,192,106)",
  "rgb(176,115,217)",
  "rgb(198,178,68)",
  "rgb(76,53,137)",
  "rgb(161,187,105)",
  "rgb(205,110,198)",
  "rgb(74,192,143)",
  "rgb(194,71,145)",
  "rgb(62,125,60)",
  "rgb(115,44,115)",
  "rgb(51,212,209)",
  "rgb(204,63,92)",
  "rgb(88,136,224)",
  "rgb(200,136,50)",
  "rgb(88,139,207)",
  "rgb(193,83,44)",
  "rgb(158,129,207)",
  "rgb(98,114,30)",
  "rgb(220,128,187)",
  "rgb(169,99,55)",
  "rgb(138,43,89)",
  "rgb(213,87,79)",
  "rgb(217,90,136)",
  "rgb(132,39,32)",
  "rgb(221,111,120)",
  "rgb(149,48,70)",
];

//  Extract unique topic_label_str values
const topicLabels = [
  ...new Set(pointMetadata.map((metadata) => metadata.topic_label_str)),
];

// Create a color scale that maps topic labels to the fixed color array
const colorScale = (topicLabel: string) => {
  const index = topicLabels.indexOf(topicLabel);
  if (index !== -1) {
    const color = fixedColors[index % fixedColors.length]; // Cycle through the colors
    const rgbaColor = d3.color(color)?.rgb();
    const r = rgbaColor?.r || 0;
    const g = rgbaColor?.g || 0;
    const b = rgbaColor?.b || 0;
    const assignedColor = `rgba(${r}, ${g}, ${b}, 0.5)`
    if (!assignedColors.includes(assignedColor)) {
      assignedColors.push(assignedColor)
    }
    return assignedColor;
  } else {
    // Handle the case where the topicLabel is not found (optional)
    console.warn(`Topic label "${topicLabel}" not found in topicLabels.`);
    return "rgba(0, 0, 0, 0.5)"; // Default transparent black
  }
};

// Generate the pointColors array based on topic_label_str
const pointColors = pointMetadata.flatMap((metadata) => {
  const topicLabel = metadata.topic_label_str;
  const color = colorScale(topicLabel);

  // Extract the RGBA values from the returned rgba string

  const match = color.match(
    /rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(?:\.\d+)?)\)/
  );

  if (match) {
    const r = parseInt(match[1]) / 255;
    const g = parseInt(match[2]) / 255;
    const b = parseInt(match[3]) / 255;
    const a = parseFloat(match[4]); // Opacity is already applied

    return [r, g, b, a];
  } else {
    // Handle the case where the color string doesn't match the expected format
    console.warn(`Unexpected color format: ${color}`);
    return [255, 0, 0, 0.5]; // Default transparent black
  }
});

// Create links between nodes
const links: number[] = [];
sentences.forEach((source) => {
  if (source.type === "document") {
    const targetTopicLabel = source.topic_label_str;
    const target = sentences.find(
      (s) => s.topic_label_str === targetTopicLabel && s.type === "topic"
    );

    if (target) {
      const sourceIndex = pointLabelToIndex.get(source.label);
      const targetIndex = pointLabelToIndex.get(target.label);

      if (sourceIndex !== undefined && targetIndex !== undefined) {
        links.push(sourceIndex, targetIndex);
      }
    }
  }
});

// Export data structures for use in other parts of the application
export {
  pointPositions,
  pointColors,
  pointColorsBicolor,
  linkColorsHigh,
  linkColorsLow,
  linkColorsDisabled,
  // pointSizes,
  pointSizesGraph,
  pointSizesEmbeddings,
  pointLabelToIndex,
  pointIndexToLabel,
  pointMetadata,
  links,
  cosmosSpaceSize,
  usableSpaceSize,
  sentences,
  fixedColors,
  assignedColors
};
