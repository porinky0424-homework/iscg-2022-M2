function distance(p1, p2) {
  return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}

// 外積を利用して、ABの右側にCがあるかを判定する関数
function isRight(A, B, C) {
  const AB = [B[0] - A[0], B[1] - A[1]];
  const AC = [C[0] - A[0], C[1] - A[1]];

  return AB[0] * AC[1] - AB[1] * AC[0] <= 0;
}

// 凸包を求めることで、pointsがなす多角形を計算する
// 凸な多角形をなすpointsが与えられることを仮定して書いている
// points.idの順番を返す
function giftWrapping(points) {
  // points: Map<pointId, position>

  const pointIds = [];
  const pointsList = [];
  Array.from(points.entries()).forEach(([key, val]) => {
    pointIds.push(key);
    pointsList.push(val);
  });

  if (pointsList.length < 3) {
    return pointIds;
  }

  // xy平面に点を射影する
  let projectedPoints = pointsList.map((point) => [point[0], point[1]]);

  // xy平面に垂直な場合＝xy平面上で3点が一直線になっている場合、xy平面に射影してもだめなので、yz平面に射影する。それでもだめなら、zx平面に射影する。
  let dist1 = distance(projectedPoints[0], projectedPoints[1]);
  let dist2 = distance(projectedPoints[1], projectedPoints[2]);
  let dist3 = distance(projectedPoints[2], projectedPoints[0]);
  if (
    dist1 + dist2 - dist3 < 10 ** -8 ||
    dist2 + dist3 - dist1 < 10 ** -8 ||
    dist3 + dist1 - dist2 < 10 ** -8
  ) {
    projectedPoints = pointsList.map((point) => [point[1], point[2]]);

    dist1 = distance(projectedPoints[0], projectedPoints[1]);
    dist2 = distance(projectedPoints[1], projectedPoints[2]);
    dist3 = distance(projectedPoints[2], projectedPoints[0]);

    if (
      dist1 + dist2 - dist3 < 10 ** -8 ||
      dist2 + dist3 - dist1 < 10 ** -8 ||
      dist3 + dist1 - dist2 < 10 ** -8
    ) {
      projectedPoints = pointsList.map((point) => [point[0], point[2]]);
    }
  }

  // 平面上でGift wrapping algorithmを考え、つなぐ順序を考える
  const pointsIdxOrder = [0];
  let standartPoint = projectedPoints[0];
  const alreadyCosideredPointIndex = new Set();
  alreadyCosideredPointIndex.add(0);
  let i = 0;
  while (alreadyCosideredPointIndex.size !== projectedPoints.length) {
    if (!alreadyCosideredPointIndex.has(i)) {
      const checkedPoint = projectedPoints[i];

      if (checkedPoint === undefined) {
        alreadyCosideredPointIndex.add(i);
      }

      if (
        projectedPoints.every((projectedPoint) =>
          isRight(standartPoint, checkedPoint, projectedPoint)
        )
      ) {
        alreadyCosideredPointIndex.add(i);
        pointsIdxOrder.push(i);

        // 座標が同じものがあるときは、同時に入れてあげる必要がある
        projectedPoints.forEach((projectedPoint, idx) => {
          if (
            Math.abs(projectedPoint[0] - checkedPoint[0]) < 10 ** -8 &&
            Math.abs(projectedPoint[1] - checkedPoint[1]) < 10 ** -8 &&
            idx !== i &&
            !alreadyCosideredPointIndex.has(idx)
          ) {
            alreadyCosideredPointIndex.add(idx);
            pointsIdxOrder.push(idx);
          }
        });

        i = 0;
        standartPoint = checkedPoint;
        continue;
      }
    }
    i += 1;
    continue;
  }

  return pointsIdxOrder.map((val) => pointIds[val]);
}

// 座標の平均をとる関数
function average(points) {
  let acc = [0, 0, 0];
  points.forEach((point) => {
    acc[0] += point[0];
    acc[1] += point[1];
    acc[2] += point[2];
  });
  return acc.map((val) => val / points.length);
}

