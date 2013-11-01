/*********** Util ***********/
function Util() {}

Util.getMaximumValue = function (array) {
	var maximum = array[0];
	for (var i = 1; i < array.length; i++) {
		if (array[i] > maximum) {
			maximum = array[i];
		}
	}
	return maximum;
};

Util.getMinimumValue = function (array) {
	var minimum = array[0];
	for (var i = 1; i < array.length; i++) {
		if (array[i] < minimum) {
			minimum = array[i];
		}
	}
	return minimum;
};

Util.import = function (scriptPath) {

};

/*********** Util.Number ***********/
Util.Number = function () {};

Util.Number.getRandomInteger = function (minimum, maximum) {
	return Math.round(Math.random() * (maximum - minimum) + minimum);
};

Util.Number.getRange = function (minimum, maximum, ratio) {
	return ((maximum - minimum) * ratio) + minimum;
};

/*********** Util.Color ***********/
Util.Color = function (red, green, blue, alpha) {
	this.red = red;
	this.blue = blue;
	this.green = green;
	this.alpha = alpha;
};

Util.Color.getRandomHexadecimal = function () {
	return "#" + Math.random().toString(16).slice(2, 8);
};

Util.Color.prototype.getTransition = function (finalColor, ratio) {
	var red = Util.Number.getRange(this.red, finalColor.red, ratio);
	var green = Util.Number.getRange(this.green, finalColor.green, ratio);
	var blue = Util.Number.getRange(this.blue, finalColor.blue, ratio);
	var alpha = Util.Number.getRange(this.alpha, finalColor.alpha, ratio);

	return new Util.Color(red, green, blue, alpha);
};

Util.Color.prototype.toRGB = function () {
	return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
};

Util.Color.prototype.toRGBA = function () {
	return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";
};

/*********** Util.Vector ***********/
Util.Vector = function (x, y) {
	this.x = x;
	this.y = y;
};

Util.Vector.prototype.add = function (other) {
	return new Util.Vector(this.x + other.x, this.y + other.y);
};

Util.Vector.prototype.multiply = function (scalar) {
	return new Util.Vector(this.x * scalar, this.y * scalar);
};

Util.Vector.prototype.addWith = function (other) {
	this.x += other.x;
	this.y += other.y;
};

Util.Vector.prototype.getLength = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

Util.Vector.prototype.getNormalized = function () {
	var length = this.getLength();
	return new Util.Vector(this.x / length, this.y / length);
};

Util.Vector.prototype.getPerpendicular = function () {
	return new Util.Vector(-this.y, this.x);
};

Util.Vector.prototype.getDistanceTo = function (other) {
	return new Util.Vector(other.x - this.x, other.y - this.y);
};

Util.Vector.prototype.getDotProduct = function (other) {
	return this.x * other.x + this.y * other.y;
};

Util.Vector.prototype.isGreaterThan = function (vector) {
	return (this.x > vector.x) && (this.y > vector.y);
};

Util.Vector.prototype.isEqualsTo = function (vector) {
	return (this.x == vector.x) && (this.y == vector.y);
};

Util.Vector.prototype.toString = function () {
	return "[" + Math.round(this.x) + ", " + Math.round(this.y) + "]";
};

/*********** Util.Projection ***********/
Util.Projection = function (minimum, maximum) {
	this.minimum = minimum;
	this.maximum = maximum;
};

Util.Projection.prototype.isIntersecting = function (other) {
	return this.maximum > other.minimum && other.maximum > this.minimum;
};

/*********** Util.Polygon ***********/
Util.Polygon = function (context, position, edges, color) {
	this.context = context;
	this.color = color;
	this.position = position;
	this.setEdges(edges);
};

Util.Polygon.prototype.move = function (distance) {
	this.position.addWith(distance);
	for (var i in this.points) {
		this.points[i].addWith(distance);
	}
};

Util.Polygon.prototype.setPosition = function (position) {
	this.position = position;

	var accumulator = new Util.Vector(0, 0);
	// soma a distância deslocada nos demais pontos
	for (var i in this.edges) {
		accumulator.addWith(this.edges[i]);
		this.points[i] = accumulator.add(this.position);
	}
};

