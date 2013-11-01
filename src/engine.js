/*
* Medidas
* 100 pixels = 1 metro
* 100 pixels/s = 1 metro/s
*/

/*********** Engine ***********/
function Engine() {}

Engine.initialize = function () {
	this.canvas = document.getElementById("canvas");
	this.canvas.width = innerWidth - 5;
	this.canvas.height = innerHeight - 5;
	this.context = Engine.canvas.getContext("2d");

	Environment.initialize(this.canvas.width, this.canvas.height);

	this.initialTime = Date.now();
};

/* Pode ser sobrescrito */
// limite de quadros por segundo
Engine.MAXIMUM_FRAMES_PER_SECOND = 30;

// quantidade mínima de quadros por segundo (isso não previne do fps ser menor)
Engine.MINIMUM_FRAMES_PER_SECOND = 15;

// forçar o processador a manter os quadros por segundo constantes
Engine.DYNAMIC_TIME_OUT = false;

// quantidade de quadros por segundo atual
Engine.framesPerSecond = null;

// milisegundos antes do loop começar
Engine.initialTime = null;

// executar antes do loop começar
Engine.beforeLoop = null;

// função que será chamada a cada loop
Engine.main = null;

// objeto canvas
Engine.canvas = null;

// objeto para a manipulação do canvas
Engine.context = null;

/*********** Engine.Loop ***********/
Engine.Loop = function () {
	// tempo em que o loop comecou
	Engine.Loop.initialTime = Date.now();

	// limpa a tela do canvas
	Engine.context.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);

	// atualiza os eventos
	Engine.Time.Event.update();
	// atualiza o ambiente
	Environment.update();

	// calcula o tempo levado no loop
	Engine.Loop.timeTaken = Date.now() - Engine.Loop.initialTime;

	Engine.Loop.updateTimeout();

	// calcula a quantidade estimada de quadros por segundo
	Engine.framesPerSecond = Math.round(1000 / (Engine.Loop.timeTaken + Engine.Loop.timeout));

	Engine.Loop.id = setTimeout(Engine.Loop, Engine.Loop.timeout);
};

// id do loop no timeout
Engine.Loop.id = null;

// loop ativo ou não
Engine.Loop.isActive = false;

// pausa ou resume o loop
Engine.Loop.toggle = function () {
	if (Engine.Loop.isActive) {
		Engine.Loop.isActive = false;
		clearTimeout(Engine.Loop.id);
	} else {
		Engine.Loop.isActive = true;
		Engine.Loop();
	}
};

// milisegundos em que o ciclo atual começou
Engine.Loop.initialTime = null;

// tempo levado no loop
Engine.Loop.timeTaken = null;

// tempo de espera após o ciclo
Engine.Loop.timeout = null;

// calcula o tempo de espera
Engine.Loop.updateTimeout = (function () {
	// constrói a função
	if (Engine.DYNAMIC_TIME_OUT) {
		return function () {
			Engine.Loop.timeout = (1000 / Engine.MAXIMUM_FRAMES_PER_SECOND) - Engine.Loop.timeTaken;
			Engine.Loop.timeout = Math.max(0, Engine.Loop.timeout);
		}
	} else {
		Engine.Loop.timeout = 1000 / Engine.MAXIMUM_FRAMES_PER_SECOND;
		return function () {};
	}
})();

/*********** Engine.Event ***********/
Engine.Event = function () {};

Engine.Event.update = function () {
	this.Time.update();
	this.Input.update();
};

/*********** Engine.Event.Time extends Util.Class.Management ***********/
Engine.Event.Time = function (timeout, callback, intervalCallback, parent) {
	// tempo de espera do evento
	this.timeout = timeout;

	// checa se as funções tem um pai
	if (parent) {
		// função que será chamada por timeout
		this.callback = function () {
			parent[callback]();
		};
		// função que será chamada por update
		this.intervalCallback = function () {
			parent[intervalCallback]();
		};
	} else {
		this.callback = callback;
		this.intervalCallback = intervalCallback;
	}

	// adiciona a instância ao array da classe
	this.add(true);
	// tempo que o evento foi criado
	this.time = Date.now();
};

Util.extend(Engine.Event.Time, Util.Management, true);

Engine.Event.Time.update = function () {
	var time = Engine.Loop.initialTime;

	for (var i in this.activeInstances) {
		if (time >= this.activeInstances[i].time + this.activeInstances[i]) {
			this.activeInstances[i].time = time;
			this.activeInstances[i].callback();
		}
		this.intervalCallback();
	}
};

/*********** Engine.Event.Input extends Util.Management ***********/
Engine.Event.Input = function () {

};

/* lista de eventos que podem ser lancados */
Engine.Event.click = [];
Engine.Event.onClick = function () {
	for (var i in this.click) {
	}
};

Engine.Event.isMouseOver = function (event, object, isCircle) {
	if (isCircle) {
		if (event.clientX >= object.position.x) {
			if (event.clientY >= object.position.y) {

			}
		}
	}
};


Engine.Event.Input.check = function (eventType) {

};


 /*********** Engine.Window.Debug ***********/

 /*
Util.Window.Debug = function (position, showFpsGraph, updateRate, enableStringInfo) {
	this.position = position;

	// atributos padroes que podem ser alterados
	this.font = "20px Consolas";
	this.borderColor = "rgba(100, 100, 100, .5)";
	this.borderWidth = 2;
	this.backgroundColor = "rgba(0, 0, 0, 0)";
	this.width = 100;
	this.height = 100;

	if (showFpsGraph) {
		this.draw1 = this.draw;

		this.draw = function () {
			this.draw1();

			// imprime o grafico
			this.graph.draw();
		};

		// valores padrões que podem ser alterados através do [objetoHud].fpsGraph.[atributoGraph]
		var graphOffset = new Util.Vector(-this.borderWidth / 2, this.borderWidth / 2);
		var graphHeight = (this.height - this.borderWidth / 2) - graphOffset.y;
		var graphBarWidth = 2;
		var graphBars = (this.width - this.borderWidth) / graphBarWidth;

		this.graph = new Util.Graph(this.position.add(graphOffset), "black", graphBars, graphHeight, graphBarWidth);

		this.update1 = this.update;
		this.update = function () {
			this.update1();

			this.graph.update(Engine.framesPerSecond);
			// atualiza a cor do gráfico baseado no fps atual
			this.graph.barColor = Util.Color.getTransition((Engine.framesPerSecond - Engine.MINIMUM_FRAMES_PER_SECOND) / Engine.MINIMUM_FRAMES_PER_SECOND, 0.5);
		};
	}

	if (enableStringInfo) {
		this.stringInfo = [];

		this.draw2 = this.draw;
		this.draw = function () {
			this.draw2();


			Engine.context.font = "12px Consolas";
			Engine.context.textAlign = "right";
			Engine.context.fillStyle = "black";

			var height = 12;
			// chama as funções para retorno de string
			for (var i in this.stringInfo) {
				Engine.context.fillText(this.stringInfo[i](), this.position.x + this.width, this.position.y + this.height + height);
				height += 12;
			}

		}
	}

	this.timeEvent = new Engine.Time.Event(updateRate, "update", "draw", this);
};

  Engine.Window.Debug.prototype.update = function () {
  this.fps = Engine.framesPerSecond + "fps";
  };

  Engine.Window.Debug.prototype.draw = function () {
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
 */
