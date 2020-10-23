(function() {
  function map(config) {
    var url = config.url,
        element = config.element,
        zoom = config.zoom || 6;

    var opts = {
      center: [-37.29, 144.61], // center the map on Victoria
      zoom: zoom, // zoom in to fill the screen with the map
      dragging: false, // dont allow the user to move the map around
      scrollWheelZoom: false // don't zoom the map when the user scrolls
    }

    /*
     * Create a Map object using tiles from OpenStreetMap
     */
    var map =
      new L.Map(element, opts)
      .addLayer(
        new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      );

    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

    /*
     * Create a tooltip template for when a region is hovered
     */
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Average: " + d.properties['avg'] +  "</strong></span>"; // d.properties["NAME"]
      })

    svg.call(tip); // Initialize the tip in the context of the map SVG containter

    // Load the GeoJSON projection over HTTP
    d3.json(url, function(error, collection) {
      if (error) throw error;

      var transform = d3.geo.transform({point: projectPoint}),
          path = d3.geo.path().projection(transform);

      var feature =
        g.selectAll("path")
          .data(collection.features) // extract the map features from the GeoJSON
        .enter()
        .append("path")
          .attr("class", "n")
          .attr("class", function(d) { return "region_" + d.properties["id"] })
          .on('mouseover', tip.show) // chuck on a tooltip
          .on('mousedown', tip.show) // chuck on a tooltip
          .on('touchend', tip.show) // chuck on a tooltip
          //.on('mouseout', tip.hide)
          //.on('mouseup', tip.hide);

      map.on("viewreset", reset);
      reset();

      // Reposition the SVG to cover the features.
      function reset() {
        var bounds      = path.bounds(collection),
            topLeft     = bounds[0],
            bottomRight = bounds[1];

        svg.attr("width", bottomRight[0] - topLeft[0])
           .attr("height", bottomRight[1] - topLeft[1])
           .style("left", topLeft[0] + "px")
           .style("top", topLeft[1] + "px");

        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        feature.attr("d", path);
      }

      // Use Leaflet to implement a D3 geometric transformation.
      function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      }
    });
  }

  function m(el, name, zoom) {
    var url = "/dist/data/maps/" + name + ".json";

    return map({
      url: url,
      element: el,
      zoom: zoom
    });
  }

  var to_render = [
    ["bsw_map", "barwon_south_west", 7],

    ["em_map", "eastern_metropolitan", 7],
    ["wm_map", "western_metropolitan", 8],
    ["nm_map", "northern_metropolitan",7],
    ["sm_map", "southern_metropolitan", 7],

    ["gi_map", "gippsland",7],
    ["gr_map", "grampians",7],
    ["hu_map", "hume",7],
    ["lm_map", "loddon_mallee",7],
    ["statewide_map", "state", 6]
  ];

  $(document).ready(function() {
    to_render.forEach(function(ch) {
      console.log(ch);

      m(ch[0], ch[1], ch[2])
    });
  });
})()
