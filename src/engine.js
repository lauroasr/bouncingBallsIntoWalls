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



/*
* Medidas
* 100 pixels = 1 metro
* 100 pixels/s = 1 metro/s
*/

/*
* Problema com o hud atualizando duas vezes a mais do que o setado ***
* Problema com toda a atualização do jogo não sincronizada perfeitamente
*
* Melhorar o posicionamento do HUD e implementar a função getHudString ***
* Melhorar o sistema de colisão com o ambiente
* Melhorar a força que é mantida após a colisão, ser calculada a partir do FPS para impedir a bola de ficar pulando infinitamente
*/

/*********** Engine ***********/
function Engine() {}

/* Pode ser sobrescrito */
// quantidade máxima de quadros por segundo
Engine.FRAMES_PER_SECOND = 30;

// quantidade mínima de quadros por segundo (isso não previne do fps ser menor)
Engine.MINIMUM_FRAMES_PER_SECOND = 15;

// forçar o processador a manter os quadros por segundo constantes
Engine.TRY_TO_KEEP_CONSTANT_FPS = false;

// executar antes do loop começar
Engine.beforeLoop = null;

// função que será chamada a cada loop
Engine.main = null;

/* Não pode ser sobrescrito */
// quantidade de quadros por segundo atualmente
Engine.fps = null;

// objeto canvas
Engine.canvas = null;

// objeto para a manipulação do canvas
Engine.context = null;

// getter do tempo de espera por game cycle
Engine.getSleepTime = null;

// quadro atual do segundo em que o loop se encontra
Engine.currentFrame = 0;

// atualiza o fps baseado no tempo de loop tomado
Engine.updateFps = function (totalTimeTaken) {
	Engine.fps = Math.round(1000 / totalTimeTaken);

	if (Engine.currentFrame >= Engine.fps) {
		Engine.currentFrame = 0;
	} else {
		Engine.currentFrame++;
	}
};

// cria a função getSleepTime
Engine.getSleepTime = (function () {
	if (Engine.TRY_TO_KEEP_CONSTANT_FPS) {
		return function () {
			var sleep = (1000 / Engine.FRAMES_PER_SECOND) - Engine.loopTimeTaken;
			if (sleep < 0) {
				sleep = 0;
			}
			Engine.updateFps(sleep + Engine.loopTimeTaken);
			return sleep;
		};
	} else {
		return function () {
			var sleep = 1000 / Engine.FRAMES_PER_SECOND;
			Engine.updateFps(sleep + Engine.loopTimeTaken);
			return sleep;
		};
	}
}());

/*********** Engine.Time ***********/
Engine.Time = function () {};

// milisegundos antes do loop começar
Engine.Time.initialTime = null;

// milisegundos em que o ciclo atual comecou
Engine.Time.initialLoopTime = null;

// tempo levado no loop
Engine.Time.loopTimeTaken = null;

/*********** Engine.Time.Event ***********/
// extende diretamente de Util.InstanceManagement
Engine.Time.Event = Util.InstanceManagement;
Engine.Time.Event.prototype.constructor = function (updateInterval, parent) {
	Util.InstanceManagement.call(this);

	// tempo que o evento foi criado
	this.milliseconds = Util.Time.getCurrentMilliseconds();
	// intervalo a passar
	this.updateInterval = updateInterval;
	// pai dessa instância
	this.parent = parent;
	// adiciona a instância ao array da classe
	this.add();
};

Engine.Time.Event.prototype.update = function () {
	alert("poop");
	var currentTime = Util.Time.getCurrentMilliseconds();
	if (currentTime >= this.milliseconds + this.updateInterval) {
		this.milliseconds = currentTime;
		this.parent.update();
	}
};

