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

var a;

onload = function () {
	Engine.initialize();

	console.log(new Util.Vector(-1, -2).getLength());

	a = new Util.Circle(Engine.context, new Util.Vector(100, 100), 50, "blue");

	a = Util.Polygon.getRegular(Engine.context, new Util.Vector(500, 200), 5, 50, "green");
	a.draw();

	var b = new Util.Circle(Engine.context, new Util.Vector(0, 0), 50, "orange");
	b.draw();

	Engine.canvas.onmousemove = function (event) {
		Engine.context.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
		b.position = new Util.Vector(event.clientX, event.clientY);

		var intersects = b.isIntersecting(a);
		if (intersects) {
			b.color = "gray";
		} else {
			b.color = "orange";
		}

		b.draw();
		a.draw();
	}
};



function print(message, x, y) {
	Engine.context.font = "12px Arial";
	Engine.context.fillStyle = "black";
	Engine.context.fillText(message, x, y);
}

