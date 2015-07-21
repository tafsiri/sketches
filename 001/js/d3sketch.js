function Sketch(mapData) {
  this.width = 800;
  this.height = 1000;

  this.mapData = mapData;
  this.countryData = this.mapData.features.filter(function(feature) {
    return feature.properties.type.match(/country/i) || feature.properties.type == 'Disputed' ;
  });
}

Sketch.prototype.init = function() {
  var self = this;

  this.svg = d3.select('#main')
    .append('svg')
    .attr('width', this.width)
    .attr('height', this.height);

  var bg = this.svg
    .append('g')
    .attr('class', 'bg');

  var bgRect = bg
    .append('rect')
    .attr('class', 'bg-rect');


  this.arrangement = "World Map";
  this.projectionStr = "conicEquidistant";
  this.scale = 100;
  this.filter = "World";

  var gui = new dat.GUI();
  var aControl = gui.add(this, 'arrangement', ['World Map', 'Projected Area', 'Spherical Area', 'Alphabetical']);
  var pControl = gui.add(this, 'projectionStr', ['conicEquidistant','equirectangular', 'mercator', 'stereographic',
    'azimuthalEqualArea', 'azimuthalEquidistant', 'conicConformal', 'conicEqualArea', 'orthographic']);
  var sControl = gui.add(this, 'scale', 50, 250);
  var fControl = gui.add(this, 'filter', ['World', 'Africa', 'Asia', 'North America', 'South America',
   'Europe', 'Oceania']);

  aControl.onChange(function(value) {
    self.render();
  });

  pControl.onChange(function(value) {
    self.projection = d3.geo[value]()
      .scale(self.scale);

    self.path = d3.geo.path()
      .projection(self.projection);

    self.render();
  });

  sControl.onChange(function(value) {
    self.projection.scale(value);
    self.render();
  });

  fControl.onChange(function(value) {
    self.render();
  });



  // Create a projection and a path generator
  this.projection = d3.geo[this.projectionStr]()
    .scale(this.scale);
    // .translate([this.width / 2, this.height / 2]);

  this.path = d3.geo.path()
    .projection(this.projection);


};


Sketch.prototype.update = function() {

};


Sketch.prototype.render = function() {
  var self = this;

  d3.select('rect.bg-rect')
    .attr('fill', '#fff')
    .attr('stroke', '#222')
    .attr('stroke-weight', 2)
    .attr('width', this.width)
    .attr('height', this.height);

  var bg = this.svg.select('g.bg');


  // sort data

  var data = _.sortBy(this.countryData, function(d) {
    switch(self.arrangement) {
      case "Alphabetical":
        return d.properties.admin;
      case "Projected Area":
        return self.path.area(d);
      case "Spherical Area":
        return d3.geo.area(d);
      default:
        break;
    }
  });

  data = _.filter(data, function(d){
    if(self.filter === 'World') {
      return true;
    } else {
      return d.properties.continent === self.filter;
    }
  });

  // console.log('data', data)

  var bind = bg.selectAll('path')
    .data(data, function(d){
      return d.properties.adm0_a3;
    });

  var currX = 20;
  var currY = 20;

  var tallest = 0;
  var maxHeight = 0;


  var transform = d3.svg.transform()
    .translate(function(d, i) {
      // console.log('translate', d)
      if(self.arrangement === "World Map"){
        maxHeight = 500;
        return [-130, 75];
      }

      var centroid = self.path.centroid(d);

      var bb = self.path.bounds(d);
      var width = bb[1][0] - bb[0][0];
      var height = bb[1][1] - bb[0][1];

      if(height > tallest) {
        tallest = height;
      }

      if(currX >= self.width - 150  || d.properties.admin == "Russia") {
        currX = 20;
        currY += tallest + 40;

        tallest = 0;
      }



      var nx = width + currX + 20;
      var ny = height + currY;

      // console.log(d.properties.admin, centroid, width, height, nx, ny);



      currX = nx;

      if(ny > maxHeight) {
        maxHeight = ny;
      }

      return [nx - centroid[0], ny - centroid[1]];
    });

  bind.enter()
    .append("path")
    .attr("class", function(d) {
      return d.properties.admin;
    });

  bind
    .transition()
    .duration(500)
    .attr('opacity', 1)
    .attr("d", function(d) {
      return self.path(d);
    })
    .attr("transform", function(d, i) {
      return transform(d, i);
    })
    .attr("fill", "grey")
    .attr("stroke", "black");

  bind.exit()
    .transition()
    .duration(200)
    .attr('opacity', 0);


  maxHeight = maxHeight + 150;

  self.svg
    .transition()
    .duration(200)
    .attr('height', maxHeight);

  d3.select('rect.bg-rect')
    .transition()
    .duration(200)
    .attr('height', maxHeight);



};


document.addEventListener('DOMContentLoaded', function() {
  console.log('hello d3');

  // Load world map geojson

  $.getJSON('data/world-110m-countries.json')
    .done(function(data) {
      var s = new Sketch(data);
      s.init();
      s.update();
      s.render();



    })
    .fail(function(error) {
      console.log('error loading map data');
    });



});