Util.Polygon.prototype.setEdges = function (edges) {
	this.edges = edges;
	this.points = [];

	var accumulator = new Util.Vector(0, 0);
	for (var i in this.edges) {
		accumulator.addWith(this.edges[i]);
		// calcula a posição dos pontos
		this.points.push(accumulator.add(this.position));

		// calcula o vetor normalizado e perpendicular
		this.edges[i].normalized = this.edges[i].getNormalized();
		this.edges[i].normalized.perpendicular = this.edges[i].normalized.getPerpendicular();
	}
	// liga o último ponto com o primeiro
	this.edges.push(this.points[this.points.length - 1].getDistanceTo(this.position));
	// calcula o vetor normalizado e perpendicular
	this.edges[this.edges.length - 1].normalized = this.edges[this.edges.length - 1].getNormalized();
	this.edges[this.edges.length - 1].normalized.perpendicular = this.edges[this.edges.length - 1].normalized.getPerpendicular();
};

Util.Polygon.prototype.getProjectionOnto = function (axis) {
	var projectedPoints = [];
	projectedPoints.push(this.position.getDotProduct(axis));

	for (var i in this.points) {
		projectedPoints.push(this.points[i].getDotProduct(axis));
	}
	return new Util.Projection(Util.getMinimumValue(projectedPoints), Util.getMaximumValue(projectedPoints));
};

Util.Polygon.prototype.isIntersecting = function (form) {
	var edges = this.edges.concat(form.edges), axis;

	for (var i in edges) {
		axis = edges[i].normalized.perpendicular;

		this.projection = this.getProjectionOnto(axis);
		form.projection = form.getProjectionOnto(axis);
		if (!this.projection.isIntersecting(form.projection)) {
			return false;
		}
	}

	return true;
};

Util.Polygon.prototype.draw = function () {
	this.context.fillStyle = this.color;

	this.context.beginPath();
	this.context.moveTo(this.position.x, this.position.y);
	for (var i in this.points) {
		this.context.lineTo(this.points[i].x, this.points[i].y);
	}
	this.context.fill();
};

Util.Polygon.getRegular = function (context, centerPosition, numberOfSides, size, color) {
	var position = centerPosition.add(new Util.Vector(size, 0)), edges = [], points = [];

	for (var i = 1, lastPosition = new Util.Vector(size, 0); i < numberOfSides; i++) {
		points.push(new Util.Vector(size * Math.cos(i * 2 * Math.PI / numberOfSides), size * Math.sin(i * 2 * Math.PI / numberOfSides)));
		// pega a distância entre o ponto anterior e o atual
		edges.push(lastPosition.getDistanceTo(points[i - 1]));
		lastPosition = points[i - 1];
	}
	return new Util.Polygon(context, position, edges, color);
};

/*********** Util.QuadraticBezier ***********/
Util.QuadraticBezier = function (context, startPoint, controlPoint, endPoint, width, color) {
	this.context = context;
	this.startPoint = startPoint;
	this.controlPoint = controlPoint;
	this.endPoint = endPoint;
	this.color = color;
	this.width = width;
};

Util.QuadraticBezier.prototype.draw = function () {
	this.context.strokeStyle = this.color;
	this.context.lineWidth = this.width;
	this.context.beginPath();
	this.context.moveTo(this.startPoint.x, this.startPoint.y);
	this.context.quadraticCurveTo(this.controlPoint.x, this.controlPoint.y, this.endPoint.x, this.endPoint.y);
	this.context.stroke();
	//this.context.lineWidth = 1;
};

/*********** Util.Circle ***********/
Util.Circle = function (context, position, radius, color) {
	this.context = context;
	this.position = position;
	this.radius = radius;
	this.color = color;
};

Util.Circle.prototype.draw = function () {
	this.context.fillStyle = this.color;
	this.context.beginPath();
	this.context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
	this.context.fill();
};

