// layers/axisLayer.js
export function createAxisLayer({ scale }) {
  console.log(scale, 'scale in axisLayer');
  const TICK_COUNT = 5;

  function draw(ctx) {
    const { width, height, padding } = scale;
    const axisX = Math.round(width - padding) + 0.5;// 右側 Y 軸位置

    ctx.save();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;

    // Y 軸（右）
    ctx.beginPath();
    ctx.moveTo(axisX, padding);
    ctx.lineTo(axisX, height - padding);
    ctx.stroke();

    // X 軸（底）
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(axisX, height - padding);
    ctx.stroke();

    // Y 軸刻度
    const { min, max } = scale.getDomain();
    const range = max - min || 1;

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = TICK_COUNT; i >= 0; i--) {
      const value = min + (range / TICK_COUNT) * i;
      const y = scale.mapY(value);

      // 刻度線（右 → 左）
      ctx.beginPath();
      ctx.moveTo(axisX, y);
      ctx.lineTo(axisX + 4, y);
      ctx.stroke();

      // 刻度文字（軸線右側）
      ctx.fillText(value.toFixed(2), axisX + 6, y);
    }

    ctx.restore();
  }

  return { draw };
}
