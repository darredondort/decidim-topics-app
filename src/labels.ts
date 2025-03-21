// labels.ts



import { LabelRenderer, LabelOptions } from "@interacta/css-labels";
import { Graph } from "@cosmograph/cosmos";
import { pointIndexToLabel, pointMetadata } from "./data";

export class CosmosLabels {
  public labelRenderer: LabelRenderer;
  private labels: LabelOptions[] = [];
  private isVisible: boolean = false;
  private debugMode: boolean = false;
  private visibleIndices: Set<number> = new Set(); // Track which nodes should have visible labels
  private canvas: HTMLCanvasElement;

  constructor(div: HTMLDivElement) {
    // Ensure the div has proper styling
    div.style.position = "absolute";
    div.style.pointerEvents = "none";
    div.style.top = "0";
    div.style.left = "0";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.zIndex = "10";

    this.labelRenderer = new LabelRenderer(div, {
      pointerEvents: "none",
      // defaultLabelOptions: {
      //   fontSize: "12px",
      //   fontWeight: "bold",
      //   color: "#FFFFFF",
      //   backgroundColor: "rgba(0,0,0,0.5)",
      //   padding: "3px 6px",
      //   borderRadius: "2px",
      //   textAlign: "center"
      // }
    });

    // Find the canvas element
    this.canvas = document.querySelector("canvas") as HTMLCanvasElement;

    if (this.debugMode) {
      console.log("CosmosLabels initialized with div:", div);
    }
  }

  update(graph: Graph, forceUpdate: boolean = false): void {
    // Only update if visible or forced
    if (!this.isVisible && !forceUpdate) {
      if (this.debugMode) console.log("Labels not visible, skipping update");
      return;
    }

    // Store reference to canvas
    if (!this.canvas) {
      this.canvas = document.querySelector("canvas") as HTMLCanvasElement;
    }

    // Get current node positions from the graph
    const trackedNodesPositions = graph.getTrackedPointPositionsMap();

    if (this.debugMode) {
      console.log(
        `Updating labels. Tracked nodes: ${trackedNodesPositions.size}`
      );
    }

    // Create a new labels array
    const newLabels: LabelOptions[] = [];

    // Process each tracked node
    trackedNodesPositions.forEach((positions, pointIndex) => {
      const metadata = pointMetadata[pointIndex];

      // Main label filter. Only process topic nodes
      if (metadata && metadata.type === "topic") {
        // Get the label text - fallback to index if not found
        const label =
          metadata.topic_label_str ||
          pointIndexToLabel.get(pointIndex) ||
          `Topic ${pointIndex}`;

        // Convert space position to screen position
        const spacePosition = [positions[0], positions[1]];
        const screenPosition = graph.spaceToScreenPosition(spacePosition);

        // Check if node is in viewport
        const isInViewport = this.isPointInViewport(screenPosition);

        // Get the node radius and convert to screen size
        const spaceRadius = graph.getPointRadiusByIndex(pointIndex) || 10;
        const screenRadius = graph.spaceToScreenRadius(spaceRadius);

        // Calculate distance from center for label priority
        // const distanceFromCenter = Math.sqrt(
        //   Math.pow(spacePosition[0], 2) + Math.pow(spacePosition[1], 2)
        // );

        // Only show if in viewport
        if (isInViewport) {
          this.visibleIndices.add(pointIndex);

          newLabels.push({
            id: `node-${pointIndex}`,
            text: label,
            x: screenPosition[0],
            y: screenPosition[1] - (screenRadius + 15),
            opacity: 1,
          });
        }
      }
    });

    // Update labels and force draw if visible
    this.labels = newLabels;
    this.labelRenderer.setLabels(this.labels);

    if (this.isVisible) {
      this.labelRenderer.draw(true);
    }

    if (this.debugMode) {
      console.log(
        `Rendered ${newLabels.length} labels out of ${trackedNodesPositions.size} tracked nodes`
      );
    }
  }

  // Check if a point is in the viewport using screen coordinates
  private isPointInViewport(screenPosition: number[]): boolean {
    if (!this.canvas) {
      return true; // If we can't determine, assume it's visible
    }

    // Add some margin around the viewport
    const margin = 100;

    return (
      screenPosition[0] >= -margin &&
      screenPosition[0] <= this.canvas.width + margin &&
      screenPosition[1] >= -margin &&
      screenPosition[1] <= this.canvas.height + margin
    );
  }

  // Explicitly show or hide labels
  setVisible(visible: boolean): void {
    if (this.debugMode) console.log(`Setting labels visibility to: ${visible}`);
    this.isVisible = visible;
    this.labelRenderer.draw(visible);
  }

  // Force repositioning of all labels (useful during transitions)
  repositionLabels(graph: Graph): void {
    if (this.debugMode) console.log("Forcing label repositioning");
    this.update(graph, true);
  }

  // Clear all labels (useful when changing visualization modes)
  clearLabels(): void {
    if (this.debugMode) console.log("Clearing all labels");
    this.labels = [];
    this.visibleIndices.clear();
    this.labelRenderer.setLabels([]);
    this.labelRenderer.draw(this.isVisible);
  }

  // Enable/disable debug mode
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`Label debug mode ${enabled ? "enabled" : "disabled"}`);
  }

  // Get number of visible labels
  getLabelCount(): number {
    return this.labels.length;
  }
}
