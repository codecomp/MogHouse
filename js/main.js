var World = (function(){

	// Setup the main global variables.
	var scene, camera, renderer, controls;

	// Setup gui global variable
	var params,
		gui = new dat.GUI();

	// Setup light global variables and presets
	var point1 = {
			color: 0x9d7043,
			positionX : 0,
			positionY : 5,
			positionZ : 0,
			intensity : 1,
			distance : 8,
			decay : 1,
			helperVisibility : true,
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
			helperVisibility : true,
			shadows : true
		},
		ambient1 = {
			color : 0x404040,
			intensity : 0.6
		};

	// Setup pointer lock variables
	var blocker 		= document.getElementById( 'blocker'),
		instructions 	= document.getElementById( 'instructions'),
		havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	return {

		// Sets up the scene.
		init: function(){

			World.windowResize();

			World.lockPointer();

			// Create the scene and set the scene size.
			scene = new THREE.Scene();
			var WIDTH = window.innerWidth,
				HEIGHT = window.innerHeight;

			// Create a renderer and add it to the DOM.
			renderer = new THREE.WebGLRenderer({antialias:true});
			renderer.setSize(WIDTH, HEIGHT);
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.BasicShadowMap; // For smooth use THREE.PCFSoftShadowMap
			document.body.appendChild(renderer.domElement);
			renderer.domElement.id = "context";

			// Create a camera, zoom it out from the model a bit, and add it to the scene.
			camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
			camera.position.set(0,6,0);
			scene.add(camera);

			// Create Point Light
			point1.light = new THREE.PointLight( point1.color, point1.intensity, point1.distance, point1.decay );
			point1.light.position.set( point1.positionX, point1.positionY, point1.positionZ );
			point1.light.castShadow = point1.shadows;
			point1.light.shadow.camera.near = 1;
			point1.light.shadow.camera.far = 10;
			point1.light.shadow.bias = 0.01;
			scene.add( point1.light );

			point1.helper = new THREE.PointLightHelper( point1.light, 0.5 );
			scene.add( point1.helper );

			//point1.shadowHelper = new THREE.CameraHelper( point1.light.shadow.camera );
			//scene.add( point1.shadowHelper );

			point1.folder = gui.addFolder('Point Light 1');
			point1.folder.addColor(point1, 'color');
			point1.folder.add(point1, 'positionX').min(-30).max(30).step(1);
			point1.folder.add(point1, 'positionY').min(-30).max(30).step(1);
			point1.folder.add(point1, 'positionZ').min(-30).max(30).step(1);
			point1.folder.add(point1, 'intensity').min(0).max(10).step(0.1);
			point1.folder.add(point1, 'distance').min(0).max(100).step(1);
			point1.folder.add(point1, 'decay').min(0).max(100).step(0.1);
			point1.folder.add(point1, 'helperVisibility').onChange(function(status){
				point1.helper.visible = status;
			});
			point1.folder.add(point1, 'shadows').onChange(function(status){
				point1.light.castShadow = status;
			});
			point1.folder.open();

			// Create Spot Light
			spot1.light = new THREE.SpotLight( spot1.color, spot1.intensity, spot1.distance, spot1.decay );
			spot1.light.position.set( spot1.positionX, spot1.positionY, spot1.positionZ );
			spot1.light.castShadow = spot1.shadows;
			spot1.light.shadow.camera.near = 1;
			spot1.light.shadow.camera.far = 10;
			spot1.light.shadow.bias = 0.01;
			scene.add( spot1.light );

			spot1.helper = new THREE.SpotLightHelper( spot1.light, 0.5 );
			scene.add( spot1.helper );

			//spot1.shadowHelper = new THREE.CameraHelper( spot1.light.shadow.camera );
			//scene.add( spot1.shadowHelper );

			spot1.folder = gui.addFolder('Spot Light 1');
			spot1.folder.addColor(spot1, 'color');
			spot1.folder.add(spot1, 'positionX').min(-30).max(30).step(1);
			spot1.folder.add(spot1, 'positionY').min(-30).max(30).step(1);
			spot1.folder.add(spot1, 'positionZ').min(-30).max(30).step(1);
			spot1.folder.add(spot1, 'intensity').min(0).max(10).step(0.1);
			spot1.folder.add(spot1, 'distance').min(0).max(100).step(1);
			spot1.folder.add(spot1, 'decay').min(0).max(100).step(0.1);
			spot1.folder.add(spot1, 'penumbra').min(0).max(1).step(0.1);
			spot1.folder.add(spot1, 'angle').min(0).max(1.56).step(0.1);
			spot1.folder.add(spot1, 'helperVisibility').onChange(function(status){
				spot1.helper.visible = status;
				spot1.shadowHelper.visible = status;
			});
			spot1.folder.add(point1, 'shadows').onChange(function(status){
				spot1.light.castShadow = status;
			});
			spot1.folder.open();

			// Create Ambient Light
			ambient1.light = new THREE.AmbientLight( ambient1.color, ambient1.intensity ); // soft white light
			scene.add( ambient1.light );

			ambient1.folder = gui.addFolder('Ambient Light 1');
			ambient1.folder.addColor(ambient1, 'color');
			ambient1.folder.add(ambient1, 'intensity').min(0).max(10).step(0.1);
			ambient1.folder.open();

			// Create grid helper to aid in positioning
			var size 	   = 10;
			var step 	   = 1;
			var gridHelper = new THREE.GridHelper( size, step );
			scene.add( gridHelper );

			var loader = new THREE.JSONLoader();
			loader.load('models/mog/mog.json', function(geometry, materials) {
				mesh = new THREE.SkinnedMesh(
					geometry,
					new THREE.MeshFaceMaterial( materials )
				);
				scene.add(mesh);
			});

			// Add geometry to scene
			loader = new THREE.ObjectLoader();
			loader.load('models/mog_house/mog_house.json', function(obj) {
				obj.traverse( function ( child ) {
					if ( child instanceof THREE.Mesh ) {
						child.material.shininess = 0.5;
					}
				});
				obj.castShadow = true;
				obj.receiveShadow = false;
				scene.add(obj);
			});

			// Add OrbitControls so that we can pan around with the mouse.
			controls = new THREE.OrbitControls(camera, renderer.domElement);

			this.animate();
		},

		// Renders the scene and updates the render as needed.
		animate: function(){
			renderer.render( scene, camera );
			controls.update();
			World.updateGui();

			requestAnimationFrame( World.animate );
		},

		// Update scene
		updateGui: function(){
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