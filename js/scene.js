var elements = [];
var roz = 1300;
var max = 400;
var cubeSize = 160;
var androids = [];
var keyLight

function createScene(scene, renderer) {

    var r = "textures/cube/grey/";
    var urls = [r + "px.jpg", r + "nx.jpg",
        r + "py.jpg", r + "ny.jpg",
        r + "pz.jpg", r + "nz.jpg"];

    textureCube = THREE.ImageUtils.loadTextureCube(urls);

    // Skybox

    shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = textureCube;

    cubeMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.DoubleSide

    })

    cubeMesh = new THREE.Mesh(new THREE.CubeGeometry(500, 500, 500), cubeMaterial);
    scene.add(cubeMesh);

    keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(5, 10, 5);
    scene.add(keyLight);

    var ambient = new THREE.AmbientLight(0x222222)
    scene.add(ambient);

    var loader = new THREE.ColladaLoader(  );
    loader.load('test.dae', function (object) {
        var object = object.scene
        var i = 0;
        object.traverse(function (child) {

            if (child instanceof THREE.Mesh) {
                elements.push(child)
                var color
                if (child.material)
                    color = child.material.color
                if (!color) {
                    console.log(child.material.materials[child.material.materials.length - 1].color)
                    color = new THREE.Color()

                    if (i == 6 || i == 4) {
                        color.setRGB(0.5098039215686274, 0.4196078431372549, 0.15294117647058825)
                    } else {
                        color.setRGB(0.8, 0.1, 0.1)
                    }
                    //color=child.material.materials[0].color
                }
                child.material = new THREE.MeshPhongMaterial({
                    color: color,
                    shading: THREE.FlatShading,
                    side: THREE.DoubleSide,
                    cubeMap: textureCube
                })
                i++
                console.log(child)
            }

        });

        object.rotation.x = -Math.PI / 2;

        object.scale.set(15.50, 15.50, 15.50)
        
        object.position.y = - .1;
        scene.add(object);

    });
}

function change_uvs(geometry, unitx, unity, offsetx, offsety) {

    var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
    for (var i = 0; i < faceVertexUvs.length; i++) {
        var uvs = faceVertexUvs[ i ];
        for (var j = 0; j < uvs.length; j++) {
            var uv = uvs[ j ];
            uv.x = (uv.x + offsetx) * unitx;
            uv.y = (uv.y + offsety) * unity;
        }
    }
}

var time = 0
function updateScene(camera) {
    time += .01
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i]
        el.parent.position.z += Math.sin(time) * (el.parent.position.z*1000) / 200000
        //el.parent.position.x+=Math.sin(time)*(i-elements.length/2)/20000
    }
    for (var i = 0; i < androids.length; i++) {
        var el = androids[i]
        el.lookAt(new THREE.Vector3())
    }
    keyLight.position.set(camera.position.x, camera.position.y, camera.position.z)
}