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
	debug = new Engine.Window.Debug(new Util.Vector(Engine.canvas.width - 105, 5), true, 1000, function () {
		return [
			Environment.Entity.activeInstance.length + " entities",
			Util.Time.getCurrentMilliseconds()
		];
	});

	Engine.context.fillText("Press any key to start the loop", 100, 100);



	document.onkeyup = function () {
		Engine.canvas.onclick = function () {
			ball.push(Environment.Entity.Circle.getRandom());
		};
		document.onkeyup = function () {
			if (ball.length > 0) {
				ball[ball.length - 1].remove();
				ball.pop();
			}
		};

	    Engine.loop();
	};
};



Engine.main = function () {

};

/**
 * Inheritance
 *
 *
 * Child = function () {
 *     Parent.call(this, arguments);
 * };
 * Child.prototype = Parent.prototype;
 * Child.prototype.constructor = Child;
 *
 *
 */

