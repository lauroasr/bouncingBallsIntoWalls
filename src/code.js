// array de bolas
var ball = [], debug;


/*		cx.save();
		
		// TEXT
		// set the shadow of the text
		cx.shadowOffsetX = 5;
		cx.shadowOffsetY = 5;
		cx.shadowBlur = 6;
		cx.shadowColor = "rgba(100, 100, 100, .5)";
		// set the text's size and font
		cx.font = "100px Tahoma";
		// tell the canvas to start drawing from left to right
		cx.textAlign = "start";
		// draw the text at the coords pass by the parameters
		cx.fillText("Alou", 100, 100);
		
		// restore to take out the shadow setted before
		cx.restore();
		
		// IMAGE
		var img = new Image();
		img.src = "http://piq.codeus.net/static/media/userpics/piq_32031_400x400.png";
		cx.drawImage(img, 0, 0);
*/
/* vetor:
 - direção: horizontal, vertical (traduzindo como: x, y)
 - sentido: esquerda, direita ou cima, baixo (traduzindo como: positivo, negativo)

 Colisão elástica:
 a.newVelocity = (a.velocity * (a.mass - b.mass) + 2 * b.mass * b.velocity) / (a.mass + b.mass)
 b.newVelocity = (b.velocity * (b.mass - a.mass) + 2 * a.mass * a.velocity) / (b.mass + a.mass)

 */
Engine.beforeLoop = function () {
	debug = new Engine.Window.Debug(new Util.Vector(Engine.canvas.width - 105, 5), true, 500, function () {
		return Environment.Entity.activeInstance.length + " entities";
	});

	Engine.context.fillText("Press any key to start the loop", 100, 100);



	document.onkeyup = function () {
		document.onkeyup = null;

		Engine.canvas.onclick = function () {
			ball.push(Environment.Entity.Circle.getRandom());
		};
	    Engine.loop();
	};
};



Engine.main = function () {

};



/* Na classe Engine.Time.Event
	adicionar um callback que chama uma função caso o evento não foi disparado... uma função alternativa
	isso permite livrar do hud.draw() ali no main
*/
/**
    INHERTITANCE

 FIRST WAY
function Super() {}

function Son() {
	Super.apply(this, args);
}

 SECOND WAY
function Super() {}

function Son() {
	Super.call(this, arg1, arg2, ...);

}
Son.prototype = new Super();
Son.prototype.constructor = Son;

 DO THE SECOND WAY!
*/




/*onload = function () {
	function Super() {
		this.name = "Lauro";

		this.exec = function () {
			alert("." + this.name + ".");
		};
	}

	var a = new Super();

	(function (func) {
		func();
	})(function () {
		a.exec(obj);
	});
};*/

