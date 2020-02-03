// initial params
var chosenXAxis = "poverty";
var chosenYAxis = 'obesity';


function defaultLabelState(chosenAxis, label, classed) {
    if (chosenAxis === label && classed === 'active') {
        return true;
    }
    else if (chosenAxis === label && classed === 'inactive') {
        return false;
    }
    else if (classed === 'active') {
        return false;
    }
    else {
        return true;
    }
}

function makeResponsive() {

    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
    svgArea.remove();
    }

    var svgWidth = window.innerWidth * 0.8;
    var svgHeight = window.innerHeight * 0.8;

    var margin = {
        top: 20,
        right: window.innerWidth * 0.15,
        bottom: 80,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // create svg wrapper that holds chart
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // append svg group
    var chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    /////////////////////////////////////////////
    // axis scale functions
    // updates scales on clicking axis label
    // @inputs: data and selected axis
    // @returns: updated x/yLinearScale vars
    /////////////////////////////////////////////

    // x-axis
    function xScale(censusData, chosenXAxis) {

        // create scales
        var xLinearScale = d3
            .scaleLinear()
            .domain([
                d3.min(censusData, d => d[chosenXAxis]) * 0.9,
                d3.max(censusData, d => d[chosenXAxis]) * 1.1
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // y-axis
    function yScale(censusData, chosenYAxis) {

        // create scales
        var yLinearScale = d3
            .scaleLinear()
            .domain([
                d3.min(censusData, d => d[chosenYAxis]) * 0.8,
                d3.max(censusData, d => d[chosenYAxis]) * 1.1
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    /////////////////////////////////////////////
    // axis functions
    // updates x/yAxis vars on clicking axis labels
    // @inputs: updated scales and x/yAxis
    // @returns: updated x/yAxis vars
    /////////////////////////////////////////////

    // x-axis
    function renderXAxes(newXScale, xAxis) {

        var bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
    
        return xAxis;
    }

    // y-axis
    function renderYAxes(newYScale, yAxis) {

        var leftAxis = d3.axisLeft(newYScale);
    
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
    
        return yAxis;
    }

    /////////////////////////////////////////////
    // function for updating circles group with transitions
    // @inputs: circlesGroup, new x/y scales, chosen x/y axis vars
    // @returns: updated circlesGroup
    /////////////////////////////////////////////

    function renderCircles(circlesGroup, 
        newXScale, chosenXAxis, 
        newYScale, chosenYAxis) {

            circlesGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]))
                .attr("cy", d => newYScale(d[chosenYAxis]));
            return circlesGroup;
    }

    function renderCirclesLabels(circlesLabelsGroup, 
        newXScale, chosenXAxis, 
        newYScale, chosenYAxis) {

            circlesLabelsGroup.transition()
                .duration(1000)
                .attr("x", d => (newXScale(d[chosenXAxis])))
                .attr("y", d => (newYScale(d[chosenYAxis])) + 4.5)
                .attr("text-anchor", "middle");

            return circlesLabelsGroup;
    }

    /////////////////////////////////////////////
    // function for updating circles group with new tooltip
    // @inputs: circlesGroup, chosen x/y axis vars
    // @returns: updated circlesGroup
    /////////////////////////////////////////////

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        // labels based on x-axis
        if (chosenXAxis === "poverty") {
            var xlabel = "Poverty (%):";
        }
        else if (chosenXAxis === "age") {
            var xlabel = "Age:";
        }
        else {
            var xlabel = "Household Income (Median):";
        }

        // labels based on y-axis
        if (chosenYAxis === "obesity") {
            var ylabel = "Obesity (%):";
        }
        else if (chosenYAxis === "smokes") {
            var ylabel = "Smokes (%):";
        }
        else {
            var ylabel = "Lacks Healthcare (%):";
        }
        
        // apply labels to tool tip
        var toolTip = d3.tip()
            .attr("class", "tooltip")	
            .offset([100, -80])
            .html(function(d) {
                return (`<strong>${d.state}</strong><br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
            });
        
        circlesGroup.call(toolTip);
    
        circlesGroup
            .on("mouseover", function(data) {
                toolTip.show(data);
            })
        // onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });
    
        return circlesGroup;
    }

    // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data/data.csv").then(function(censusData, err) {
        if (err) throw err;

        // parse data
        censusData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            data.healthcare = +data.healthcare;
        });
    
        // xLinearScale function above csv import
        var xLinearScale = xScale(censusData, chosenXAxis);

        // yLinearScale function above csv import
        var yLinearScale = yScale(censusData, chosenYAxis);
    
        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
    
        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // append initial circle labels
        var circlesLabelsGroup = chartGroup.selectAll("circleLabel")
            .data(censusData)
            .enter()
            .append("text")
            .attr("class", "circle-labels")
            .attr("x", d => (xLinearScale(d[chosenXAxis])))
            .attr("y", d => (yLinearScale(d[chosenYAxis])) + 4.5)
            .attr("text-anchor", "middle")
            .text(d => d.abbr)
    
        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 15)
            .attr("fill", "#7fcd91")
            .attr("stroke", "#f5eaea")
            .attr("stroke-width", "2px")
            .attr("opacity", ".5");

        // Create group for 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", defaultLabelState(chosenXAxis, 'poverty', 'active'))
            .classed("inactive", defaultLabelState(chosenXAxis, 'poverty', 'inactive'))
            .text("In Poverty (%)");

        console.log(defaultLabelState(chosenXAxis, ))
    
        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed('active', defaultLabelState(chosenXAxis, 'age', 'active'))
            .classed("inactive", defaultLabelState(chosenXAxis, 'age', 'inactive'))
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed('active', defaultLabelState(chosenXAxis, 'income', 'active'))
            .classed("inactive", defaultLabelState(chosenXAxis, 'income', 'inactive'))
            .text("Household Income (Median $)");
    
        // Create group for 3 y-axis labels
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        
        var obesityLabel = ylabelsGroup.append("text")
            .attr("x", 0 - (height / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity") // value to grab for event listener
            .classed("active", defaultLabelState(chosenYAxis, 'obesity', 'active'))
            .classed("inactive", defaultLabelState(chosenYAxis, 'obesity', 'inactive'))
            .text("Obesity (%)");
    
        var smokeLabel = ylabelsGroup.append("text")
            .attr("x", 0 - (height / 2))
            .attr("y", 20 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes") // value to grab for event listener
            .classed('active', defaultLabelState(chosenYAxis, 'smokes', 'active'))
            .classed("inactive", defaultLabelState(chosenYAxis, 'smokes', 'inactive'))
            .text("Smokes (%)");

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("x", 0 - (height / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare") // value to grab for event listener
            .classed('active', defaultLabelState(chosenYAxis, 'healthcare', 'active'))
            .classed("inactive", defaultLabelState(chosenYAxis, 'healthcare', 'inactive'))
            .text("Lakes Healthcare (%)");
    
        // updateToolTip function above csv import
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {

                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {
    
                    // replaces chosenXAxis with value
                    chosenXAxis = value;
                    
                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(censusData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);
        
                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesLabelsGroup = renderCirclesLabels(circlesLabelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    }
                }
        });

        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function() {
                
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {
    
                    // replaces chosenYAxis with value
                    chosenYAxis = value;
                    
                    // functions here found above csv import
                    // updates y scale for new data
                    yLinearScale = yScale(censusData, chosenYAxis);
            
                    // updates y axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);
        
                    // updates circles with new y values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesLabelsGroup = renderCirclesLabels(circlesLabelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    }
                }
        });

    }).catch(function(error) {
        console.log(error);
        });
}

makeResponsive();

d3.select(window).on("resize", makeResponsive);