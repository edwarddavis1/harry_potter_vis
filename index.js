import { scatterPlot } from "./scatterPlot.js";
import { networkPlot } from "./network.js";
// import { networkPlot } from "./networkNoAnimate.js";

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load data from data.json
async function loadGraph() {
    const data = await d3.json("./data/emnity_graph.json");
    return data;
}

async function loadSpringPositions() {
    const data = await d3.csv("./data/pos_emnity_graph.csv");
    return data;
}

// Load data from plot_df.csv
async function loadEmbedding() {
    const data = await d3.csv("./data/plot_df.csv");

    // convert strings to numbers
    data.forEach((d) => {
        d.x_emb = +d.x_emb;
        d.y_emb = +d.y_emb;
    });

    return data;
}

// Add text above the network plot
svg.append("text")
    .attr("x", 10)
    .attr("y", 20)
    .attr("class", "plot-heading")
    .attr("fill", "grey")
    .text("Network");

svg.append("text")
    .attr("x", width / 2 + 10)
    .attr("y", 20)
    .attr("class", "plot-heading")
    .attr("fill", "grey")
    .text("Network Embedding");

// Create a network plot from the data
async function main() {
    const embeddingData = await loadEmbedding();
    const scatter = scatterPlot()
        .width(width)
        .height(height)
        .data(embeddingData)
        .margin({
            top: 30,
            right: 30,
            bottom: 30,
            left: 30,
            left: width / 2,
        })
        .size(5)
        .xValue((d) => d.x_emb)
        .yValue((d) => d.y_emb)
        .tau((d) => d.tau)
        .yAxisLabel("Embedding Dimension 2")
        .xAxisLabel("Embedding Dimension 1")
        .xDomain(d3.extent(embeddingData, (d) => d.x_emb))
        .yDomain(d3.extent(embeddingData, (d) => d.y_emb))
        // .yDomain([-1.177, 1.172])
        // .xDomain([-1.256, 0])
        .colourValue((d) => d.tau);

    svg.call(scatter);

    const graphData = await loadGraph();
    // const network = networkPlot()
    //     .width(width / 2)
    //     .height(height)
    //     .data(graphData);

    const springPositions = await loadSpringPositions();

    const network = networkPlot()
        .width(width / 2)
        .height(height)
        .tau((d) => d.tau)
        // .xDomain(d3.extent(springPositions, (d) => d.x))
        // .yDomain(d3.extent(springPositions, (d) => d.y))

        .data(graphData);
    // .margin({
    //     top: height / 4,
    //     right: 50,
    //     bottom: height / 4,
    //     left: 30,
    // })
    // .precomputedPositions(springPositions);

    svg.call(network);

    let colours = [
        "#41b6c4",
        "#CA054D",
        "#3B1C32",
        "#B96D40",
        "#F9C846",
        "#6153CC",
    ];

    // Define the tooltip element
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute");

    // Add the mouseover and mouseout events to the scatter plot circles
    svg.selectAll("circle")
        .on("mouseover", function (_) {
            console.log(this.getAttribute("tau"));

            // Show the tooltip with the data
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0.9)
                .style("background-color", colours[0]);
            tooltip
                .html(this.getAttribute("tau"))
                .style("left", (window.innerWidth / 4) * 3 + "px")
                .style("top", window.innerHeight / 2 + "px");

            d3.select(this).attr("r", 10);

            d3.selectAll("circle")
                .attr("fill", (d) => {
                    if (d.id == this.id) {
                        return colours[4];
                    } else {
                        return colours[1];
                    }
                })
                .attr("r", (d) => {
                    if (d.id == this.id) {
                        return 10;
                    } else {
                        return 5;
                    }
                });
        })
        .on("mouseout", function (d) {
            // Hide the tooltip
            tooltip.transition().duration(500).style("opacity", 0);
            d3.select(this).attr("r", 5).attr("stroke", "none");

            d3.selectAll("circle")
                .attr("fill", (d) => {
                    return colours[1];
                })
                .attr("r", 5);
        });
}

main();
