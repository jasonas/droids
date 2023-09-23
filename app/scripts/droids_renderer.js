// JavaScript Document

// Renderer global vars
var scene; 
var camera; 
var controls; 
var renderer;
var animationFrameId;

var startedAmmo = false;
var physicsWorld;
var rigidBodies = [];
var hinges = [];
let colGroupFloor = 1;
let colGroupRobot = 2;

var droidTrackerPart = "None";
var distance = 0;
var milliSecondsStarted = 0;
var milliSecondsPassed = 0;


// Ammojs Initialisation
function startAmmo(){
	
	if(startedAmmo == false){
		
		Ammo().then(start);

	} else {

		//rigidBodies = [];
		//hinges = [];

		start();
	}
}


///////////////////  UI Functions /////////////////////////

function start(){

	tmpTrans = new Ammo.btTransform();

	if(startedAmmo == false){
		setupPhysicsWorld();
	}

	startedAmmo = true;
	setupGraphics();
	createFloor();
	createRobotFromGenes();
	renderFrame();
}

function play(){
	//console.log( renderer.info.render.frame );
	renderFrame();
}

function pause(){
	//console.log( renderer.info.render.frame );
	cancelAnimationFrame( animationFrameId );
	renderer.setAnimationLoop(null); // pause the animation
}

function reset(){

	//console.log( renderer.info.render.frame );

	cancelAnimationFrame( animationFrameId );
	renderer.setAnimationLoop(null); // pause the animation

	rigidBodies = [];
	hinges = [];
	droidTrackerPart = "None";

	while(scene.children.length > 0){ 
		scene.remove(scene.children[0]); 
	}

	renderer.dispose();
	renderer.state.reset();

	// Remove Three JS canvas
	const elements = document.getElementsByTagName('canvas');
	for(let elementID in elements){

		let element = elements[elementID];

		if(element.style){
			document.body.removeChild(element);
		}
	}

	milliSecondsStarted = 0;
	milliSecondsPassed = 0;
	distance = 0;
	document.getElementById('simTime').innerHTML = '0';
	document.getElementById('botPos').innerHTML = '(0,0,0)';
	document.getElementById('botDis').innerHTML = '0';
}

function takePhoto(){

	function cropCanvas(sourceCanvas,left,top,width,height){

		let destCanvas = document.createElement('canvas');
		destCanvas.width = width;
		destCanvas.height = height;
		destCanvas.getContext("2d").drawImage(
			sourceCanvas,
			left,top,width,height,  // source rect with content to crop
			0,0,width,height);      // newCanvas, same size as source rect
		return destCanvas;
	}

	const elements = document.getElementsByTagName('canvas');
	var canvas = cropCanvas(elements[0], 400, 300, elements[0].width-800, elements[0].height-900);

	if (canvas.getContext) {

		//console.log("Photo taken!");
		return canvas.toDataURL();
	}
}


///////////////////  3D Engine Helper Functions /////////////////////////

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function map(value, oldRange, newRange) {
	var newValue = (value - oldRange[0]) * (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]) + newRange[0];
	return Math.min(Math.max(newValue, newRange[0]) , newRange[1]);
}

// The mulberry32 random function - Good for creating a random like value from a seed
// Found here: 
// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(a){
	  var t = a += 0x6D2B79F5;
	  t = Math.imul(t ^ t >>> 15, t | 1);
	  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
	  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// Generates a colour from a seed between 0.0 and 1.0