// loop principal
Engine.loop = function () {
	// tempo em que o loop comecou
	Engine.Time.initialLoopTime = Util.Time.getCurrentMilliseconds();

	// limpa a tela do canvas
	Engine.context.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);

	// executa a função main
	Engine.main();

	Engine.Time.Event.updateInstances();
	alert(Engine.Time.Event.instance.length);
	Environment.Entity.updateInstances();

	Engine.context.fillText(Util.Time.getCurrentMilliseconds(), 100, 100);

	// calcula o tempo levado no loop
	Engine.loopTimeTaken = Util.Time.getCurrentMilliseconds() - Engine.Time.initialLoopTime;

	setTimeout(Engine.loop, Engine.getSleepTime());
};

onload = function () {
	Engine.canvas = document.getElementById("canvas");
	Engine.canvas.width = innerWidth - 5;
	Engine.canvas.height = innerHeight - 5;
	Engine.context = Engine.canvas.getContext("2d");

	Engine.beforeLoop();
	Engine.initialTime = Util.Time.getCurrentMilliseconds();
	//Engine.loop();
};



/*********** Environment ***********/
function Environment() {}

/*********** Environment.Hud ***********/
Environment.Hud = function (position, showFpsGraph, getString, updateInterval) {
	this.position = position;

	// atributos padroes que podem ser alterados
	this.font = "20px Consolas";
	this.borderColor = "rgba(100, 100, 100, .5)";
	this.borderWidth = 2;
	this.backgroundColor = "rgba(0, 0, 0, 0)";
	this.width = 100;
	this.height = 100;
	this.fps = null;
	// função que recupera uma string de informações
	this.getString = getString;

	// cria a função update
	if (showFpsGraph) {
		// valores padrões que podem ser alterados através do [objetoHud].fpsGraph.[atributoGraph]
		var graphOffset = new Util.Vector(-this.borderWidth / 2, this.borderWidth / 2);
		var graphHeight = (this.height - this.borderWidth / 2) - graphOffset.y;
		var graphBarWidth = 2;
		var graphBars = (this.width - this.borderWidth) / graphBarWidth;

		this.graph = new Environment.Graph(this.position.add(graphOffset), "black", graphBars, graphHeight, graphBarWidth);

		this.update = function () {
			this.fps = Engine.fps + "fps";
			this.graph.update(Engine.fps);
			// atualiza a cor do gráfico baseado no fps atual
			this.graph.barColor = Util.Color.getTransition((Engine.fps - Engine.MINIMUM_FRAMES_PER_SECOND) / Engine.MINIMUM_FRAMES_PER_SECOND, 0.5);
		};
	} else {
		this.update = function () {
			this.fps = Engine.fps + "fps";
			alert(this.fps);
		};
	}

	this.timeEvent = new Engine.Time.Event(updateInterval, this);

	/** MUDAR, TA HORRIVEL ISSO */
	if (this.getString) {
		if (showFpsGraph) {
			this.draw = function () {
				// imprime o hud
				this.drawDefault();

				// imprime o grafico
				this.graph.draw();

				// imprime a string
				Engine.context.font = "12px Arial";
				Engine.context.textAlign = "right";
				Engine.context.fillText(this.getString(), this.position.x + this.width, this.position.y + this.height + 12);
			}
		} else {
			this.draw = function () {
				// imprime o hud
				this.drawDefault();

				// imprime a string
				Engine.context.font = "12px Arial";
				Engine.context.textAlign = "right";
				Engine.context.fillText(this.getString(), this.position.x + this.width, this.position.y + this.height + 12);
			};
		}
	} else {
		// cria a fução draw que não imprime a string
		this.draw = function () {
			this.drawDefault();
		};
	}

};

/* Se quiser adicionar estilos depois, mudar esta estrutura */
Environment.Hud.prototype.drawDefault = function () {
	Engine.context.fillStyle = this.backgroundColor;
	Engine.context.fillRect(this.position.x, this.position.y, this.width, this.height);

	Engine.context.strokeStyle = this.borderColor;
	Engine.context.lineWidth = this.borderWidth;
	Engine.context.strokeRect(this.position.x, this.position.y, this.width, this.height);

	Engine.context.font = this.font;
	Engine.context.textAlign = "center";
	Engine.context.fillStyle = "black";
	// imprime o texto dentro do hud centralizado
	Engine.context.fillText(this.fps, this.position.x + (this.width / 2), this.position.y + (this.height / 2));
};

