var svgWidth = 750;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
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

// initial params
var chosenXAxis = "poverty";
var chosenYAxis = 'obesity';

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
            d3.min(censusData, d => d[chosenYAxis]) * 0.9,
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

/////////////////////////////////////////////
// function for updating circles group with new tooltip
// @inputs: circlesGroup, chosen x/y axis vars
// @returns: updated circlesGroup
/////////////////////////////////////////////

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // labels based on x-axis
    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Age";
    }
    else {
        var xlabel = "Household Income (Median)";
    }

    // labels based on y-axis
    if (chosenYAxis === "obesity") {
        var ylabel = "Obesity (%)";
    }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smokes (%)";
    }
    else {
        var ylabel = "Lacks Healthcare (%)";
    }
    
    // apply labels to tool tip
    var toolTip = d3.tip()
        .attr("class", "tooltip")	
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
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
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5");
  
    // Create group for 3 x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
  
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median $)");
  
    // Create group for 3 y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    
    var obesityLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obesity (%)");
  
    var smokeLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 20 - margin.left)
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 40 - margin.left)
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
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