function generateColour(_seed){
		
	// Expecting a seed between 0.0 and 1.0 but we'll map it from 1 to 100
	let seed = map(_seed, [0.0, 1.0], [1, 100]);

	let seededRandom_r = mulberry32(seed);
	let seededRandom_g = mulberry32(seed+1);
	let seededRandom_b = mulberry32(seed+2);
	let colour_r = Math.floor(map(seededRandom_r, [0.0, 1.0], [0, 255]));
	let colour_g = Math.floor(map(seededRandom_g, [0.0, 1.0], [0, 255]));
	let colour_b = Math.floor(map(seededRandom_b, [0.0, 1.0], [0, 255]));
	let colourHex = rgbToHex(colour_r, colour_g, colour_b);
	let colourHexCode = parseInt(colourHex.replace(/^#/, ''), 16);

	return colourHexCode;
}



///////////////////  3D Engine Functions /////////////////////////

function setupPhysicsWorld(){

	let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
		dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
		overlappingPairCache    = new Ammo.btDbvtBroadphase(),
		solver                  = new Ammo.btSequentialImpulseConstraintSolver();

	physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
	physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}

function setupGraphics(){

	//create clock for timing
	clock = new THREE.Clock();

	//create the scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xededed );

	//create camera
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
	camera.position.set( 0, 30, 70 );
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	//Add hemisphere light
	let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
	hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
	hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
	hemiLight.position.set( 0, 50, 0 );
	scene.add( hemiLight );

	//Add directional light
	let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 100 );
	scene.add( dirLight );

	dirLight.castShadow = true;

	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;

	let d = 50;

	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;

	dirLight.shadow.camera.far = 13500;

	//Setup the renderer
	renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
	renderer.setClearColor( 0xededed );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	
	/*
	Note: 
	WebGLRenderer.gammaInput & WebGLRenderer.gammaOutput have been removed. 
	Maybe use WebGLRenderer.outputEncoding instead? 
	*/
	//renderer.gammaInput = true;
	//renderer.gammaOutput = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	
	renderer.shadowMap.enabled = true;

	// Controls
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.update();
}

function renderFrame(){

	if(milliSecondsStarted==0){
		milliSecondsStarted = new Date().getTime();
	} else {
		milliSecondsPassed = new Date().getTime() - milliSecondsStarted;
	}

	document.getElementById('simTime').innerHTML = milliSecondsPassed;


	var position = new THREE.Vector3();
	position.setFromMatrixPosition( droidTrackerPart.matrixWorld );

	document.getElementById('botPos').innerHTML = "(" + position.x.toFixed(2).toString() + ", " + position.y.toFixed(2).toString() + ", " + position.z.toFixed(2).toString() + ")";

	// Manhattan distance
	//distance = Math.abs(position.x) + Math.abs(position.z);

	// Euclidean distance
	distance = Math.sqrt( Math.pow((0-position.x), 2) + Math.pow((0-position.z), 2) );

	document.getElementById('botDis').innerHTML = distance.toFixed(2).toString();

	let deltaTime = clock.getDelta();

	//console.log( renderer.info.render.frame );

	updatePhysics( deltaTime );

	renderer.render( scene, camera );

	animationFrameId = requestAnimationFrame( renderFrame );

	controls.update(deltaTime);
}

function createFloor(){

	let pos = {x: 0, y: 0, z: 0};
	let scale = {x: 100, y: 2, z: 100};

	let quat = {x: 0, y: 0, z: 0, w: 1};
	let mass = 0;

	//threeJS Section
	let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xcdcdcd}));

	blockPlane.position.set(pos.x, pos.y, pos.z);
	blockPlane.scale.set(scale.x, scale.y, scale.z);

	blockPlane.castShadow = true;
	blockPlane.receiveShadow = true;

	scene.add(blockPlane);


	//Ammojs Section
	let transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
	transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
	let motionState = new Ammo.btDefaultMotionState( transform );

	let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
	colShape.setMargin( 0.05 );

	let localInertia = new Ammo.btVector3( 0, 0, 0 );
	colShape.calculateLocalInertia( mass, localInertia );

	let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
	let body = new Ammo.btRigidBody( rbInfo );

	//physicsWorld.addRigidBody( body);
	
	// Provide collision groups
	physicsWorld.addRigidBody( body, 1, 2 );
}

