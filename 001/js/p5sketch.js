function sketch() {

  return function(p) {

    var width = 100;
    var height = 100;

    p.setup = function() {
      p.createCanvas(width, height);
    };

    p.draw = function() {
      p.background(200);
      p.line(10, 10, 90, 90);
    };

  };
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('hello p5');

  var s = new p5(sketch());

  // Move the sketch container to the main container.
  setTimeout(function() {
    var main = document.getElementById('main');
    var sketchNode = document.getElementById('defaultCanvas');
    console.log(sketchNode);
    main.appendChild(sketchNode);
  }, 500);


});
