goog.provide('game');

goog.require('game.Blocks');

var RATIO = 30;
game.world = {};
game.Balls = [];
game.nextCrateIn = 0;

var b2Vec2 = Box2D.Common.Math.b2Vec2
	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
	,	b2Body = Box2D.Dynamics.b2Body
	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	,	b2Fixture = Box2D.Dynamics.b2Fixture
	,	b2World = Box2D.Dynamics.b2World
	,	b2MassData = Box2D.Collision.Shapes.b2MassData
	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	, b2AABB = Box2D.Collision.b2AABB
	, b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

game.mouseX = undefined;
game.mouseY = undefined;
game.mouseJoint = null;
game.mousePVec = undefined;
game.isMouseDown = false;
game.shootAreaX = 580; // pixel
game.shootAreaY = 293; // pixel
game.shootAreaRadius = 73; // pixel
game.canvasWidth = 800;
game.canvasHeight = 500;
game.ballX = undefined;
game.ballY = undefined;

game.targetY = undefined;
game.targetX = undefined;

game.shootingball = undefined;
// game.ctx = document.getElementById('canvas').getContext('2d');

init = function() {
	game.nextCrateIn = 0;
	game.canvasPosition = game.Blocks.getBlockPosition(document.getElementById("canvas"));
	
	// 1. Create our world
	game.setupWorld();
	
	// 2. creat a walls + floor
	game.Blocks.createWallsAndFloor();
	
	game.Blocks.addGreenBlocks();
		
	game.setupDebugDraw();
	
	// game.update();
	window.setInterval(game.update, 1000/60);

	document.addEventListener("mousedown", function(e){
		game.isMouseDown = true;
		game.handleMouseMove(e);
		game.createShootBlock(e);
		game.ballX = game.mouseX;
		game.ballY = game.mouseY;
		game.createShootingTarget(); // shooting target
		document.addEventListener("mousemove", game.handleMouseMove, true);
	}, true);
	
	document.addEventListener("mouseup", function(){
		document.removeEventListener("mousemove", game.handleMouseMove, true);
		if(game.mouseJoint != null) {
			game.createShootingDirection();
			// game.shootingball.m_linearVelocity = new b2Vec2(10, 10);
			// game.shootingball.SetLinearVelocity(new b2Vec2(10, 10));
			// console.log(game.shootingball);
			game.mouseJoint.SetTarget(new b2Vec2(game.targetX/RATIO,game.targetY/RATIO)); // setup shooting target
		}
		
		game.isMouseDown = false;
		game.mouseX = undefined;
		game.mouseY = undefined;
		game.targetX = undefined;
		game.targetY = undefined;
		game.ballX = undefined;
		game.ballY = undefined;
	}, true);
	
};

game.createShootingDirection = function() {
	var tX = game.ballX;
	var tY = game.ballY;
	var offx = (game.mouseX - tX);
	var offy = (game.mouseY - tY);

  if (offy == 0 && offx == 0) {
		game.targetY = game.mouseY * RATIO;
		game.targetX = game.mouseX * RATIO;
		return;
	};

	if (offx < 0) { 
		offx = -offx;
		offy = -offy;
		game.targetY = game.mouseY * RATIO + (game.canvasWidth - game.mouseX * RATIO) * (offy / offx);
		game.targetX = game.canvasWidth;
	} else {
		offy = -offy;
		game.targetY = game.mouseY * RATIO + game.mouseX * RATIO * offy / offx;
		game.targetX = 0;
	};
};

game.createShootBlock = function(e) {
	// console.log("createShootBlock");
	// console.log(Math.sqrt(Math.pow(e.clientX - game.shootAreaX, 2) + Math.pow(e.clientY - game.shootAreaY, 2)));
	// console.log(game.shootAreaRadius);
	if(Math.sqrt(Math.pow(e.clientX - game.shootAreaX, 2) + Math.pow(e.clientY - game.shootAreaY, 2)) <= game.shootAreaRadius) {
		game.Blocks.createShootBlock(game.mouseX, game.mouseY);
	}
};

game.handleMouseMove = function(e) {
	game.mouseX = (e.clientX - game.canvasPosition.x) / RATIO;
	game.mouseY = (e.clientY - game.canvasPosition.y) / RATIO;
};

game.getBodyAtMouse = function() {
	game.mousePVec = new b2Vec2(game.mouseX, game.mouseY);
	var aabb = new b2AABB();
	aabb.lowerBound.Set(game.mouseX - 0.001, game.mouseY - 0.001);
	aabb.upperBound.Set(game.mouseX + 0.001, game.mouseY + 0.001);
	
	// console.log("getBodyAtMouse");
	game.selectedBody = null;
	game.world.QueryAABB(game.getBodyCB, aabb);
	return game.selectedBody;
};

game.getBodyCB = function(fixture) {
	if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
		if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), game.mousePVec)) {
			game.selectedBody = fixture.GetBody();
			return false;
		};
	};
	return true;
};

game.setupDebugDraw = function() {
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
	debugDraw.SetDrawScale(30.0);
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	game.world.SetDebugDraw(debugDraw);
};

game.createShootingTarget = function() {
	// console.log(game.isMouseDown);
	if(game.isMouseDown && (!game.mouseJoint)) {
		var body = game.getBodyAtMouse();
		if(body) {
			var md = new b2MouseJointDef();
			md.bodyA = game.world.GetGroundBody();
			md.bodyB = body;
			md.target.Set(game.mouseX, game.mouseY);
			md.collideConnected = true;
			md.maxForce = 2000.0 * body.GetMass();
			game.mouseJoint = game.world.CreateJoint(md);
			body.SetAwake(true);
		};
	};	
};

game.shooting = function() {
	if(game.mouseJoint) {
		if(game.isMouseDown) {
			// game.mouseJoint.SetTarget(new b2Vec2(game.mouseX, game.mouseY));
		} else if(game.isMouseDown == false) {
			game.world.DestroyJoint(game.mouseJoint);
			game.mouseJoint = null;
		};
	};
};

game.update = function() {	
	game.world.Step(1/60, 10, 10);
	game.world.DrawDebugData();	
	game.world.ClearForces();
	
	// mouse listener
	game.shooting();
	// game.createMouseListener();
	// game.createShootArea();
};

game.randomInt = function(lowVal, hiVal) {
	return ( lowVal + Math.floor(Math.random() * (hiVal - lowVal + 1)) );
};

game.setupWorld = function() {
	// 1. define hte gravity
	var gravity = new b2Vec2(0, 10);
	
	// 2. ignore sleeping objects?
	var ignoreSleeping = true;
	
	game.world = new b2World(gravity, ignoreSleeping);
};

// game.createShootArea = function() {
// 	// 1. fillStyle
// 	game.ctx.fillStyle = 'rgb(244,222,201)';
// 	game.ctx.beginPath();
// 	game.ctx.arc(game.shootAreaX, game.shootAreaY, game.shootAreaRadius, 0, 2*Math.PI, true);
// 	game.ctx.fill();
// };