function createRobotFromGenes(){
	
	let transform = new Ammo.btTransform();

	function makePart(partSpec, dropLocation, style, trackPart = false){

		let w = partSpec.w;
		let h = partSpec.h; 
		let d = partSpec.d;
		
		let x = partSpec.x + dropLocation.x;
		let y = partSpec.y + dropLocation.y; 
		let z = partSpec.z + dropLocation.z;
		let colour = partSpec.colour; 

		let quat = {x: 0, y: 0, z: 0, w: 1};
		let mass = 1 * ((w+h+d));

		// Body Graphics
		//let body = new THREE.Mesh(new THREE.BoxBufferGeometry(w, h, d), new THREE.MeshPhongMaterial({color: colour}));

		let body = new THREE.Mesh(new THREE.RoundedBoxGeometry( w, h, d, 6, 2 ), new THREE.MeshPhongMaterial({color: colour}));

		body.position.set(x, y, z); 
		body.castShadow = true;
		body.receiveShadow = true;
		scene.add(body);

		// Track the position of a particular body part
		if(trackPart == true){
			droidTrackerPart = body; // this 'body' part is the right foor
		}

		// Body Physics
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( x, y, z ) ); 
		transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
		let motionState = new Ammo.btDefaultMotionState( transform );

		let bodyColShape = new Ammo.btBoxShape( new Ammo.btVector3( w * 0.5, h * 0.5, d * 0.5 ) );
		bodyColShape.setMargin( 0.05 );

		let localInertia = new Ammo.btVector3( 0, 0, 0 );
		bodyColShape .calculateLocalInertia( mass, localInertia );

		let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, bodyColShape , localInertia );
		let bodyBody = new Ammo.btRigidBody( rbInfo );

		physicsWorld.addRigidBody( bodyBody, 2, 1 );
		//physicsWorld.addRigidBody( bodyBody );

		body.userData.physicsBody = bodyBody;
		rigidBodies.push(body);

		return bodyBody;

	}

	function makeJoint(parent, child, parentJointPoint, childJointPoint, jointaAxis, hinges, motorDelay, motorFreq, motorSpeed, startDirection, angleRange, power = 1){

		// Create a Joint 
		let parentPivot = parentJointPoint; // Where on the 3D object is the connection
		let childPivot = childJointPoint;

		//let axis = new Ammo.btVector3( 0, 0, 1 ); // Example
		let axis = jointaAxis;
		let hinge = new Ammo.btHingeConstraint( parent, child, parentPivot, childPivot, axis, axis, true );


		let anglePos = angleRange;
		let angleNeg = Math.abs(angleRange)*-1;

		var hingeDirection;
		if(startDirection==1){
			hingeDirection = 1;
			hinge.setLimit(0, anglePos, 0.5, 0.5);
		} else {
			hingeDirection = -1;
			hinge.setLimit(angleNeg, 0, 0.5, 0.5);
		}

//					low, 
//					high, 
//					softness, 
//					biasFactor, 
//					optional relaxationFactor

		physicsWorld.addConstraint( hinge, false );

		let hingeData = {
			ammoHinge : hinge,
			motorAngle : angleRange,
			motorDelay : motorDelay,
			motorFreq : motorFreq,
			motorSpeed : motorSpeed,
			motorDirection : hingeDirection, // 0 still, -1 backwards, 1 forwards
			motorSet : 0,
			motorStarted : false
		}

		hinges.push(hingeData);
	}

	// Drop Location
	let dropLocation = {x:0, y:10, z: 0};


	// Styles	
	let headStyle = droidRobot.phenotype.style.head.set;
	let bodyStyle = droidRobot.phenotype.style.body.set;
	let legsStyle = droidRobot.phenotype.style.legs.set;
	let feetStyle = droidRobot.phenotype.style.feet.set;
	
	// This radical gene can seed interesting values - Use with caution!
	let gambit = droidRobot.phenotype.gambit.set;
	
	// Creature the Droid's body colour
	let bodyColourCode = generateColour(gambit);
	
	var bodySpec = { w:droidRobot.phenotype.body.width.set*10, h:droidRobot.phenotype.body.height.set*10, d:droidRobot.phenotype.body.depth.set*10, x:0, y:0, z:0, colour: bodyColourCode};
	bodySpec.d = bodySpec.d * legsStyle;
	bodySpec.w = bodySpec.w + (  (bodySpec.w /8)   * legsStyle);
	let body = makePart(bodySpec, dropLocation, bodyStyle, true);
	
	// Creature the Droid's feet colour
	let feetColourCode = generateColour(gambit * 0.5);
	
	// Servo joints
	for(var i=0; i< legsStyle; i++){
		
		var legToBodyPosition_depth = 0;
		var servosTimeAdjust = 500 * i; // Half a second delay for each extra pair of legs
		let power = feetStyle;
			
		if(legsStyle>1 && i==0){
			legToBodyPosition_depth = (bodySpec.d / 4);
		}
		else if(legsStyle>1 && i==1){
			legToBodyPosition_depth = -(bodySpec.d / 4);
		} else {
			legToBodyPosition_depth = 0;
		}
	
		let leftLegSpec = { w:droidRobot.phenotype.legs.width.set*10, h:droidRobot.phenotype.legs.height.set*10, d:droidRobot.phenotype.legs.depth.set*10, x:0, y:0, z:0, colour: 0xffffff };
		let leftLeg = makePart(leftLegSpec, dropLocation, legsStyle, false);

		let rightLegSpec = { w:droidRobot.phenotype.legs.width.set*10, h:droidRobot.phenotype.legs.height.set*10, d:droidRobot.phenotype.legs.depth.set*10, x:0, y:0, z:0, colour: 0xffffff };
		let rightLeg = makePart(rightLegSpec, dropLocation, legsStyle, false);	
	
		let leftFootSpec = { w:droidRobot.phenotype.feet.width.set*10, h:droidRobot.phenotype.feet.height.set*10, d:droidRobot.phenotype.feet.depth.set*10, x:0, y:0, z:0, colour: feetColourCode};
		let leftFoot = makePart(leftFootSpec, dropLocation, feetStyle, false);

	
		let rightFootSpec = { w:droidRobot.phenotype.feet.width.set*10, h:droidRobot.phenotype.feet.height.set*10, d:droidRobot.phenotype.feet.depth.set*10, x:0, y:0, z:0, colour: feetColourCode };
		let rightFoot = makePart(rightFootSpec, dropLocation, feetStyle, false);
		
	
		// // BODY TO LEFT LEG // //
		let body_Leg_jointPoint_y = Math.abs( (droidRobot.phenotype.body.height.set*10) /2)*-1;

		let body_Leg_gap_left = Math.abs( droidRobot.phenotype.legs.gap.set*10)*-1;

		let body_Leg_gap_right = droidRobot.phenotype.legs.gap.set*10;
		// Joint data

		let body_LeftLeg_jointPoint = new Ammo.btVector3( body_Leg_gap_left, body_Leg_jointPoint_y, legToBodyPosition_depth );
		let leftLeg_Body_jointPoint = new Ammo.btVector3( 0, (droidRobot.phenotype.legs.height.set*10)/2, 0 );
		let body_LeftLeg_jointaAxis = new Ammo.btVector3( 0, 1, 0 ); // steam roller, hellicopter, wheel (anti) 
		// Make joint
		makeJoint(
			body, 
			leftLeg, 
			body_LeftLeg_jointPoint, 
			leftLeg_Body_jointPoint, 
			body_LeftLeg_jointaAxis,
			hinges, // The group array to store this hinge in (all hinges in fact)
			droidRobot.phenotype.servo_leg_left.startDelay.set + servosTimeAdjust, 
			droidRobot.phenotype.servo_leg_left.frequencyDelay.set, // Milliseconds per directional move
			1.1 * power, // Power-Speed
			droidRobot.phenotype.servo_leg_left.startDirection.set, // Start direction
			droidRobot.phenotype.servo_leg_left.angleRange.set,
			feetStyle
		);
		// // BODY TO RIGHT LEG // //
		// Joint data
		let body_RightLeg_jointPoint = new Ammo.btVector3( body_Leg_gap_right, body_Leg_jointPoint_y, legToBodyPosition_depth );
		let rightLeg_Body_jointPoint = new Ammo.btVector3( 0, (droidRobot.phenotype.legs.height.set*10)/2, 0 );
		let body_RighLeg_jointaAxis = new Ammo.btVector3( 0, 1, 0 ); // steam roller, hellicopter, wheel (anti) 
		// Make joint
		makeJoint(
			body, 
			rightLeg, 
			body_RightLeg_jointPoint, 
			rightLeg_Body_jointPoint, 
			body_RighLeg_jointaAxis,
			hinges, // The group array to store this hinge in (all hinges in fact)
			droidRobot.phenotype.servo_leg_right.startDelay.set + servosTimeAdjust, // Delay before starting the motor
			droidRobot.phenotype.servo_leg_right.frequencyDelay.set, // Milliseconds per directional move
			1.1 * power, // Power-Speed
			droidRobot.phenotype.servo_leg_right.startDirection.set, // Start direction
			droidRobot.phenotype.servo_leg_right.angleRange.set,
			feetStyle
		);

		// // LEFT LEG TO LEFT FOOT // //
		// Joint data
		let leftLeg_LeftFoot_jointPoint = new Ammo.btVector3( 0, (Math.abs((droidRobot.phenotype.legs.height.set*10)/2)*-1), 0 );
		let leftFoot_LeftLeg_jointPoint = new Ammo.btVector3( 0.2, 0.2, 0 );
		let leftLeg_LeftFoot_jointaAxis = new Ammo.btVector3( 0, 0, 1 ); // steam roller, hellicopter, wheel (anti) 
		// Make joint
		makeJoint(
			leftLeg, 
			leftFoot, 
			leftLeg_LeftFoot_jointPoint, 
			leftFoot_LeftLeg_jointPoint, 
			leftLeg_LeftFoot_jointaAxis,
			hinges, // The group array to store this hinge in (all hinges in fact)
			droidRobot.phenotype.servo_foot_left.startDelay.set + servosTimeAdjust, // Delay before starting the motor
			droidRobot.phenotype.servo_foot_left.frequencyDelay.set, // Milliseconds per directional move
			1.1 * power, // Power-Speed
			droidRobot.phenotype.servo_foot_left.startDirection.set, // Start direction
			droidRobot.phenotype.servo_foot_left.angleRange.set,
			feetStyle
		);

		// // RIGHT LEG TO RIGHT FOOT // //
		// Joint data
		let rightLeg_RightFoot_jointPoint = new Ammo.btVector3( 0, (Math.abs((droidRobot.phenotype.legs.height.set*10)/2)*-1), 0 );
		let rightFoot_RightLeg_jointPoint = new Ammo.btVector3( -0.2, 0.2, 0 );
		let rightLeg_RightFoot_jointaAxis = new Ammo.btVector3( 0, 0, 1 ); // steam roller, hellicopter, wheel (anti) 
		// Make joint
		makeJoint(
			rightLeg, 
			rightFoot, 
			rightLeg_RightFoot_jointPoint, 
			rightFoot_RightLeg_jointPoint, 
			rightLeg_RightFoot_jointaAxis,
			hinges, // The group array to store this hinge in (all hinges in fact)
			droidRobot.phenotype.servo_foot_right.startDelay.set + servosTimeAdjust, // Delay before starting the motor
			droidRobot.phenotype.servo_foot_right.frequencyDelay.set, // Milliseconds per directional move
			1.1 * power, // Power-Speed
			droidRobot.phenotype.servo_foot_right.startDirection.set, // Start direction
			droidRobot.phenotype.servo_foot_right.angleRange.set,
			feetStyle
		);

	}
}

