// Cardboard

function Cardboard() {

  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  this.renderer.setSize(window.innerWidth, window.innerHeight);

  this.scene = new THREE.Scene();
  this.effect = new THREE.StereoEffect(this.renderer);

  this.camera = new THREE.PerspectiveCamera(
    90, window.innerWidth / window.innerHeight, 0.001, 700
  );
  this.scene.add(this.camera);

  this.controls = new THREE.DeviceOrientationControls(this.camera, true);

  this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  this.orbitControls.noZoom = true;
  this.orbitControls.noPan = true;
  this.orbitControls.autoRotate = false;

  window.addEventListener('resize', this.resize.bind(this), false);

  this._initControls = this.initControls.bind(this);
  window.addEventListener('deviceorientation', this._initControls, false);

  setTimeout(this.resize.bind(this), 0);

  // hack for resize when iframe doesn't get a rotation event
  // window.addEventListener('message', this.resize.bind(this), false );

  this.animate = this.animate.bind(this);
  setTimeout(this.play.bind(this), 0);

}

Cardboard.prototype.initControls = function ( event ) {
  if ( event.alpha ) {

    window.removeEventListener('deviceorientation', this._initControls, false);
    this.renderer.domElement.addEventListener('click', this.fullscreen.bind(this), false);

    this.orbitControls.enabled = false;

    this.controls.connect();
    this.controls.update();
  }
};

Cardboard.prototype.animate = function() {
  if (!this._playing)
    return;
  requestAnimationFrame(this.animate);
  this.update();
  this.render();
};

Cardboard.prototype.pause = function() {
  this._playing = false;
};

Cardboard.prototype.play = function() {
  if (this._playing) return;
  this._playing = true;
  this.animate();
};

Cardboard.prototype.update = function() {
  // hack to resize if width and height change
  if (this.width !== window.innerWidth || this.height !== window.innerHeight) {
    this.resize();
  }
  this.camera.updateProjectionMatrix();
  if (this.controls.freeze === false) {
    this.controls.update();
  } else {
    this.orbitControls.update();
  }
};

Cardboard.prototype.render = function() {
  //if (this.controls.freeze === false) {
    this.effect.render(this.scene, this.camera);
  //} else {
    //this.renderer.render(this.scene, this.camera);
  //}
};

Cardboard.prototype.fullscreen = function() {
  if (this.renderer.domElement.requestFullscreen) {
    this.renderer.domElement.requestFullscreen();
  } else if (this.renderer.domElement.msRequestFullscreen) {
    this.renderer.domElement.msRequestFullscreen();
  } else if (this.renderer.domElement.mozRequestFullScreen) {
    this.renderer.domElement.mozRequestFullScreen();
  } else if (this.renderer.domElement.webkitRequestFullscreen) {
    this.renderer.domElement.webkitRequestFullscreen();
  }
};

Cardboard.prototype.resize = function() {
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.camera.aspect = this.width / this.height;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(this.width, this.height);
  this.effect.setSize(this.width, this.height);
};