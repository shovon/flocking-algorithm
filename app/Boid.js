(function() {

  window.Boid = (function() {

    Boid.prototype.processing = null;

    Boid.prototype.radius = 5;

    Boid.prototype.location = null;

    Boid.prototype.velocity = null;

    function Boid(options) {
      if (options == null) {
        options = {};
      }
      if (!(options.processing != null)) {
        throw "A processing instance needs to be defined.";
      }
      this.processing = options.processing;
      this.location = options.location || new Vector(this.processing.width / 2, this.processing.height / 2);
      this.velocity = options.velocity || new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
    }

    Boid.prototype.step = function(neighbours, cylinders) {
      var acceleration;
      acceleration = this.flock(neighbours, cylinders);
      this.velocity.add(acceleration).limit(MAX_SPEED);
      this.location.add(this.velocity);
      return this._wrapIfNeeded();
    };

    Boid.prototype._wrapIfNeeded = function() {
      var maxX, maxY, minX, minY;
      minX = -this.radius * 2;
      minY = -this.radius * 2;
      maxX = this.processing.width + this.radius * 2;
      maxY = this.processing.height + this.radius * 2;
      if (this.location.x > maxX) {
        this.location.x = minX;
      }
      if (this.location.y > maxY) {
        this.location.y = minY;
      }
      if (this.location.x < minX) {
        this.location.x = maxX;
      }
      if (this.location.y < minY) {
        return this.location.y = maxY;
      }
    };

    Boid.prototype.separate = function(neighbours) {
      var boid, count, distance, mean, _i, _len;
      mean = new Vector;
      count = 0;
      for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
        boid = neighbours[_i];
        distance = this.location.distance(boid.location);
        if (distance > 0 && distance < DESIRED_SEPARATION) {
          mean.add(Vector.subtract(this.location, boid.location).normalize().divide(distance));
          count++;
        }
      }
      if (count > 0) {
        mean.divide(count);
      }
      return mean;
    };

    Boid.prototype.align = function(neighbours) {
      var boid, count, distance, mean, _i, _len;
      mean = new Vector;
      count = 0;
      for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
        boid = neighbours[_i];
        distance = this.location.distance(boid.location);
        if (distance > 0 && distance < NEIGHBOUR_RADIUS) {
          mean.add(boid.velocity);
          count++;
        }
        if (count > 0) {
          mean.divide(count);
        }
        mean.limit(MAX_FORCE);
      }
      return mean;
    };

    Boid.prototype.cohere = function(neighbours) {
      var boid, count, distance, sum, _i, _len;
      sum = new Vector;
      count = 0;
      for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
        boid = neighbours[_i];
        distance = this.location.distance(boid.location);
        if (distance > 0 && distance < NEIGHBOUR_RADIUS) {
          sum.add(boid.location);
          count++;
        }
      }
      if (count > 0) {
        return this.steer_to(sum.divide(count));
      }
      return sum;
    };

    Boid.prototype.steer_to = function(target) {
      var desired, distance, steer;
      desired = Vector.subtract(target, this.location);
      distance = desired.magnitude();
      steer = new Vector;
      if (distance > 0) {
        desired.normalize();
        if (distance < 100) {
          desired.multiply(MAX_SPEED * (distance / 100.0));
        } else {
          desired.multiply(MAX_SPEED);
        }
        steer = desired.subtract(this.velocity);
        steer.limit(MAX_FORCE);
      }
      return steer;
    };

    Boid.prototype.avoidCollision = function(cylinders) {
      var count, cylinder, distance, mean, _i, _len;
      mean = new Vector;
      count = 0;
      for (_i = 0, _len = cylinders.length; _i < _len; _i++) {
        cylinder = cylinders[_i];
        distance = this.location.distance(cylinder.location);
        if (distance > 0 && distance < DESIRED_SEPARATION + cylinder.radius * 4) {
          mean.add(Vector.subtract(this.location, cylinder.location).normalize().divide(distance * 2));
          count++;
        }
      }
      if (count > 0) {
        mean.divide(count);
      }
      return mean;
    };

    Boid.prototype.avoidWalls = function() {
      var count, distance, mean, wall, walls, _i, _len;
      mean = new Vector;
      count = 0;
      walls = [new Vector(0, this.location.y), new Vector(this.processing.width, this.location.y), new Vector(this.location.x, 0), new Vector(this.location.x, this.processing.height)];
      for (_i = 0, _len = walls.length; _i < _len; _i++) {
        wall = walls[_i];
        distance = this.location.distance(wall);
        if (distance > 0 && distance < DESIRED_SEPARATION) {
          mean.add(Vector.subtract(this.location, wall).normalize().divide(distance * 2));
          count++;
        }
      }
      if (count > 0) {
        mean.divide(count);
      }
      return mean;
    };

    Boid.prototype.flock = function(neighbours, cylinders) {
      var alignment, cohesion, separation;
      separation = this.separate(neighbours).multiply(SEPARATION_WEIGHT);
      alignment = this.align(neighbours).multiply(ALIGNMENT_WEIGHT);
      cohesion = this.cohere(neighbours).multiply(COHESION_WEIGHT);
      return separation.add(alignment).add(cohesion);
    };

    Boid.prototype.render = function() {
      var theta;
      theta = this.velocity.heading() + this.processing.radians(90);
      this.processing.fill(70);
      this.processing.stroke(0, 0, 255);
      this.processing.pushMatrix();
      this.processing.translate(this.location.x, this.location.y);
      this.processing.rotate(theta);
      this.processing.beginShape(this.processing.TRIANGLES);
      this.processing.vertex(0, -1 * this.radius * 2);
      this.processing.vertex(-1 * this.radius, this.radius * 2);
      this.processing.vertex(this.radius, this.radius * 2);
      this.processing.endShape();
      return this.processing.popMatrix();
    };

    return Boid;

  })();

}).call(this);
