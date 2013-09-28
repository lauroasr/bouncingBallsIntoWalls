
/*********** Util ***********/
function Util() {}

/*********** Util.Time ***********/
Util.Time = function () {};

Util.Time.getCurrentMilliseconds = function () {
	return new Date().getTime();
};

/*********** Util.Number ***********/
Util.Number = function () {};

Util.Number.getRandomInteger = function (minimum, maximum) {
	return Math.round(Math.random() * (maximum - minimum) + minimum);
};

/*********** Util.Color ***********/
Util.Color = function () {};

Util.Color.getRandomHexadecimal = function () {
	return "#" + Math.random().toString(16).slice(2, 8);
};

Util.Color.getTransition = function (ratio, alpha) {
	var green = Math.round(255 * ratio);
	var red = 255 - green;
	return "rgba(" + red + "," + green + ",0," + alpha + ")";
};

/*********** Util.Vector ***********/
Util.Vector = function (x, y) {
	this.x = x;
	this.y = y;
};

Util.Vector.getRandom = function (minimum, maximum) {
	return new Util.Vector(Util.Number.getRandomInteger(minimum, maximum), Util.Number.getRandomInteger(minimum, maximum));
};

Util.Vector.prototype.add = function (that) {
	return new Util.Vector(this.x + that.x, this.y + that.y);
};

Util.Vector.prototype.divide = function (number) {
	return new Util.Vector(this.x / number, this.y / number);
};

Util.Vector.prototype.toString = function () {
	return this.x + ", " + this.y;
};

/*********** Util.InstanceManagement ***********/
Util.applyInstanceManagement = function (Class) {
	Class.activeInstance = [];
	Class.idleInstance = [];

	Class.update = function () {
		for (var i in this.activeInstance) {
			this.activeInstance[i].update();
		}
	};

	Class.prototype.array = null;
	Class.prototype.index = null;

	Class.prototype.add = function (setActive) {
		this.array = setActive ? Class.activeInstance : Class.idleInstance;
		this.index = this.array.length;
		this.array.push(this);
	};

	Class.prototype.remove = function () {
		for (var i = this.index; i < this.array.length - 1;  i++) {
			this.array[i] = this.array[i + 1];
		}
		this.array.pop();
	};

	Class.prototype.pause = function () {
		if (this.array == Class.activeInstance) {
			this.remove();
			this.add(false);
		}
	};

	Class.prototype.resume = function () {
		if (this.array == Class.idleInstance) {
			this.remove();
			this.add(true);
		}
	};

	Class.prototype.update = function () {
		// precisa ser definida
	};
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


/*
	Ideia para implementações

	Classe que gera um objeto com dois atributos:
		array: o array que ele aponta
		index: a posição deste array

*/