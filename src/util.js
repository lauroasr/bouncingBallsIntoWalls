
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

/*********** Util.InstanceManagement ***********/
Util.InstanceManagement = function () {
	this.owner = this.constructor;
};

Util.InstanceManagement.instance = [];

Util.InstanceManagement.prototype.add = function () {
	this.index = this.owner.instance.length;
	this.owner.instance.push(this);
};

Util.InstanceManagement.prototype.remove = function () {
	this.owner.instance.splice(this.index, 1);
};

Util.InstanceManagement.updateInstances = function () {
	for (var i in this.instance) {
		this.instance[i].update();
	}
};