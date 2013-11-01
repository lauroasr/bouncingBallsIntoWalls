/*********** Environment ***********/
function Environment() {}

Environment.initialize = function (width, height) {
	// cria um canvas para buffer
	this.canvas = document.createElement("canvas");
	this.canvas.width = width;
	this.canvas.height = height;
	this.canvas.style.display = "none";
	this.context = this.canvas.getContext("2d");
};

// vetor da posição do ambiente
Environment.position = null;

// largura do ambiente
Environment.width = null;

// altura do ambiente
Environment.height = null;

// quadros por segundo, com limites
Environment.framesPerSecond = null;

// converte por segundo para por frame
Environment.getFrameVector = function (vector) {
	return vector.divide(Engine.framesPerSecond);
};

Environment.update = function () {
	Environment.framesPerSecond = Math.max(Engine.framesPerSecond, Engine.MINIMUM_FRAMES_PER_SECOND);

	Environment.Entity.update();
	Environment.Entity.draw();
};

Environment.Map = function () {};

/*********** Environment.Entity extends Util.Management ***********/
Environment.Entity = function (body, velocity) {
	this.velocity = velocity;
	// aplica gravidade
	this.acceleration = new Util.Vector(0, this.gravityForce);

	this.body = body;


	// adiciona a instância ao array da classe
	this.add(true);
};

Util.extend(Environment.Entity, Util.Management, true);

Environment.Entity.draw = function () {
	var i;

	for (i in this.idleInstances) {
		this.idleInstances[i].draw();
	}
	for (i in this.activeInstances) {
		this.activeInstances[i].draw();
	}
};

/* atributos de instância */
Environment.Entity.prototype.gravityForce = 980;
Environment.Entity.prototype.coeficientOfRestitution = .5;
Environment.Entity.prototype.frictionForce = .1;

Environment.Entity.prototype.update = function () {
	this.body.position = this.body.position.add(Environment.getFrameVector(this.velocity));
	this.velocity = this.velocity.add(Environment.getFrameVector(this.acceleration));

	// CHECK FOR COLLISIONS
	// RESOLVE COLLISION IF COLLIDING
};



/*********** Environment.Entity.Circle extends Environment.Entity ***********/
Environment.Circle.prototype.update = function () {
	// atualiza a posição baseado na velocidade
	this.position = this.position.add(Environment.getFrameVector(this.velocity));

	// atualiza a velocidade baseado na aceleração
	this.velocity = this.velocity.add(Environment.getFrameVector(this.acceleration));


	// checa se bateu na esquerda
	if (this.position.x < Environment.position.x + this.radius) {
		this.position.x = Environment.position.x + this.radius;
		this.velocity.x *= -this.coeficientOfRestitution;
	}
	// checa se bateu na direita
	else if (this.position.x > Environment.width - this.radius) {
		this.position.x = Environment.width - this.radius;
		this.velocity.x *= -this.coeficientOfRestitution;
	}

	// checa se bateu em cima
	if (this.position.y < Environment.position.y + this.radius) {
		this.position.y = Environment.position.y + this.radius;
		this.velocity.y *= -this.coeficientOfRestitution;
	}
	// checa se bateu em baixo
	else if (this.position.y > Environment.height - this.radius) {
		//this.velocity.y -= this.position.y + this.radius - Environment.height; ENVIRONMENT OFFSET CORRECTION

		this.position.y = Environment.height - this.radius;
		this.velocity.y *= -this.coeficientOfRestitution;

		if (this.velocity.y < 60 && this.velocity.y > -60) {
			this.velocity.y = 0;
			// aplica atrito
			this.velocity.x -= this.velocity.x * this.frictionForce;
		}
	}
};

Environment.Circle.getRandom = function () {
	var radius = Util.Number.getRandomInteger(20, 100);
	return new Environment.Circle(new Util.Vector(radius, radius), Util.Vector.getRandom(1000, 2000), radius, Util.Color.getRandomHexadecimal());
};