/*********** Environment.Map **********
/*Environment.Map = function (key, id) {
	this.key = key;

	// grava a posição em que ele será inserido
	this.index = Environment.Map.block[this.key.x][this.key.y].length;

	// insere o elemento no bloco
	Environment.Map.block[this.key.x][this.key.y].push(id);

	// remove o elemento do bloco
	this.remove = function () {
		Environment.Map.block[this.key.x][this.key.y].splice(this.index, 1);
	}
};

// tamanho da divisão do mapa por pixels
Environment.Map.BLOCK_SIZE = 100;

// mapeamento dos blocos
Environment.Map.block = [];*/

/*********** Environment.Entity ***********/
// extende diretamente de Util.InstanceManagement
Environment.Entity = Util.InstanceManagement;
Environment.Entity.prototype.constructor = function (position, velocity, mass) {
	Util.InstanceManagement.call(this);

	this.position = position;
	this.velocity = velocity;
	this.mass = mass;

	// aplica gravidade
	this.acceleration = new Util.Vector(0, Environment.Entity.GRAVITY_FORCE);

	// adiciona a instância ao array da classe
	this.add();
};

// constante da gravidade (9.8m/s)
Environment.Entity.GRAVITY_FORCE = 980;

/*********** Environment.Entity.Circle ***********/
Environment.Entity.Circle = function (position, velocity, radius, color) {
	// extende de Entity
	Environment.Entity.call(this, new Util.Vector(0, 1), velocity, radius * radius);

	this.radius = radius;
	this.color = color;
};

// extends Entity
Environment.Entity.Circle.prototype = new Environment.Entity();
Environment.Entity.Circle.prototype.constructor = Environment.Entity.Circle;


// desenha o circulo na tela
Environment.Entity.Circle.prototype.draw = function () {
	Engine.context.fillStyle = this.color;
	Engine.context.beginPath();
	Engine.context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
	Engine.context.fill();
};

Environment.Entity.Circle.prototype.update = function () {
	// atualiza a posição baseado na velocidade
	this.position.x += this.velocity.x / Engine.fps;
	this.position.y += this.velocity.y / Engine.fps;

	// atualiza a velocidade baseado na aceleração
	this.velocity.x += this.acceleration.x / Engine.fps;
	this.velocity.y += this.acceleration.y / Engine.fps;


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

	// desenha o elemento na tela
	this.draw();
};

Environment.Entity.Circle.getRandom = function () {
	return new Environment.Entity.Circle(new Util.Vector(0, 0), Util.Vector.getRandom(1000, 2000), Util.Number.getRandomInteger(20, 100), Util.Color.getRandomHexadecimal());
};

/*********** Environment.Graph ***********/
Environment.Graph = function (position, barColor, maximumNumberOfBars, maximumBarHeight, barWidth) {
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

Environment.Graph.prototype.draw = function () {
	//Engine.context.fillText(this.value.toString() + " " + this.value.length, 500, 100);         /* debug */
	Engine.context.fillStyle = this.barColor;

	var x, y;
	for (var i in this.value) {
		x = this.position.x + (this.maximumNumberOfBars - i) * this.barWidth;
		y = this.position.y + (this.maximumBarHeight - this.maximumBarHeight * (this.value[i] / this.greaterValue));
		Engine.context.fillRect(x, y, this.barWidth, this.maximumBarHeight - (y - this.position.y));
	}
};

Environment.Graph.prototype.update = function (nextValue) {
	this.value.unshift(nextValue);

	if (this.value.length > this.maximumNumberOfBars) {
		this.value.pop();
	}
	// determina o maior valor do array
	for (var i in this.value) {
		if (this.value[i] > this.greaterValue) {
			this.greaterValue = this.value[i];
		}
	}
};