/*********** Util.Image ***********/
Util.Image = function (context, position, width, height, source) {
	this.context = context;
	this.position = position;
	this.width = width;
	this.height = height;

	this.object = new Image();
	this.object.src = source;
};

Util.extend(Util.Image, Util.Polygon, true);

Util.Image.prototype.draw = function () {
	this.context.drawImage(this.object, this.position.x, this.position.y, this.width, this.height);
};

Util.Image.prototype.drawClipping = function (clippingPosition, clippingWidth, clippingHeight) {
	this.context.drawImage(this.object, clippingPosition.x, clippingPosition.y, clippingWidth, clippingHeight, this.position.x, this.position.y, this.width, this.height);
};

Util.extend = function (destination, source, deepCopy) {
	if (deepCopy) {
		for (var property in source) {
			if (source[property] instanceof Object) {
				destination[property] = {};
				Util.extend(destination[property], source[property], true);
			} else {
				destination[property] = source[property];
			}
		}
	} else {
		for (var property in source) {
			destination[property] = source[property];
		}
	}
};

Util.copy = function (objectSource) {
	var objectCopy = {};
	for (var property in objectSource) {
		objectCopy[property] = objectSource[property];
	}
	return objectCopy;
};

Util.deepCopy = function (objectSource) {
	var objectCopy = {};
	for (var property in objectSource) {
		if (objectSource[property] instanceof Object) {
			objectCopy[property] = {};
			objectCopy[property] = Util.deepCopy(objectSource[property]);
		} else {
			objectCopy[property] = objectSource[property];
		}
	}
	return objectCopy;
};

/*********** Util.Management ***********/
Util.Management = function () {};

/* métodos e atributos da classe */
// array de instâncias ativas
Util.Management.activeInstances = [];

// array de instâncias ociosas
Util.Management.idleInstances = [];

// classe ativa ou não
Util.Management.isActive = false;

// pausa ou resume atividade da classe
Util.Management.toggle = function () {
	if (this.isActive) {
		// pausa todas as instâncias da classe
		for (var i in this.activeInstances) {
			this.activeInstances[i].toggle();
		}
		this.isActive = false;
	} else {
		for (var i in this.idleInstances) {
			this.idleInstances[i].toggle();
		}
		this.isActive = true;
	}
};

// atualiza instâncias da classe
Util.Management.update = function () {
	for (var i in this.activeInstances) {
		this.activeInstances[i].update();
	}
};

/* métodos e atributos da instância */
// array em que se encontra
Util.Management.prototype.array = null;

// posição no array
Util.Management.prototype.index = null;

// adiciona ao array de instâncias
Util.Management.prototype.add = function (setActive) {
	this.array = setActive ? this.constructor.activeInstances : this.constructor.idleInstances;
	this.index = this.array.length;
	this.array.push(this);
};

// remove do array de instâncias
Util.Management.prototype.remove = function () {
	for (var i = this.index; i < this.array.length - 1;  i++) {
		this.array[i] = this.array[i + 1];
	}
	this.array.pop();
};

// pausa ou resume a atividade
Util.Management.prototype.toggle = function () {
	this.remove();
	if (this.array == this.constructor.idleInstances) {
		this.add(true);
	} else {
		this.add(false);
	}
};


/*********** Util.Graph ***********/
Util.Graph = function (position, barColor, maximumNumberOfBars, maximumBarHeight, barWidth) {
	// posição do gráfico
	this.position = position;
	// cor das barras
	this.barColor = barColor;
	// máxima quantidade de barras
	this.maximumNumberOfBars = maximumNumberOfBars;
	// tamanho máximo das barras
	this.maximumBarHeight = maximumBarHeight;
	// grossura da barra
	this.barWidth = barWidth;

	// maior valor do array value
	this.greaterValue = 0;
	// valores do gráfico
	this.value = [];
};

Util.Graph.prototype.draw = function () {
	Engine.context.fillStyle = this.barColor;

	var x, y;
	for (var i in this.value) {
		x = this.position.x + (this.maximumNumberOfBars - i) * this.barWidth;
		y = this.position.y + (this.maximumBarHeight - this.maximumBarHeight * (this.value[i] / this.greaterValue));
		Engine.context.fillRect(x, y, this.barWidth, this.maximumBarHeight - (y - this.position.y));
	}
};