function dooSabin(points, faces, edges, faceEdges) {
  let pointCount = 0;
  let faceCount = 0;
  const newPoints = new Map();
  const newFaces = new Map();

  const newFacesOnPoint = new Map(); // 頂点上にできる面について、pointId => List<newPointId>の形でもつ
  const newFacesOnEdge = new Map(); // エッジ上にできる面について、edgeId => List<newPointId>の形でもつ

  Array.from(faces.entries()).forEach(([faceId, faceInfo]) => {
    const list = faceEdges.get(faceId); // faceId番のfaceの辺の配列

    const newFace = []; // このface上であらたに生成される面が持つ点のid

    // このfaceの重心座標を求める
    const faceCenter = average(
      faceInfo.pointIds.map((pointId) => points.get(pointId))
    );

    for (let i = 0; i < list.length; i += 1) {
      // 隣合う2辺のid
      const edge1Id = list[i];
      const edge2Id = list[(i + 1) % list.length];

      // エッジの端点を取得
      const edge1PointIds = edges.get(edge1Id);
      const edge2PointIds = edges.get(edge2Id);
      let commonPointId, edge1OtherPointId, edge2OtherPointId;
      for (let j = 0; j < 2; j += 1) {
        for (let k = 0; k < 2; k += 1) {
          if (edge1PointIds[j] === edge2PointIds[k]) {
            commonPointId = edge1PointIds[j];
            edge1OtherPointId = edge1PointIds[(j + 1) % 2];
            edge2OtherPointId = edge2PointIds[(k + 1) % 2];
          }
        }
      }

      // エッジの中点座標を取得
      const edge1Center = average([
        points.get(commonPointId),
        points.get(edge1OtherPointId),
      ]);
      const edge2Center = average([
        points.get(commonPointId),
        points.get(edge2OtherPointId),
      ]);
      const commonPoint = points.get(commonPointId);

      // 新しく点を生成
      const newPoint = average([
        faceCenter,
        edge1Center,
        edge2Center,
        commonPoint,
      ]);

      newPoints.set(pointCount, newPoint);

      // この面上にできる新たな面を生成
      newFace.push(pointCount);

      // 頂点上にできる新たな面についての処理
      if (newFacesOnPoint.has(commonPointId)) {
        const tmp = newFacesOnPoint.get(commonPointId);
        tmp.push(pointCount);
        newFacesOnPoint.set(commonPointId, tmp);
      } else {
        newFacesOnPoint.set(commonPointId, [pointCount]);
      }

      // エッジ上にできる新たな面についての処理
      if (newFacesOnEdge.has(edge1Id)) {
        const tmp = newFacesOnEdge.get(edge1Id);
        tmp.push(pointCount);
        newFacesOnEdge.set(edge1Id, tmp);
      } else {
        newFacesOnEdge.set(edge1Id, [pointCount]);
      }
      if (newFacesOnEdge.has(edge2Id)) {
        const tmp = newFacesOnEdge.get(edge2Id);
        tmp.push(pointCount);
        newFacesOnEdge.set(edge2Id, tmp);
      } else {
        newFacesOnEdge.set(edge2Id, [pointCount]);
      }

      pointCount += 1;
    }

    newFaces.set(faceCount, {
      pointsCount: newFace.length,
      pointIds: giftWrapping(
        new Map(newFace.map((pointId) => [pointId, newPoints.get(pointId)]))
      ),
    });
    faceCount += 1;
  });

  // 頂点上、エッジ上にできる新たな面を生成
  Array.from(newFacesOnPoint.entries()).forEach(([pointId, newPointIds]) => {
    newFaces.set(faceCount, {
      pointsCount: newPointIds,
      pointIds: giftWrapping(
        new Map(newPointIds.map((pointId) => [pointId, newPoints.get(pointId)]))
      ),
    });
    faceCount += 1;
  });
  Array.from(newFacesOnEdge.entries()).forEach(([edgeId, newPointIds]) => {
    newFaces.set(faceCount, {
      pointsCount: newPointIds,
      pointIds: giftWrapping(
        new Map(newPointIds.map((pointId) => [pointId, newPoints.get(pointId)]))
      ),
    });
    faceCount += 1;
  });

  return { points: newPoints, faces: newFaces };
}
