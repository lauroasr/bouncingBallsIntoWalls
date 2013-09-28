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

onload = function () {
	Engine.canvas = document.getElementById("canvas");
	Engine.canvas.width = innerWidth - 5;
	Engine.canvas.height = innerHeight - 5;
	Engine.context = Engine.canvas.getContext("2d");

	Engine.beforeLoop();
	Engine.Time.initialTime = Util.Time.getCurrentMilliseconds();
	//Engine.loop();
};



/*********** Engine ***********/
function Engine() {}

// executar antes do loop começar
Engine.beforeLoop = null;

// função que será chamada a cada loop
Engine.main = null;

// objeto canvas
Engine.canvas = null;

// objeto para a manipulação do canvas
Engine.context = null;

// loop principal
Engine.loop = function () {
	// tempo em que o loop comecou
	Engine.Time.initialLoopTime = Util.Time.getCurrentMilliseconds();

	// limpa a tela do canvas
	Engine.context.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);

	// executa a função main
	Engine.main();

	Engine.Time.Event.update();
	Environment.Entity.update();

	// calcula o tempo levado no loop
	Engine.Time.loopTimeTaken = Util.Time.getCurrentMilliseconds() - Engine.Time.initialLoopTime;

	setTimeout(Engine.loop, Engine.Time.getTimeout());
};

/*********** Engine.Time ***********/
Engine.Time = function () {};

/* Pode ser sobrescrito */
// quantidade máxima de quadros por segundo
Engine.Time.FRAMES_PER_SECOND = 30;

// quantidade mínima de quadros por segundo (isso não previne do fps ser menor)
Engine.Time.MINIMUM_FRAMES_PER_SECOND = 15;

// forçar o processador a manter os quadros por segundo constantes
Engine.Time.TRY_TO_KEEP_CONSTANT_FPS = false;

/* Não pode ser sobrescrito */
// quantidade de quadros por segundo
Engine.Time.fps = null;

// milisegundos antes do loop começar
Engine.Time.initialTime = null;

// milisegundos em que o ciclo atual começou
Engine.Time.initialLoopTime = null;

// tempo levado no loop
Engine.Time.loopTimeTaken = null;

// atualiza o fps baseado no tempo de loop tomado
Engine.Time.updateFps = function (totalTimeTaken) {
	Engine.Time.fps = Math.round(1000 / totalTimeTaken);

	if (Engine.Time.fps < Engine.Time.MINIMUM_FRAMES_PER_SECOND) {
		Engine.Time.fpsFrame = Engine.Time.MINIMUM_FRAMES_PER_SECOND;
	} else {
		Engine.Time.fpsFrame = Engine.Time.fps;
	}
};

// calcula o tempo de espera
Engine.Time.getTimeout = (function () {
	if (Engine.Time.TRY_TO_KEEP_CONSTANT_FPS) {
		return function () {
			var timeout = (1000 / Engine.Time.FRAMES_PER_SECOND) - Engine.Time.loopTimeTaken;
			if (timeout < 0) {
				timeout = 0;
			}
			Engine.Time.updateFps(timeout + Engine.Time.loopTimeTaken);
			return timeout;
		};
	} else {
		return function () {
			var timeout = 1000 / Engine.Time.FRAMES_PER_SECOND;
			Engine.Time.updateFps(timeout + Engine.Time.loopTimeTaken);
			return timeout;
		};
	}
}());

// fps (que respeita os limites das constantes) para ser usado no getFrameVector
Engine.Time.fpsFrame = null;

// converte por segundo para por frame
Engine.Time.getFrameVector = function (vector) {
	return vector.divide(Engine.Time.fpsFrame);
};



/*********** Engine.Time.Event ***********/
Engine.Time.Event = function (timeout, callback, intervalCallback, parent) {
	// tempo de espera do evento
	this.timeout = timeout;

	// checa se as funções tem um pai
	if (parent)  {
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
	this.milliseconds = Util.Time.getCurrentMilliseconds();
};
// extende de InstanceManagement
Util.applyInstanceManagement(Engine.Time.Event);

Engine.Time.Event.prototype.update = function () {
	var currentTime = Util.Time.getCurrentMilliseconds();
	if (currentTime >= this.milliseconds + this.timeout) {
		this.milliseconds = currentTime;
		this.callback();
	}
	this.intervalCallback();
};

/*********** Engine.Window ***********/
Engine.Window = function () {};

/*********** Engine.Window.Debug ***********/
Engine.Window.Debug = function (position, showFpsGraph, updateRate, getStringArray) {
	this.position = position;

	// atributos padroes que podem ser alterados
	this.font = "20px Consolas";
	this.borderColor = "rgba(100, 100, 100, .5)";
	this.borderWidth = 2;
	this.backgroundColor = "rgba(0, 0, 0, 0)";
	this.width = 100;
	this.height = 100;
	// função que recupera uma string de informações
	this.getStringArray = getStringArray;

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

			this.graph.update(Engine.Time.fps);
			// atualiza a cor do gráfico baseado no fps atual
			this.graph.barColor = Util.Color.getTransition((Engine.Time.fps - Engine.Time.MINIMUM_FRAMES_PER_SECOND) / Engine.Time.MINIMUM_FRAMES_PER_SECOND, 0.5);
		};
	}

	if (getStringArray) {
		this.draw2 = this.draw;
		this.draw = function () {
			this.draw2();

			// imprime a string
			Engine.context.font = "12px Consolas";
			Engine.context.textAlign = "right";
			Engine.context.fillStyle = "black";
			var info = this.getStringArray(), height = 12;
			for (var i in info) {
				Engine.context.fillText(info[i], this.position.x + this.width, this.position.y + this.height + height);
				height += 12;
			}

		}
	}

	this.timeEvent = new Engine.Time.Event(updateRate, "update", "draw", this);
};


Engine.Window.Debug.prototype.update = function () {
	this.fps = Engine.Time.fps + "fps";
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
