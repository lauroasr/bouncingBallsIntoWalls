



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



