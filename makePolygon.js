// 辺が繋がる順番にpointの列が与えられたとき、それらを面としたもののmeshをsceneに加える関数
function makePolygon(scene, pointList) {
  if (pointList.length < 3) {
    return undefined;
  }

  const geometry = new THREE.BufferGeometry();
  const verticesDraft = [];

  for (let i = 1; i + 1 < pointList.length; i += 1) {
    verticesDraft.push(...pointList[0]);
    verticesDraft.push(...pointList[i]);
    verticesDraft.push(...pointList[i + 1]);
  }

  const vertices = new Float32Array(verticesDraft);

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshPhongMaterial({
    color: 0xe6b422,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return mesh;
}
