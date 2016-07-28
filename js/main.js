var World = (function(){

	// Setup the main global variables
	var scene, camera, renderer, stats, collisionObjects = [];

	// Setup gui global variable
	var params = {
			gridVisibility: false,
			collisionVisibility: false,
			rayHelperVisibility: false
		},
		gui;

	// Setup light global variables and presets
	var point1 = {
			color: 0x9d7043,
			positionX : 0,
			positionY : 5,
			positionZ : 0,
			intensity : 1,
			distance : 8,
			decay : 1,
			helperVisibility : false,
			shadows : true
		},
		spot1 = {
			color: 0xa05f1f,
			positionX : 0,
			positionY : 0.5,
			positionZ : -8.5,
			intensity : 1.7,
			distance : 7,
			decay : 1.1,
			penumbra: 0,
			angle : 1,
			helperVisibility : false,
			shadows : true
		},
		ambient1 = {
			color : 0x404040,
			intensity : 0.6
		},
		lantern = {
			emissiveColor: 0xdca36b,
			emissiveIntensity : 0.25
		};

	// Setup pointer lock variables
	var blocker 		= document.getElementById( 'blocker'),
		instructions 	= document.getElementById( 'instructions'),
		havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	// Setup controls variables
	var controls,
		controlsMinY = 2;
		controlsEnabled = false,
		moveForward = false,
		moveBackward = false,
		moveLeft = false,
		moveRight = false,
		canJump = false,
		prevTime = performance.now(),
		velocity = new THREE.Vector3(),
		collisionArrow = {};

	return {

		// Sets up the scene.
		init: function(){
			World.windowResize();
			World.lockPointer();
			World.initScene();
			World.initGui();
			World.initRenderer();
			World.initCamera();
			World.initLights();
			World.initControls();

			World.loadModels();
			World.createCollisionGeometry();

			World.animate();
		},

		initGui: function(){
			// Initialise the stats gui
			stats = new Stats();
			document.body.appendChild(stats.dom);

			// Initialise GUI and GU folders
			gui = new dat.GUI();
			gui.general = gui.addFolder('General');
			gui.lantern = gui.addFolder('Lantern');
			gui.fireplace = gui.addFolder('Fireplace');
			gui.ambient = gui.addFolder('Ambient');

			// Create grid helper to aid in positioning
			var gridHelper = new THREE.GridHelper( 10, 1 );
			gridHelper.visible = params.gridVisibility;
			scene.add( gridHelper );

			gui.general.add(params, 'gridVisibility').onChange(function(status){
				gridHelper.visible = status;
			});

			// Assign contrls for collision arrow visibility
			gui.general.add(params, 'rayHelperVisibility').onChange(function(status){
				collisionArrow.visible = status;
			});
		},

		// Create the scene and set the guscene size.
		initScene: function(){
			scene = new THREE.Scene();
		},

		// Create a renderer and add it to the DOM
		initRenderer: function(){
			renderer = new THREE.WebGLRenderer({antialias:true});
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.BasicShadowMap; // For smooth use THREE.PCFSoftShadowMap
			document.body.appendChild(renderer.domElement);
			renderer.domElement.id = "context";
		},

		// Create a camera, zoom it out from the model a bit, and add it to the scene
		initCamera: function(){
			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
			//camera.position.set(0,6,0);
			scene.add(camera);
		},

		// Create lights and assign gui controls
		initLights: function(){
			// Create Point Light
			point1.light = new THREE.PointLight( point1.color, point1.intensity, point1.distance, point1.decay );
			point1.light.position.set( point1.positionX, point1.positionY, point1.positionZ );
			point1.light.castShadow = point1.shadows;
			point1.light.shadow.camera.near = 1;
			point1.light.shadow.camera.far = 10;
			point1.light.shadow.bias = 0.01;
			scene.add( point1.light );

			// Crate point light helpers
			point1.helper = new THREE.PointLightHelper( point1.light, 0.5 );
			point1.helper.visible = point1.helperVisibility;
			scene.add( point1.helper );

			//point1.shadowHelper = new THREE.CameraHelper( point1.light.shadow.camera );
			//scene.add( point1.shadowHelper );

			// Assign point light GUI
			gui.lantern.addColor(point1, 'color');
			gui.lantern.add(point1, 'positionX').min(-30).max(30).step(1);
			gui.lantern.add(point1, 'positionY').min(-30).max(30).step(1);
			gui.lantern.add(point1, 'positionZ').min(-30).max(30).step(1);
			gui.lantern.add(point1, 'intensity').min(0).max(10).step(0.1);
			gui.lantern.add(point1, 'distance').min(0).max(100).step(1);
			gui.lantern.add(point1, 'decay').min(0).max(100).step(0.1);
			gui.lantern.add(point1, 'helperVisibility').onChange(function(status){
				point1.helper.visible = status;
			});
			gui.lantern.add(point1, 'shadows').onChange(function(status){
				point1.light.castShadow = status;
			});

			// Create Spot Light
			spot1.light = new THREE.SpotLight( spot1.color, spot1.intensity, spot1.distance, spot1.decay );
			spot1.light.position.set( spot1.positionX, spot1.positionY, spot1.positionZ );
			spot1.light.castShadow = spot1.shadows;
			spot1.light.shadow.camera.near = 1;
			spot1.light.shadow.camera.far = 10;
			spot1.light.shadow.bias = 0.01;
			scene.add( spot1.light );

			// Create spot light helpers
			spot1.helper = new THREE.SpotLightHelper( spot1.light, 0.5 );
			spot1.helper.visible = spot1.helperVisibility;
			scene.add( spot1.helper );

			//spot1.shadowHelper = new THREE.CameraHelper( spot1.light.shadow.camera );
			//scene.add( spot1.shadowHelper );

			// Assign spot light GUI
			gui.fireplace.addColor(spot1, 'color');
			gui.fireplace.add(spot1, 'positionX').min(-30).max(30).step(1);
			gui.fireplace.add(spot1, 'positionY').min(-30).max(30).step(1);
			gui.fireplace.add(spot1, 'positionZ').min(-30).max(30).step(1);
			gui.fireplace.add(spot1, 'intensity').min(0).max(10).step(0.1);
			gui.fireplace.add(spot1, 'distance').min(0).max(100).step(1);
			gui.fireplace.add(spot1, 'decay').min(0).max(100).step(0.1);
			gui.fireplace.add(spot1, 'penumbra').min(0).max(1).step(0.1);
			gui.fireplace.add(spot1, 'angle').min(0).max(1.56).step(0.1);
			gui.fireplace.add(spot1, 'helperVisibility').onChange(function(status){
				spot1.helper.visible = status;
			});
			gui.fireplace.add(point1, 'shadows').onChange(function(status){
				spot1.light.castShadow = status;
			});

			// Create Ambient Light
			ambient1.light = new THREE.AmbientLight( ambient1.color, ambient1.intensity ); // soft white light
			scene.add( ambient1.light );

			// Assign ambient light GUI
			gui.ambient.addColor(ambient1, 'color');
			gui.ambient.add(ambient1, 'intensity').min(0).max(10).step(0.1);
		},

		// Initialise control scheme and bing key controls
		initControls: function(){
			// Setup FPS controls
			controls = new THREE.PointerLockControls( camera );
			controls.getObject().position.y = controlsMinY;
			scene.add( controls.getObject() );

			// Bind keybindings
			var onKeyDown = function ( event ) {
				switch ( event.keyCode ) {
					case 38: // up
					case 87: // w
						moveForward = true;
						break;
					case 37: // left
					case 65: // a
						moveLeft = true; break;
					case 40: // down
					case 83: // s
						moveBackward = true;
						break;
					case 39: // right
					case 68: // d
						moveRight = true;
						break;
					case 32: // space
						if ( canJump === true ) velocity.y += 10;
						canJump = false;
						break;
				}
			};
			var onKeyUp = function ( event ) {
				switch( event.keyCode ) {
					case 38: // up
					case 87: // w
						moveForward = false;
						break;
					case 37: // left
					case 65: // a
						moveLeft = false;
						break;
					case 40: // down
					case 83: // s
						moveBackward = false;
						break;
					case 39: // right
					case 68: // d
						moveRight = false;
						break;
				}
			};
			document.addEventListener( 'keydown', onKeyDown, false );
			document.addEventListener( 'keyup', onKeyUp, false );
		},

		// Load geometry and material assets into scene
		loadModels: function(){
			// Load moogle into scene
			var loader = new THREE.JSONLoader();
			loader.load('models/mog/mog.json', function(geometry, materials) {
				mesh = new THREE.SkinnedMesh(
					geometry,
					new THREE.MeshFaceMaterial( materials )
				);
				scene.add(mesh);
			});

			// Load mog house into scene
			loader = new THREE.ObjectLoader();
			loader.load('models/mog_house/mog_house.json', function(obj) {
				// Save a referee the the lantern glass mesh for application of emission
				lantern.material = obj.children[9].material;

				// Set defaults for lantern emissive colour
				lantern.material.emissive.setHex( lantern.emissiveColor );
				lantern.material.emissiveIntensity = lantern.emissiveIntensity;

				// Setup emissive GUI
				gui.lantern.addColor(lantern, 'emissiveColor').onChange(function(status){
					lantern.material.emissive.setHex( lantern.emissiveColor );
				});
				gui.lantern.add(lantern, 'emissiveIntensity').min(0).max(1.5).step(0.05).onChange(function(status){
					lantern.material.emissiveIntensity = lantern.emissiveIntensity;
				});

				// Modify mesh before adding them to scene
				obj.traverse( function ( child ) {
					if ( child instanceof THREE.Mesh ) {
						child.material.shininess = 0.5;
					}
				});
				obj.castShadow = true;
				obj.receiveShadow = false;
				scene.add(obj);
			});
		},

		// Create geometry for use in collision detection
		createCollisionGeometry: function(){
			var geometry,
				material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );

			// Assign GUI
			material.visible = params.collisionVisibility;
			gui.general.add(params, 'collisionVisibility').onChange(function(status){
				material.visible = status;
			});

			// Add scenery geometry
			geometry = new THREE.BoxGeometry( 2, 1, 3 );
			geometry.translate(-5, 0.5, -2.5);
			var table = new THREE.Mesh( geometry, material );
			scene.add( table );
			collisionObjects.push( table );

			geometry = new THREE.BoxGeometry( 1, 2, 1.25);
			geometry.translate(-5.5, 1, -5.125);
			var cupboard = new THREE.Mesh( geometry, material );
			scene.add( cupboard );
			collisionObjects.push( cupboard );

			geometry = new THREE.BoxGeometry( 1.25, 1, 5);
			geometry.translate(-5.25, 0.5, 4.125);
			var chest = new THREE.Mesh( geometry, material );
			scene.add( chest );
			collisionObjects.push( chest );

			geometry = new THREE.BoxGeometry( 1, 1, 1.15);
			geometry.translate(5.25, 0.5, -2.15);
			var coffer = new THREE.Mesh( geometry, material );
			scene.add( coffer );
			collisionObjects.push( coffer );

			geometry = new THREE.BoxGeometry( 2.5, 0.75, 3.5);
			geometry.translate(4.75, 0.375, -4.75);
			var bed = new THREE.Mesh( geometry, material );
			scene.add( bed );
			collisionObjects.push( bed );

			// Add front and rear wall geometry
			geometry = new THREE.PlaneGeometry( 12, 6, 4 );

			var wallFront = new THREE.Mesh( geometry, material );
			wallFront.position.y = 2;
			wallFront.position.z = 7;
			wallFront.rotateY(Math.PI);
			scene.add( wallFront );
			collisionObjects.push( wallFront );

			var wallBack = new THREE.Mesh( geometry, material );
			wallBack.position.y = 2;
			wallBack.position.z = -7;
			scene.add( wallBack );
			collisionObjects.push( wallBack );

			// Add side wall geometries
			geometry = new THREE.PlaneGeometry( 14, 6, 5 );

			var wallLeft = new THREE.Mesh( geometry, material );
			wallLeft.position.y = 2;
			wallLeft.position.x = -6;
			wallLeft.rotateY(Math.PI / 2);
			scene.add( wallLeft );
			collisionObjects.push( wallLeft );

			var wallRight = new THREE.Mesh( geometry, material );
			wallRight.position.y = 2;
			wallRight.position.x = 6;
			wallRight.rotateY(Math.PI / 2);
			wallRight.rotateX((Math.PI * 180) / 180);
			scene.add( wallRight );
			collisionObjects.push( wallRight );
		},

		// Renders the scene and updates the render as needed.
		animate: function(){
			renderer.render( scene, camera );
			World.updateGui();
			World.updateControls();

			requestAnimationFrame( World.animate );
		},

		// Update scene based on GUI settings
		updateGui: function(){
			// Update status gui
			stats.update();

			// Update Point light
			point1.light.color.setHex( point1.color );
			point1.light.position.set( point1.positionX, point1.positionY, point1.positionZ );
			point1.light.intensity = point1.intensity;
			point1.light.distance = point1.distance;
			point1.light.decay = point1.decay;
			point1.helper.update();

			// Update Spot light
			spot1.light.color.setHex( spot1.color );
			spot1.light.position.set( spot1.positionX, spot1.positionY, spot1.positionZ );
			spot1.light.intensity = spot1.intensity;
			spot1.light.distance = spot1.distance;
			spot1.light.decay = spot1.decay;
			spot1.light.penumbra = spot1.penumbra;
			spot1.light.angle = spot1.angle;
			spot1.helper.update();

			// Update Ambient Light
			ambient1.light.color.setHex( ambient1.color );
			ambient1.light.intensity = ambient1.intensity;
		},

		// Update scene based on direct user input
		updateControls: function(){
			if ( controlsEnabled ) {
				var time = performance.now();
				var delta = ( time - prevTime ) / 1000;

				// Decelerate
				velocity.x -= velocity.x * 10.0 * delta;
				velocity.z -= velocity.z * 10.0 * delta;
				velocity.y -= 40.0 * delta;

				// Accelerate if input detected
				if ( moveForward  ) velocity.z -= 60.0 * delta;
				if ( moveBackward ) velocity.z += 60.0 * delta;
				if ( moveLeft ) velocity.x -= 60.0 * delta;
				if ( moveRight ) velocity.x += 60.0 * delta;

				// TODO fix infinitely small velocities;

				// Stop when collision is detected
				var position = controls.getObject().position.clone();
				position.setY( position.y - controlsMinY );

				var direction = camera.getWorldDirection().clone();
				direction.setY( 0 );

				if( velocity.z < 0 && this.checkCollisionFront(position, direction.clone()) ) velocity.z = 0;
				if( velocity.z > 0 && this.checkCollisionBack(position, direction.clone()) ) velocity.z = 0;
				if( velocity.x < 0 && this.checkCollisionLeft(position, direction.clone()) ) velocity.x = 0;
				if( velocity.x > 0 && this.checkCollisionRight(position, direction.clone()) ) velocity.x = 0;
				if( this.checkCollisionDown() ){
					velocity.y = Math.max( 0, velocity.y );
					canJump = true;
				}

				// Update based on velocity
				controls.getObject().translateX( velocity.x * delta );
				controls.getObject().translateY( velocity.y * delta );
				controls.getObject().translateZ( velocity.z * delta );
				if ( controls.getObject().position.y < controlsMinY ) {
					velocity.y = 0;
					controls.getObject().position.y = controlsMinY;
					canJump = true;
				}
				prevTime = time;
			}
		},

		checkCollisionDown: function(){
			var near = 0,
				far = controlsMinY - 1; // Set far to the "height" of the camera minus 1 to not be so far off objects in the room

			raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(0, -1, 0), near, far );
			raycaster.ray.origin.copy( controls.getObject().position );
			raycaster.ray.origin.y -= controlsMinY;

			return raycaster.intersectObjects( collisionObjects ).length > 0;
		},

		checkCollisionFront: function (position, direction){
			raycaster = new THREE.Raycaster( position.clone(), direction.clone(), 0, 1 );

			scene.remove ( collisionArrow );
			collisionArrow = new THREE.ArrowHelper( direction.clone(), position, 100, Math.random() * 0xffffff );
			collisionArrow.visible = params.rayHelperVisibility;
			scene.add( collisionArrow );

			return raycaster.intersectObjects( collisionObjects ).length > 0;
		},

		checkCollisionBack: function (position, direction){
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationY(Math.PI);
			direction.applyMatrix4(rotationMatrix);

			scene.remove ( collisionArrow );
			collisionArrow = new THREE.ArrowHelper( direction.clone(), position, 100, Math.random() * 0xffffff );
			collisionArrow.visible = params.rayHelperVisibility;
			scene.add( collisionArrow );

			raycaster = new THREE.Raycaster( position.clone(), direction.clone(), 0, 1 );
			return raycaster.intersectObjects( collisionObjects ).length > 0;
		},

		checkCollisionLeft: function (position, direction){
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationY(Math.PI / 2);
			direction.applyMatrix4(rotationMatrix);

			scene.remove ( collisionArrow );
			collisionArrow = new THREE.ArrowHelper( direction.clone(), position, 100, Math.random() * 0xffffff );
			collisionArrow.visible = params.rayHelperVisibility;
			scene.add( collisionArrow );

			raycaster = new THREE.Raycaster( position.clone(), direction.clone(), 0, 1 );
			return raycaster.intersectObjects( collisionObjects ).length > 0;
		},

		checkCollisionRight: function (position, direction){
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationY(3 * Math.PI / 2);
			direction.applyMatrix4(rotationMatrix);

			scene.remove ( collisionArrow );
			collisionArrow = new THREE.ArrowHelper( direction.clone(), position, 100, Math.random() * 0xffffff );
			collisionArrow.visible = params.rayHelperVisibility;
			scene.add( collisionArrow );

			raycaster = new THREE.Raycaster( position.clone(), direction.clone(), 0, 1 );
			return raycaster.intersectObjects( collisionObjects ).length > 0;
		},

		// Update canvas on resize
		windowResize: function(){
			window.addEventListener('resize', function () {
				renderer.setSize(window.innerWidth, window.innerHeight);
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
			});
		},

		// Restrict pointer to canvas
		lockPointer: function(){
			if ( havePointerLock ) {
				var element = document.body;
				var pointerlockchange = function ( event ) {
					if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
						controlsEnabled = true;
						controls.enabled = true;
						blocker.style.display = 'none';
					} else {
						controls.enabled = false;
						blocker.style.display = '-webkit-box';
						blocker.style.display = '-moz-box';
						blocker.style.display = 'box';
						instructions.style.display = '';
					}
				};
				var pointerlockerror = function ( event ) {
					instructions.style.display = '';
				};
				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
				instructions.addEventListener( 'click', function ( event ) {
					instructions.style.display = 'none';
					// Ask the browser to lock the pointer
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
					if ( /Firefox/i.test( navigator.userAgent ) ) {
						var fullscreenchange = function ( event ) {
							if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
								document.removeEventListener( 'fullscreenchange', fullscreenchange );
								document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
								element.requestPointerLock();
							}
						};
						document.addEventListener( 'fullscreenchange', fullscreenchange, false );
						document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
						element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
						element.requestFullscreen();
					} else {
						element.requestPointerLock();
					}
				}, false );
			} else {
				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
			}
		}

	}

})();

World.init();