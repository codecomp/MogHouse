#Mog House

An experimentation into importing assets from Final Fantasy XI into Three Js in a usable way

----

##DAT Export Process

 * Download [Noesis](http://www.richwhitehouse.com/index.php?content=inc_projects.php#prjmp91)
 * Lookup Data asset DAT file location, This cna be via model viewer for NPC, Scenery, weapon and character models. You can find some [zone files location I have  been able to authenticate into a gist](https://gist.github.com/Codecomp/00a75f8a65f045bc24057a7726c4251f)
 * Open Noesis and under File > Open file browse to the location of the DAT file you wish to import, the file should render fully in the preview window. If the file does not render in the preview window double check your DAT location as some lists can be incorrect.
 * Go to File > Export from preview to open the export dialog
 * Select the output destination and tick the Flip UVs checkbox
 * Under Advanced options add "-objmtl" to force export of a material file
 * (OPTIONAL) if exporting a zone file export with the following Advanced options "-objmtl -ff11blendhack -ff11optimizegeo" to try to fix geometry bugs
 * (OPTIONAL) if exporting animations export the model as a FBX and not an OBJ format
 
##Blender Setup
 
 * Download [Blender](https://www.blender.org/)
 * Brose to you Blender install location and go to scripts / Addons. Open your threejs download and copy across the /utils/exporters/blender/addons/io_three folder to blender
 * Open blender and go to File > User preferences. Then in the Addons tab search for three and tick the threejs export addon. Then in the bottom left of the modal click Save User Settings
 
##File Cleanup

 * Create a new project, then delete the cube paced in the world
 * Go to File > Import then egther OBJ or FBX depending on how you exported your file
 * You should now have your model rendered in while on the screen, likely upside down and facing the wrong direction at this point
 * (Optional) If importing a model from FBX it may have shrunk to a scale of 0.001 making it very hard to see. Check the outliner area for your model to make sure it has imported, then when doing the next point make sure to select the armature not the geometries
 * Select all your geometry and in the properties area under Transform make sure the scale is set to 1 and if necessary update the Rotations so the model is correctly aligned.
 * Set the 3D area to texture shading mode
 * (OPTIONAL) If your model is pure white at this point select your model, then in the properties area go to the texture tab. Under the image accordion you will find a "Source" field, click the folder icon and locate the correct image in your export location. Sometimes Noesis will export a badly formatted source with spaces in the name. If this is the case for DAT files with multiple textures You should go through the exported files and rename them replacing the spaces in the filename with a single underscore.
 * (OPTIONAL) If you model has multiple geometries select them one by one and apply the above fix if required
 * (OPTIONAL) If you are going to use the model without the use of the scene loader open new area and set it to UV/Image editor mode. From the outliner area repeat the process for each geometry. Expand the geometry and select the material, this will populate the UV area with the unwraped UV map. Click inside the UV area to set it as active and select all the content in this area. Now translate the UV map so it is over the texture image, make sure to be exact, you can see the exact number of movement at the bottom of the area to help you and if you leave the 3D view open you can see it update live. If the image is not in the UV area you will need to point the UV area at the texture file at the bottom of the area window in its properties section.

##Animation Cleanup

 * Check Neosis' preview window, in the top right it will note how many frames there are for each animation, in blenders timeline area update the end to the correct total length of the animation and zoom the animation tiemline to fit the entire animation
 * Open a dopesheet and 3D area side by side and set the 3D area to pose mode
 * In the pose area select the pose > animation > Bake animation option. Bake from frame 1 to the total number of frames with a frame step of 1 with Visual keying and Clear constraints selected. Bake the animation then check it still plays after it has finished processing
 * Now rebake the pose with the ame animation as before but set the frame step to 3 instead of one. Once it has finished check the animation still runs reasonably smoothly. If not undo the bake and rebake at a framestep of 2. This is necessary to lower the file size for longer animations

##Export Standard Model

 * (OPTIONAL) If you are not going to use the model without the use of the scene loader and there are multiple geometries to your model shift select them all in the outliner window then in the 3D areas property section click join to combine these into a single geometry
 * Select your geometry and go to File > Export > Threejs.
 * Under Export THREE make sure you select the following: Vertices, Faces, Normals, UVs, Apply Modifiers, Textures, Export Textures
 * (Optional) If exporting a Zone also select Scene and Materials under the "Scene" section
 * Choose your save location and export your JSON file

##Export Animated Model

 * Select your armature pose in the outliner area, then in the 3D area in pose model select Pose > Clear Transform > All
 * (OPTIONAL) If there are multiple geometries to your model shift select them all in the outliner window then in the 3D areas property section click join to combine these into a single geometry
 * Select your geometry then with the 3D area active hit Ctrl + A then select Location, in the properties area  a new window wil open, under here also check Rotation and Scale
 * Go to File > Export > Threejs, Select the same settings as above but also set skeletal animations to Pose
 * Open your exported file with your tex editor of choice and look under the Materials area for the names of your texture files. If these are set as mapLight rename the mapLight to mapDiffuse or the textures will not display
 
 This should export you a usable JSON file for use in Three js, however I have yet to get this exported model animating.

----

##Sample Import code for ThreeJS R75

###Simple JSON Import

```html
<script>

	...
	
	var loader = new THREE.JSONLoader();
	loader.load('example.json', function(geometry, materials) {
		mesh = new THREE.SkinnedMesh(
			geometry,
			new THREE.MeshFaceMaterial( materials )
		);
		scene.add(mesh);
	});
	
	...

</script>
```

###Scene JSON Import

```html
<script>

	...
	
	loader = new THREE.ObjectLoader();
	loader.load('example.json', function(obj) {
		scene.add(obj);
	});
	
	...

</script>
```

----

##Change log

###Pre Versioning
 * Setup folder structure
 * Setup test import of files
 * Setup Git ignore and Readme

----

## Resources

The following Links might prove useful when trying to export FFXI DAT resources into ThreeJS :
 
 * [Bringing FFXI into VR : ffxi](https://www.reddit.com/r/ffxi/comments/4e6uia/bringing_ffxi_into_vr/)
 * [Does anyone have the JP client installed? (VR project) : ffxi](https://www.reddit.com/r/ffxi/comments/4bznnc/does_anyone_have_the_jp_client_installed_vr/)
 * [three.js/webgl_loader_obj_mtl.html at master · mrdoob/three.js · GitHub](https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj_mtl.html)
 * [three.js / examples](http://threejs.org/examples/#webgl_loader_obj_mtl)
 * [Online 3D Archage Model Viewer by Furface [Archive] - The Official ArcheAge Forums](http://forums.archeagegame.com/archive/index.php/t-163418.html?s=c4ecea7c1d27aa88a69e8e53313df5c4)
 * [How to load textures from OBJ+MTL files in three.js in the year 2013? - Stack Overflow](http://stackoverflow.com/questions/17712857/how-to-load-textures-from-objmtl-files-in-three-js-in-the-year-2013)
 * [JavaScript — Setup scene in Three.js](http://blog.romanliutikov.com/post/58322336872/setup-scene-in-threejs)
 * [JavaScript — Rigging and skeletal animation in Three.js](http://blog.romanliutikov.com/post/60461559240/rigging-and-skeletal-animation-in-threejs)
 * [Exporting OBJ's in Noesis with assigned MTL/textures](https://facepunch.com/showthread.php?t=1337824)
 * [Blender OBJ fix + Noesis OBJ fix](http://www.vg-resource.com/thread-19706.html#)
 * [XeNTaX • View topic - Final Fantasy XI .DAT (PC)](http://forum.xentax.com/viewtopic.php?f=16&t=8347)
 * [Noesis - 3D model viewer and extraction tool](https://www.bluegartr.com/threads/127278-Noesis-3D-model-viewer-and-extraction-tool)
 * [import - Importing OBJ with MTL and Image not working properly - Blender Stack Exchange](http://blender.stackexchange.com/questions/24020/importing-obj-with-mtl-and-image-not-working-properly)
 * [Just a little project I'm working on... (Bastok Markets - Unity 3D) : ffxi](https://www.reddit.com/r/ffxi/comments/4eki4h/just_a_little_project_im_working_on_bastok/)
 * [WebGL + 3D models by using Three.js Blender Exporter // Speaker Deck](https://speakerdeck.com/yomotsu/webgl-plus-3d-models-by-using-three-dot-js-blender-exporter)
 * [The Beginner's Guide to three.js - Treehouse Blog](http://blog.teamtreehouse.com/the-beginners-guide-to-three-js)
 * [The Basics of THREE.js - YouTube](https://www.youtube.com/playlist?list=PLOGomoq5sDLutXOHLlESKG2j9CCnCwVqg)
 * [New skinned mesh animation system in three.js r73 and r74](http://yomotsu.net/blog/2015/10/31/three-r73-anim.html)
 * [javascript - ThreeJS r75 - TypeError: THREE.Animation is not a constructor - Stack Overflow](http://stackoverflow.com/questions/36355709/threejs-r75-typeerror-three-animation-is-not-a-constructor/36359811)