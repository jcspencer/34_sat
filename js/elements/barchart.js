(function() {
  window.datums = [];
  function barchart(config) {
    var margin = config.margin,
        width = config.width,
        height = config.height,
        element = config.element,
        data = config.data,
        xstart = 0,
        domain_sway_min = config.domain_sway_min || 4,
        domain_sway_max = config.domain_sway_max || 4;

    var svg =
      element.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.linear()
        .range([xstart, width]); // x scale

    var y = d3.scale.ordinal()
        .rangeRoundBands([xstart, height], 0.1); // y scale

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(d) { return d.toFixed(0); }); // plot the x axis

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(0)
        .tickPadding(6); // plot the y axis

    /*
     * Create a tooltip template for when a bar is hovered
     */
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        var pct = d['pct'],
            median = d['median'];

          return "<span class='figure'>"
            + ((pct <= 0 ? '' : '+') + pct)
            + "% <i>("
            + median
            + ")</i></span>";
      });

    svg.call(tip); // Initialize the tip in the context of the map SVG containter

    d3.csv(data, type, function(error, data) {
      var minimum_x = d3.min(data, ƒ('pct')) - domain_sway_min; // minimum x value
      var maximum_x = d3.max(data, ƒ('pct')) + domain_sway_max; // maximum x value

      x.domain([minimum_x, maximum_x]).nice(); // creates the x axis scale
      y.domain(data.map(ƒ('name'))); // splits each bar by name

      svg
        .selectAll(".bar")
          .data(data)
        .enter()
        .append("rect")
          .attr("class", function(d) { return "bar bar--" + d.class; }) // attach the bar class
          .attr("x", function(d) { return x(Math.min(xstart, d.pct)); }) // horizonal positioning
          .attr("y", function(d) { return y(d.name); }) // vertial positioning
          .attr("width", function(d) { return Math.abs(x(d.pct) - x(xstart)); })
          .attr("height", y.rangeBand())
          .on('mouseover', tip.show) // chuck on a tooltip
          .on('mousedown', tip.show) // chuck on a tooltip
          .on('touchstart', tip.show) // chuck on a tooltip
          .on('mouseout', tip.hide)
          .on('mouseup', tip.hide);

      var xax = svg.append("g") // x axis
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      var yax = svg.append("g") // y axis
          .attr("class", "y axis")
          .attr("transform", "translate(" + x(xstart) + ",0)")
          .call(yAxis);
    });

    function type(d) {
      d.pct = +d.pct;
      d.median = +d.median;
      d.students = +d.students;
      return d;
    }
  }

  function bc(el, name, sway) {
    var el = d3.select(el);

    var margin = {top: 20, right: 30, bottom: 40, left: 30};
    var width = (parseInt(el.style('width'), 10)) - margin.left - margin.right;
    var height = 200 - margin.top - margin.bottom;
    var data = "/dist/data/results/" + name + ".csv";

    barchart({
      margin: margin,
      height: height,
      width: width,

      element: el,
      data: data,

      domain_sway_min: sway[0],
      domain_sway_max: sway[1]
    });
  }

  var to_render = [
    ["#bsw_barchart", "barwon_south_west", [0, 0]],

    ["#em_barchart", "eastern_metropolitan", [5, 2]],
    ["#wm_barchart", "western_metropolitan", [0.5, 1]],
    ["#nm_barchart", "northern_metropolitan", [0, 0]],
    ["#sm_barchart", "southern_metropolitan", [2, 1]],

    ["#gi_barchart", "gippsland", [0, 0]],
    ["#gr_barchart", "grampians", [0, 0]],
    ["#hu_barchart", "hume", [0, 0]],
    ["#lm_barchart", "loddon_mallee", [0, 0]],

    ["#statewide_barchart", "state", [0, 0]]
  ];

  $(document).ready(function() {
    to_render.forEach(function(ch) {
      bc(ch[0], ch[1], ch[2])
    });
  })
})();
