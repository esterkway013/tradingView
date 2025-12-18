// layers/lineLayer.js
export function createLineLayer({ data, scale }) {
  let path = null;
  let dirty = true;

  function rebuild() {
    const len = data.value.length;
    if (len < 2) {
      path = null;
      dirty = false;
      return;
    }
    console.log('lineLayer rebuild');
    const p = new Path2D();

    for (let i = 0; i < len; i++) {
      const d = data.value[i];
      const x = scale.mapX(i, len);
      const y = scale.mapY(d.price);

      if (i === 0) p.moveTo(x, y);
      else p.lineTo(x, y);
    }

    path = p;
    dirty = false;
  }

  function draw(ctx) {
    if (dirty) rebuild();
    if (!path) return;

    ctx.save();

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.stroke(path);

    ctx.restore(); // ✅ 關鍵
  }

  function markDirty() {
    dirty = true;
  }

  return {
    draw,
    markDirty
  };
}
