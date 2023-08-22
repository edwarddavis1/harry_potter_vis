export const networkPlot = () => {
    let width;
    let height;
    let data;
    let precomputedPositions;
    let xDomain;
    let yDomain;
    let margin;
    let colours = [
        "#41b6c4",
        "#CA054D",
        "#3B1C32",
        "#B96D40",
        "#F9C846",
        "#6153CC",
    ];

    const my = (selection) => {
        // const simulation = d3
        //     .forceSimulation(data.nodes)
        //     .force(
        //         "link",
        //         d3.forceLink(data.links).id((d) => d.id)
        //     )
        //     .force("charge", d3.forceManyBody())
        //     .force("center", d3.forceCenter(width / 2, height / 2));

        const x = d3

            .scaleLinear()
            // .domain(d3.extent(data, xValue))
            .domain([-1, 1])
            // .domain(xDomain)
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            // .domain(d3.extent(data, yValue))
            .domain([-1, 1])
            // .domain(yDomain)
            .range([height - margin.bottom, margin.top]);

        function getXY(id) {
            return precomputedPositions.filter((d) => d.id == id)[0];
        }

        const link = selection
            .append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", 20 / precomputedPositions.length)
            .attr("class", "network")
            .attr("x1", (d) => x(getXY(d.source).x))
            .attr("y1", (d) => y(getXY(d.source).y))
            .attr("x2", (d) => x(getXY(d.target).x))
            .attr("y2", (d) => y(getXY(d.target).y));

        const node = selection
            .append("g")
            .selectAll("circle")
            .data(precomputedPositions)
            .join("circle")
            .attr("r", 5)
            .attr("fill", (d) => colours[d.tau])
            .attr("class", "network")
            .attr("id", (d) => d.id)
            .attr("cx", (d) => x(d.x))
            .attr("cy", (d) => y(d.y));

        d3.selectAll("circle")
            .on("mouseover", function (_) {
                d3.select(this).attr("r", 10);

                d3.selectAll("circle")
                    .attr("fill", (d) => {
                        if (d.id == this.id) {
                            return colours[4];
                        } else {
                            return colours[d.tau];
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
            .on("mouseout", function (_) {
                d3.select(this).attr("r", 5).attr("stroke", "none");

                d3.selectAll("circle")
                    .attr("fill", (d) => {
                        return colours[d.tau];
                    })
                    .attr("r", 5);
            });
    };
    my.width = function (_) {
        return arguments.length ? ((width = _), my) : width;
    };
    my.height = function (_) {
        return arguments.length ? ((height = _), my) : height;
    };
    my.data = function (_) {
        return arguments.length ? ((data = _), my) : data;
    };
    my.get_node = function (id) {
        return data.nodes.filter((d) => d.id == id)[0];
    };
    my.precomputedPositions = function (_) {
        return arguments.length
            ? ((precomputedPositions = _), my)
            : precomputedPositions;
    };
    my.xDomain = function (_) {
        return arguments.length ? ((xDomain = _), my) : xDomain;
    };
    my.yDomain = function (_) {
        return arguments.length ? ((yDomain = _), my) : yDomain;
    };
    my.margin = function (_) {
        return arguments.length ? ((margin = _), my) : margin;
    };
    return my;
};
