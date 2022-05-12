// renderer, scene, cameraの初期設定
function init(cameraCoordinate) {
  // canvasのサイズを指定
  const WIDTH = 900;
  const HEIGHT = 700;

  // rendererを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#Canvas"),
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(WIDTH, HEIGHT);

  // シーンを作成
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // カメラを作成
  const FOV = 100;
  const ASPECT = WIDTH / HEIGHT;
  const NEAR = 0.1;
  const FAR = 50;
  const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

  // 初期位置のセット
  camera.position.set(cameraCoordinate.radius, 0, 0); // (R,0,0)にリセット
  camera.lookAt(new THREE.Vector3(0, 0, 0)); // 原点の方を向く
  camera.rotation.x += Math.PI / 2; // カメラを見る向きがyz平面に垂直になるように調整
  camera.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), cameraCoordinate.phi); // phiの分移動
  camera.rotateOnWorldAxis(
    new THREE.Vector3(
      -Math.sin(cameraCoordinate.phi),
      Math.cos(cameraCoordinate.phi),
      0
    ),
    -(Math.PI / 2 - cameraCoordinate.theta)
  ); // thetaの分移動
  camera.position.set(
    cameraCoordinate.radius *
      Math.sin(cameraCoordinate.theta) *
      Math.cos(cameraCoordinate.phi),
    cameraCoordinate.radius *
      Math.sin(cameraCoordinate.theta) *
      Math.sin(cameraCoordinate.phi),
    cameraCoordinate.radius * Math.cos(cameraCoordinate.theta)
  );
  scene.add(camera);

  // カメラに光源を作成
  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 0, 0);
  camera.add(light);

  // 座標軸の作成
  scene.add(
    // x
    new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), // direction
      new THREE.Vector3(-5, 0, 0), // origin
      10, // length
      0xff0000, // color
      0.3, // headLength
      0.3 // headWidth
    )
  );
  scene.add(
    // y
    new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0), // direction
      new THREE.Vector3(0, -5, 0), // origin
      10, // length
      0x0000ff, // color
      0.3, // headLength
      0.3 // headWidth
    )
  );
  scene.add(
    // z
    new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1), // direction
      new THREE.Vector3(0, 0, -5), // origin
      10, // length
      0x00ff00, // color
      0.3, // headLength
      0.3 // headWidth
    )
  );

  // ファーストレンダリング
  renderer.render(scene, camera);

  return { renderer, scene, camera };
}
