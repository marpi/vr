var user = false;
var camera, scene, renderer, butterfly, objectControls;
var effect;


var mobile = false;
var num = 2;
groupInfo = {};
init();

animate();

function prepareButterfly() {

 butterfly = new THREE.Object3D();
 leftwing = new THREE.Object3D();
 rightwing = new THREE.Object3D();

 butterfly.add(leftwing)
 rightwing.scale.x = -1
 butterfly.add(rightwing)

 butterfly.rotation.x = Math.PI/2
 butterfly.rotation.y = Math.PI
 butterfly.position.z = - 0.5

 scene.add(butterfly)
 //objects.push(object);
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

var geometries = [
  new THREE.IcosahedronGeometry( 5, 0 ),
  new THREE.OctahedronGeometry( 5, 0 ),
  new THREE.TetrahedronGeometry( 5, 0 ),
];

function Mesh(){
  var material = new THREE.MeshLambertMaterial( {
    color: new THREE.Color( Math.random(), Math.random() * 0.5, Math.random() ),
    blending: THREE.AdditiveBlending,
    depthTest: false,
    shading: THREE.FlatShading,
    transparent: true
  } );

  var geometry = geometries[ Math.floor( Math.random() * geometries.length ) ];
  var mesh = new THREE.Mesh(geometry, material);
  var wireframe = mesh.clone();
  wireframe.material = wireframe.material.clone();
  wireframe.material.wireframe = true;
  mesh.add( wireframe );
  return mesh;
}

function init() {

  // setup

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 3);
  camera.rotation.set( 0, 0, 0 );
  // camera z-position should change
  // z-position should sync w music
  camera.focalLength = camera.position.distanceTo(scene.position);
  camera.lookAt(scene.position);

  controls = new THREE.OrbitControls(camera);
  controls.autoRotate = false;
  controls.enablePan = true;

  // add leapmotion

  prepareButterfly();

  var loader = new THREE.OBJLoader();
  loader.load(
    'assets/obj/butterfly.obj',
    function (object){
      object.traverse( function ( child ) {

          if ( child instanceof THREE.Mesh ) {
              child.material = new THREE.MeshBasicMaterial( { color: 0x0000ff, shading: THREE.FlatShading, wireframe: false, transparent: true } );
          }

      } );
      object.scale.set(0.02,0.02,0.02);
      leftwing.add(object);
      var clone = object.clone();
      rightwing.add(clone);
      //console.log(loader);
  });

  objectControl = new THREE.LeapObjectControls(camera, butterfly);

  objectControl.rotateEnabled  = false;
  objectControl.rotateSpeed    = 3;
  objectControl.rotateHands    = 1;
  objectControl.rotateFingers  = [2, 3];

  objectControl.scaleEnabled   = false;
  objectControl.scaleSpeed     = 3;
  objectControl.scaleHands     = 1;
  objectControl.scaleFingers   = [4, 5];

  objectControl.panEnabled     = true;
  objectControl.panSpeed       = 3;
  objectControl.panHands       = 1;
  objectControl.panFingers     = [1, 5];
  objectControl.panRightHanded = false; // for left-handed person

  //scene.add(objectControl);

  Leap.loop(function(frame){
   objectControl.update(frame);
   renderer.render(scene, camera);
   console.log('control works');
  })

  //center object

  //load Json

  var messages

  var loader = new THREE.XHRLoader()
  loader.load('assets/data/sample_data.json', function(text){
    messages = JSON.parse(text);
    //var sample_data = messages; add comment

    var group = new THREE.Group();
    scene.add(group);

    var mesh, INTERVAL = 100, timers = [];
    // memory management of object creation
    for (var i = 0; i< messages.length; i++){

      (function(j, baseTime){
        var INTERVAL = baseTime*(j+1);
        setTimeout(function(){

          var time = new Date(messages[j].timestamp).getTime();
          var l = messages[j].content.length
          var mappedL = l/100
          var t1 = (time/10000)-137705670;
          var mappedZ = map_range(t1, 0, 9425592, 0, 10000000);
          var randomX = Math.random()*10 -5
          var randomY = Math.random()*10 -5

          var mesh = Mesh();
          mesh.position.x = randomX;
          mesh.position.y = randomY;
          mesh.position.z = mappedZ;
          mesh.scale.set(mappedL, mappedL, mappedL);
          group.add(mesh);

          if (group.children.length > 10) {
            group.children.splice(0,1);
          }

        },INTERVAL)

      })(i, 400);


     }
  });

}

// light
var light = new THREE.DirectionalLight(0xffffff);
light.position.set(-1, 1.5, 0.5);
scene.add(light);
// events
window.addEventListener('deviceorientation', setOrientationControls, true);
window.addEventListener('resize', onWindowResize, false);



function animate() {
  //console.log('animating')
    requestAnimationFrame(animate);
    render();
}
function render() {
    controls.update();
    if (mobile) {
        camera.position.set(0, 0, 0)
        camera.translateZ(5);
    }
    renderer.render(scene, camera);
}
