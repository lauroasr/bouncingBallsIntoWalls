/*********** Environment ***********/
function Environment() {}

/*Environment.width = Engine.canvas.width;

Environment.height = Engine.canvas.height;*/

/*********** Environment.Entity ***********/
// extende diretamente de Util.InstanceManagement
Environment.Entity = function (position, velocity, mass) {
	this.position = position;
	this.velocity = velocity;
	this.mass = mass;

	// aplica gravidade
	this.acceleration = new Util.Vector(0, Environment.Entity.GRAVITY_FORCE);
	// adiciona a instância ao array da classe
	this.add(true);
};

Util.applyInstanceManagement(Environment.Entity);

Environment.Entity.update = function () {
	for (var i in this.activeInstance) {
		this.activeInstance[i].update();
		this.activeInstance[i].draw();
	}

	for (var i in this.idleInstance) {
		this.idleInstance[i].draw();
	}
};

// constante da gravidade (9.8m/s)
Environment.Entity.GRAVITY_FORCE = 980;

/*********** Environment.Entity.Circle ***********/
Environment.Entity.Circle = function (position, velocity, radius, color) {
	// extende de Entity
	Environment.Entity.call(this, position, velocity, radius * radius);

	this.radius = radius;
	this.color = color;
};

// extends Entity
Environment.Entity.Circle.prototype = Environment.Entity.prototype;
Environment.Entity.Circle.prototype.constructor = Environment.Entity.Circle;


// desenha o círculo na tela
Environment.Entity.Circle.prototype.draw = function () {
	Engine.context.fillStyle = this.color;
	Engine.context.beginPath();
	Engine.context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
	Engine.context.fill();

};

Environment.Entity.Circle.prototype.update = function () {
	// atualiza a posição baseado na velocidade
	this.position = this.position.add(Engine.Time.getFrameVector(this.velocity));

	// atualiza a velocidade baseado na aceleração
	this.velocity = this.velocity.add(Engine.Time.getFrameVector(this.acceleration));


	if (this.position.x > Engine.canvas.width - this.radius) {
		this.position.x = Engine.canvas.width - this.radius;
		this.velocity.x *= -1;
	} else if (this.position.x < this.radius) {
		this.position.x = this.radius;
		this.velocity.x *= -1;
	}

	if (this.position.y > Engine.canvas.height - this.radius) {
		this.position.y = Engine.canvas.height - this.radius;
		this.velocity.y *= -0.5;
		this.velocity.x *= 0.8;
		if (this.velocity.y < 60 && this.velocity.y > -60) { // evita que o elemento fique se movimentando para sempre
			this.velocity.y = 0;
		}
	} else if (this.position.y < this.radius) {
		this.position.y = this.radius;
		this.velocity.y *= -1;
	}
};

Environment.Entity.Circle.getRandom = function () {
	return new Environment.Entity.Circle(new Util.Vector(0, 0), Util.Vector.getRandom(1000, 2000), Util.Number.getRandomInteger(20, 100), Util.Color.getRandomHexadecimal());
};


