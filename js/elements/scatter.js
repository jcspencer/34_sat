(function () {
  var el = d3.select("#scatterplot");

  var margin = {top: 20, right: 20, bottom: 30, left: 40};
  var width = (parseInt(el.style('width'), 10)) - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var currencyFormat = d3.format("$0.2f"); // formats currency to 2dp and adds a '$'.
  var decimalFormat = d3.format("0.4f"); // formats decimals to 4dp.

  /* 
   * value accessor - returns the value to encode for a given data object.
   * scale - maps value to a visual display encoding, such as a pixel position.
   * map function - maps from data value to display value
   * axis - sets up axis
   */

  // setup x
  var xValue = ƒ('fees'), // data -> value
      xScale = d3.scale.linear().range([0, width]), // value -> display
      xMap = function(d) { return xScale(xValue(d)); }, // data -> display
      xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(function(d) { return (d/1000) + 'k'; });

  // setup y
  var yValue = ƒ('median'), // data -> value
      yScale = d3.scale.linear().range([height, 0]), // value -> display
      yMap = function(d) { return yScale(yValue(d)); }, // data -> display
      yAxis = d3.svg.axis().scale(yScale).orient("left");

  // add the graph canvas to the body of the webpage
  var svg = el.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var color = d3.scale.category10(); // create 10 different colours to use

  var tip = d3.tip() // setup a tooltip template for each data point
    .attr('class', 'd3-tip')
    //.offset([-10, 0])
    .direction('e')
    .html(function(d) {
      var median = d.median,
          fees = currencyFormat(d.fees),
          name = d.name;

      return "<i>" + name + "</i> (" + fees + ", " + median + ")";
    });

  svg.call(tip); // initalize the tip in the context of the SVG

  // load data
  d3.csv("/dist/data/state/fees.csv", function(error, data) {
    // change string (from CSV) into number format
    data.forEach(function(d) {
      d.fees = +d.fees;
      d.median = +d.median
    });

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-0.5, d3.max(data, yValue)+1]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Fees ($ AUD)");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Median Score");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .attr("fill", function(d, i){ return color(i); })
        .on('mouseover', tip.show) // chuck on a tooltip
        .on('mousedown', tip.show) // chuck on a tooltip
        //.on('mouseout', tip.hide)
        //.on('mouseup', tip.hide);

    var xSeries = data.map(ƒ('fees')); // all the x values
    var ySeries = data.map(ƒ('median')); // all the y values

    var leastSquaresCoeff = leastSquares(xSeries, ySeries);

    // apply the results of the least squares regression
    var x1 = d3.min(data, xValue);
    var y1 = leastSquaresCoeff[0]*x1 + leastSquaresCoeff[1];
    var x2 = d3.max(data, xValue);
    var y2 = leastSquaresCoeff[0]*x2 + leastSquaresCoeff[1];

    var trendData = [[x1, y1, x2, y2]];

    var trendline = svg.selectAll(".trendline")
      .data(trendData);

    trendline.enter() // plot the trendline
      .append("line")
      .attr("class", "trendline")
      .attr("x1", function(d) { return xScale(d[0]); })
      .attr("y1", function(d) { return yScale(d[1]); })
      .attr("x2", function(d) { return xScale(d[2]); })
      .attr("y2", function(d) { return yScale(d[3]); })
      .attr("stroke", "#5E9BAA")
      .attr("stroke-width", 2);

    // display equation on the chart
    svg.append("text")
      .text("eq: " + decimalFormat(leastSquaresCoeff[0]) + "x + " +
        decimalFormat(leastSquaresCoeff[1]))
      .attr("class", "text-label")
      .attr("x", function(d) {return xScale(x2) - 200;})
      .attr("y", function(d) {return yScale(y1) + 80 + 30;});

    // display r-squared value on the chart
    svg.append("text")
      .text("r-sq: " + decimalFormat(leastSquaresCoeff[2]))
      .attr("class", "text-label")
      .attr("x", function(d) {return xScale(x2) - 200;})
      .attr("y", function(d) {return yScale(y1) + 80 + 10;});
  });


  // returns slope, intercept and r-square of the line
  function leastSquares(xSeries, ySeries) {
    var sum = function(prev, cur) { return prev + cur; }; // adds all the elements in a set
    var avg = function(set) { return set.reduce(sum) / set.length; }; // calculate the average of a set

    var xBar = avg(xSeries); // x series average
    var yBar = avg(ySeries); // y series average

    // sum of squares = sum(x_i - xBar)^2
    var ssXX = xSeries
      .map(function(d) {
        return Math.pow(d - xBar, 2);
      })
      .reduce(sum);

    // sum of squares = sum(y_i - yBar)^2
    var ssYY = ySeries
      .map(function(d) {
        return Math.pow(d - yBar, 2);
      })
      .reduce(sum);

    // sum of squares = sum(x_i - xBar)(y_i - yBar)
    var ssXY = xSeries
      .map(function(d, i) {
        return (d - xBar) * (ySeries[i] - yBar);
      })
      .reduce(sum);

    var slope = d3.round(ssXY / ssXX, 4); // round the value to 4dp, no need for super-high precision
    var intercept = d3.round(yBar - (xBar * slope), 4); // ditto
    var rSquare = d3.round(Math.pow(ssXY, 2) / (ssXX * ssYY), 4); // ditto

    return [slope, intercept, rSquare];
  }
})()
