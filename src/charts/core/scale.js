// core/scale.js
export function createScale({ width, height, padding }) {
  let min = 0;
  let max = 1;
  
  function setDomain(_min, _max) {
    min = _min;
    max = _max === _min ? _min + 1 : _max;
  }
  function getDomain() {
    console.log('123', min, max);
    return { min, max };
  }
  function mapX(i, total) {
    if (total <= 1) return padding;

    const drawableWidth = width - padding * 2;
    return padding + (i / (total - 1)) * drawableWidth;
  }

  function mapY(v) {
    const range = max - min || 1;
    const drawableHeight = height - padding * 2;

    return (
      padding +
      ((v - min) / range) * drawableHeight
    );
  }

return {
    // 公開屬性（Axis / Line 都需要）
    width,
    height,
    padding,

    // domain API
    setDomain,
    getDomain,

    // mapping API
    mapX,
    mapY
  };
}
