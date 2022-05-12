function formatData(points, faces) {
  const edges = new Map(); // エッジ
  const faceEdges = new Map(); // ある面がもつエッジの情報

  let edgesCount = 0;
  const alreadyAddedEdges = new Map();

  Array.from(faces.entries()).forEach(([faceId, faceInfo]) => {
    const pointIds = faceInfo.pointIds;
    for (let i = 0; i < pointIds.length; i += 1) {
      const key =
        pointIds[i] < pointIds[(i + 1) % pointIds.length]
          ? `${pointIds[i]},${pointIds[(i + 1) % pointIds.length]}`
          : `${pointIds[(i + 1) % pointIds.length]},${pointIds[i]}`;
      if (alreadyAddedEdges.has(key)) {
        // すでにedgesに加えられている
        const edgeId = alreadyAddedEdges.get(key);
        if (faceEdges.has(faceId)) {
          const edgeIds = faceEdges.get(faceId);
          edgeIds.push(edgeId);
          faceEdges.set(faceId, edgeIds);
        } else {
          faceEdges.set(faceId, [edgeId]);
        }
      } else {
        // まだedgesに加えられていない
        const edgeId = edgesCount;
        edgesCount += 1;
        edges.set(edgeId, [pointIds[i], pointIds[(i + 1) % pointIds.length]]);
        if (faceEdges.has(faceId)) {
          const edgeIds = faceEdges.get(faceId);
          edgeIds.push(edgeId);
          faceEdges.set(faceId, edgeIds);
        } else {
          faceEdges.set(faceId, [edgeId]);
        }
        alreadyAddedEdges.set(key, edgeId);
      }
    }
  });

  return { edges, faceEdges };
}
