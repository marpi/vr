var infoDiv = document.getElementById('info');
var user = false;
var camera, scene, renderer, leftwing, rightwing, butterfly, objectControls, box;
var group;
var audio, beat;
var prevTime = performance.now();
var effect;
var mobile = false;
var num = 2;
init();
// animate();

function init() {
    // setup
    audio = document.createElement('audio');
    audio.src = 'assets/datassette - Offal (1999-2014) - 87 Dataworld (2004).ogg';
    //renderer = new THREE.WebGLRenderer({antialias: true});
    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    renderer.autoClear = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, .01, 1000);
    camera.position.set(0, 0, 5);
    camera.rotation.set(0, 0, 0);
    camera.focalLength = camera.position.distanceTo(scene.position);
    camera.lookAt(scene.position);

    controls = new THREE.OrbitControls(camera);
    controls.autoRotate = false;
    controls.enablePan = true;

    prepareButterfly();

    function prepareButterfly() {
        butterfly = new THREE.Object3D();
        leftwing = new THREE.Object3D();
        rightwing = new THREE.Object3D();

        butterfly.add(leftwing);
        rightwing.scale.x = -1;
        butterfly.add(rightwing);
        scene.add(butterfly);
    }
    //load Butterfly Wing
    var loader = new THREE.OBJLoader();
    loader.load(
            'assets/obj/butterfly_new.obj',
            function (object) {
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        var material = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(Math.random() * 0.2, Math.random() * 0.2, 1),
                            blending: THREE.AdditiveBlending,
                            depthTest: false,
                            side: THREE.DoubleSide,
                            wireframe: false,
                            transparent: true
                        });
                        child.material = material
                    }
                });

                object.scale.set(0.02, 0.02, 0.02);
                object.position.set(0, 0, -1);
                object.rotation.set(0, 0, -Math.PI / 4);
                leftwing.add(object);
                var clone = object.clone();
                rightwing.add(clone);

                var flapTime = 0.3;
                var ease = Sine.easeInOut;
                var delayTime = Math.random();
                var degree = Math.PI * 0.75;

                TweenMax.to(leftwing.rotation, flapTime, {ease: ease, delay: delayTime, z: degree, repeat: -1, yoyo: true});
                TweenMax.to(rightwing.rotation, flapTime, {ease: ease, delay: delayTime, z: -degree, repeat: -1, yoyo: true});
            });



    //leap motion
    objectControl = new THREE.LeapObjectControls(camera, box);
    objectControl.rotateEnabled = true;
    objectControl.rotateSpeed = 3;
    objectControl.rotateHands = 1;
    objectControl.rotateFingers = [2, 3];

    objectControl.scaleEnabled = false;
    objectControl.scaleSpeed = 3;
    objectControl.scaleHands = 1;
    objectControl.scaleFingers = [4, 5];

    objectControl.panEnabled = true;
    objectControl.panSpeed = 3;
    objectControl.panHands = 1;
    objectControl.panFingers = [1, 5];
    objectControl.panRightHanded = false;
    Leap.loop(function (frame) {
        objectControl.update(frame);
        renderer.render(scene, camera);
        console.log('control works');
    })


    //load Json
    var messages
    group = new THREE.Group();
    scene.add(group);

    var loader = new THREE.XHRLoader()
    loader.load('assets/data/sample_data.json', function (text) {
        messages = JSON.parse(text);
        for (var i = 0; i < messages.length; i++) {
            var time = new Date(messages[i].timestamp).getTime();
            var l = messages[i].content.length
            var mappedL = l / 100
            var t1 = (time / 10000) - 137705670;
            var mappedZ = map_range(t1, 0, 9425592, -5, -1000);
            var randomX = Math.random() * 10 - 5
            var randomY = Math.random() * 10 - 5
            var mesh = Mesh();
            mesh.position.x = randomX;
            mesh.position.y = randomY;
            mesh.position.z = mappedZ;
            mesh.scale.set(mappedL, mappedL, mappedL);
            group.add(mesh);
        }
    });
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

//Mesh function
var geometries = [
    new THREE.IcosahedronGeometry(5, 0),
    new THREE.OctahedronGeometry(5, 0),
    new THREE.TetrahedronGeometry(5, 0),
];

function Mesh() {
    var material = new THREE.MeshLambertMaterial({
        color: new THREE.Color(Math.random(), Math.random() * 0.5, Math.random()),
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
    });

    var geometry = geometries[ Math.floor(Math.random() * geometries.length) ];
    var mesh = new THREE.Mesh(geometry, material);
    var wireframe = mesh.clone();
    wireframe.material = wireframe.material.clone();
    wireframe.material.wireframe = true;
    mesh.add(wireframe);
    return mesh;
}

function start() {
    infoDiv.style.display = 'none';
    camera.position.set(0, 0, 1);
    camera.rotation.set(0, 0, 0);
    // audio.play();
    animate(performance.now());

}

function stop() {
    infoDiv.style.display = '';
}

// light
var light = new THREE.DirectionalLight(0xffffff);
light.position.set(-1, 1.5, 0.5);
scene.add(light);
// events
window.addEventListener('deviceorientation', setOrientationControls, true);
window.addEventListener('resize', onWindowResize, false);



function animate(time) {
    if (audio.duration > 0 && audio.currentTime === audio.duration) {
        stop();
        console.log('audio.duration')
        return;
    }


    //var delta = time - prevTime;
    //camera.position.z = audio.currentTime;
    //
    // for (var i = 0; i < group.children.length; i++) {
    // 					var child = group.children[ i ];
    //           //
    // 					// child.rotation.x += 0.0005 * delta;
    // 					// child.rotation.y += 0.001 * delta;
    // 					child.position.z += 0.01;
    //
    // 					// if ( child.position.z > 2000 ) {
    // 					// 	child.position.z -= 4000;
    //           //
    // 					// }
    // 				}

    render();
}
function render() {
    controls.update();
    if (mobile) {
        camera.position.set(0, 0, 0)
        camera.translateZ(5);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
