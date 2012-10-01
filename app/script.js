(function() {
  var canvas, flock, processingInstance;

  window.SEPARATION_WEIGHT = 1;

  window.ALIGNMENT_WEIGHT = 1;

  window.COHESION_WEIGHT = 0.1;

  window.MAX_SPEED = 2;

  window.NEIGHBOUR_RADIUS = 40;

  window.MAX_FORCE = 0.05;

  window.DESIRED_SEPARATION = 20;

  window.AVOIDANCE_WEIGHT = 9;

  flock = function(processing) {
    var boids, cylinders, i, start;
    processing.width = 855;
    processing.height = 500;
    start = new Vector(processing.width / 2, processing.height / 2);
    boids = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 1; _i <= 100; i = ++_i) {
        _results.push(new Boid({
          processing: processing
        }));
      }
      return _results;
    })();
    /*
        cylinders = [
            new Cylinder { processing: processing, location: new Vector(processing.width / 2 + 50, processing.height / 2) }
            new Cylinder { processing: processing, radius: 10, location: new Vector(processing.width / 2 - 100, processing.height / 2 - 20)}
        ]
    */

    cylinders = [];
    return processing.draw = function() {
      var boid, cylinder, _i, _j, _len, _len1;
      processing.background(255);
      for (_i = 0, _len = cylinders.length; _i < _len; _i++) {
        cylinder = cylinders[_i];
        cylinder.render();
      }
      for (_j = 0, _len1 = boids.length; _j < _len1; _j++) {
        boid = boids[_j];
        boid.step(boids, cylinders);
        boid.render();
      }
      return true;
    };
  };

  canvas = $('<canvas width="855" height="500">').appendTo($('#flocking-demo'))[0];

  processingInstance = new Processing(canvas, flock);

}).call(this);
