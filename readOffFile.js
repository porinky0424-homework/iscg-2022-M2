function readOffFile(text) {
  const points = new Map();
  const faces = new Map();

  const rows = text.split("\n");

  const [pointCount, faceCount, _] = rows[1]
    .split(/ |\t/)
    .filter((v) => v !== "")
    .map((v) => Number(v));

  for (let i = 0; i < pointCount; i += 1) {
    const row = rows[i + 2];
    points.set(
      i,
      row
        .split(/ |\t/)
        .filter((v) => v !== "")
        .map((v) => Number(v))
    );
  }

  for (let i = 0; i < faceCount; i += 1) {
    const row = rows[i + 2 + pointCount];
    const data = row
      .split(/ |\t/)
      .filter((v) => v !== "")
      .map((v) => Number(v));
    const pointCountOfFace = data[0];
    const pointIds = data.slice(1);
    faces.set(i, { pointCount: pointCountOfFace, pointIds });
  }

  return { points, faces };
}