function updatePhysics( deltaTime ){

	function pingMotor(_hinge, signal){
		_hinge.enableAngularMotor( true, signal, 50 );
	}

	// Loop through all the motors
	for(let hingInd in hinges){

		// Get the metadata for this motor object
		let hingeData = hinges[hingInd];

		if( milliSecondsPassed >= hingeData.motorDelay ){

			let currentTime = new Date().getTime();

			// Start the motor 
			if(hingeData.motorStarted==false){

				hingeData.motorStarted = true;
				hingeData.motorSet = currentTime;
				pingMotor(hingeData.ammoHinge, hingeData.motorSpeed * hingeData.motorDirection);

				continue;
			}

			let milliSecondsPassedMotorSet = currentTime - hingeData.motorSet;

			// Decides if direction should be switched yet
			if( milliSecondsPassedMotorSet >= hingeData.motorFreq ){

				let hinge = hingeData.ammoHinge;

				// This is here just in case we call this function with the legacy droid builder which had no angle control
				var angleRange = Math.PI / 4;

				if(hingeData.motorAngle){
					angleRange = hingeData.motorAngle;
				} 

				let anglePos = angleRange;
				let angleNeg = Math.abs(angleRange)*-1;

				if(hingeData.motorDirection == 1){
				   hingeData.motorDirection = -1;
				   hinge.setLimit(angleNeg, 0, 0.5, 0.5);
				} else {
				   hingeData.motorDirection = 1
				   hinge.setLimit( 0, anglePos, 0.5, 0.5);
				}

				hingeData.motorSet = currentTime;
				pingMotor(hingeData.ammoHinge, hingeData.motorSpeed * hingeData.motorDirection);
			}
		}
	}

	// Step world
	physicsWorld.stepSimulation( deltaTime, 10 );

	// Update rigid bodies
	for ( let i = 0; i < rigidBodies.length; i++ ) {
		let objThree = rigidBodies[ i ];
		let objAmmo = objThree.userData.physicsBody;
		let ms = objAmmo.getMotionState();
		if ( ms ) {
			ms.getWorldTransform( tmpTrans );
			let p = tmpTrans.getOrigin();
			let q = tmpTrans.getRotation();
			objThree.position.set( p.x(), p.y(), p.z() );
			objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
		}
	}
}