Util.Graph.prototype.update = function (nextValue) {
	this.value.unshift(nextValue);

	if (this.value.length > this.maximumNumberOfBars) {
		this.value.pop();
	}

	// determina o maior valor do array
	if (nextValue > this.greaterValue) {
		this.greaterValue = nextValue;
	}
};

/*********** Util.Frame extends Util.Management ***********/
Util.Frame = function (context, position, width, height) {
	this.context = context;
	this.position = position;
	this.width = width;
	this.height = height;
};

Util.extend(Util.Frame, Util.Management);

/*********** Util.Border ***********/
Util.Border = function (frame, color, width, radius) {
	// calcula os atributos das bordas
	this.top = new Util.Rectangle(frame.context, frame.position.add(new Util.Vector(0, -width)), frame.width, width, color);
	this.right = new Util.Rectangle(frame.context, frame.position.add(new Util.Vector(frame.width, 0)), width, frame.height, color);
	this.bottom = new Util.Rectangle(frame.context, frame.position.add(new Util.Vector(0, frame.height)), frame.width, width, color);
	this.left = new Util.Rectangle(frame.context, frame.position.add(new Util.Vector(-width, 0)), width, frame.height, color);

	var vertex = {
		// calcula os vértices do frame com as bordas
		topRight: this.top.position.add(new Util.Vector(this.top.width + this.right.width, 0)),
		bottomRight: this.right.position.add(new Util.Vector(this.right.width, this.right.height + this.bottom.height)),
		bottomLeft: this.bottom.position.add(new Util.Vector(-this.left.width, this.bottom.height)),
		topLeft: this.left.position.add(new Util.Vector(0, -this.top.height))
	};

	// recalcula a posição e o tamanho das bordas para não sobrepor as curvas
	this.top.position = this.top.position.add(new Util.Vector((this.top.width / 2) * radius, 0));
	this.top.width *= 1 - radius;

	this.right.position = this.right.position.add(new Util.Vector(0, (this.right.height / 2) * radius));
	this.right.height *= 1 - radius;

	this.bottom.position = this.bottom.position.add(new Util.Vector((this.bottom.width / 2) * radius, 0));
	this.bottom.width *= 1 - radius;

	this.left.position = this.left.position.add(new Util.Vector(0, (this.left.height / 2) * radius));
	this.left.height *= 1 - radius;


	// calcula as curvas das bordas
	this.topBezier = new Util.QuadraticBezier(
		frame.context,
		this.top.position.add(new Util.Vector(this.top.width, this.top.height / 2)),
		vertex.topRight,
		this.right.position.add(new Util.Vector(this.right.width / 2, 0)),
		width, color
	);
	this.rightBezier = new Util.QuadraticBezier(
		frame.context,
		this.right.position.add(new Util.Vector(this.right.width / 2, this.right.height)),
		vertex.bottomRight,
		this.bottom.position.add(new Util.Vector(this.bottom.width, this.bottom.height / 2)),
		width, color
	);
	this.bottomBezier = new Util.QuadraticBezier(
		frame.context,
		this.bottom.position.add(new Util.Vector(0, this.bottom.height / 2)),
		vertex.bottomLeft,
		this.left.position.add(new Util.Vector(this.left.width / 2, this.left.height)),
		width, color
	);
	this.leftBezier = new Util.QuadraticBezier(
		frame.context,
		this.left.position.add(new Util.Vector(this.left.width / 2, 0)),
		vertex.topLeft,
		this.top.position.add(new Util.Vector(0, this.top.height / 2)),
		width, color
	);
};

Util.Border.prototype.draw = function () {
	this.top.draw();
	this.topBezier.draw();
	this.right.draw();
	this.rightBezier.draw();
	this.bottom.draw();
	this.bottomBezier.draw();
	this.left.draw();
	this.leftBezier.draw();
};
