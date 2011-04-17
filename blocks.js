goog.provide('game.Blocks');

game.Blocks.createShootBlock = function(x, y) {
	// 1. create shape def
	var shootBlockShapeDef = new b2FixtureDef;
	shootBlockShapeDef.friction = 0.3;
	shootBlockShapeDef.restitution = 0.5;
	shootBlockShapeDef.density = 1;
	
	shootBlockShapeDef.shape = new b2CircleShape(10/RATIO);
	
	// 2. create body def
	var shootBlockBodyDef = new b2BodyDef;
	
	// b2Body.SetLinearVelocity(new b2Vec2(10, 10));
	
	shootBlockBodyDef.type = b2Body.b2_dynamicBody;
	shootBlockBodyDef.position.x = x;
	shootBlockBodyDef.position.y = y;

	// shootBlockBodyDef.m_linearVelocity = new b2Vec2(0, 0);
	// shootBlockBodyDef.SetLinearVelocity(new b2Vec2(10,0));
	// console.log(shootBlockBodyDef);
	// shootBlockBodyDef.SetV(new b2Vec2(10, 10));
	
	game.shootingball = game.world.CreateBody(shootBlockBodyDef).CreateFixture(shootBlockShapeDef);
	game.shootingball.Set
};

game.Blocks.setTurningPoint = function() {
	// 1. create shape def
};

game.Blocks.addGreenBlocks = function() {
	// 1. create shape def
	var greenBlocksDef = new b2FixtureDef;
	greenBlocksDef.friction = 0.3;
	greenBlocksDef.restitution = 0.5;
	greenBlocksDef.density = 0.5;
	greenBlocksDef.shape = new b2PolygonShape;
	greenBlocksDef.shape.SetAsBox(20 / RATIO, 10 / RATIO);
	
	// 2. create body def
	for(var top = 290; top < 390; top += 20) {
		for(var left = 170; left < 370; left += 40) {
			var greenBlocksBodyDef = new b2BodyDef;
			greenBlocksBodyDef.type = b2Body.b2_dynamicBody;
			greenBlocksBodyDef.position.x = left / RATIO;
			greenBlocksBodyDef.position.y = top / RATIO;
			greenBlocksBodyDef.angle = 0;

			game.world.CreateBody(greenBlocksBodyDef).CreateFixture(greenBlocksDef);			
		};
	};	
};

game.Blocks.createWallsAndFloor = function() {
	// 1. create shape def
	var fixDef = new b2FixtureDef;
  fixDef.density = 0.0;
  fixDef.friction = 0.5;
  fixDef.restitution = 0.3;

	// 2. creat body def
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_staticBody;
	bodyDef.position.x = 300 / RATIO;
	bodyDef.position.y = 390 / RATIO;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(150 / RATIO, 10 / RATIO);
	
	// 3. create body
	var floorBody = game.world.CreateBody(bodyDef).CreateFixture(fixDef);
	// need to set mass in the world
};

game.Blocks.getBlockPosition = function(element) {
   var elem=element, tagname="", x=0, y=0;
  
   while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
      y += elem.offsetTop;
      x += elem.offsetLeft;
      tagname = elem.tagName.toUpperCase();

      if(tagname == "BODY")
         elem=0;

      if(typeof(elem) == "object") {
         if(typeof(elem.offsetParent) == "object")
            elem = elem.offsetParent;
      }
   }

   return {x: x, y: y};
};
