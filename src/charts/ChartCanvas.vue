
<template>
   <div class="chart">
    <canvas id="axisCanvas" ref="axisCanvas" />
    <canvas id="lineCanvas" ref="lineCanvas" />
    <canvas ref="interactionCanvas" />

    {{ data }}
  </div>
</template>
<script setup>
  import { onMounted, ref } from 'vue';
import { createRealtimeSeries } from '../data/realtimeSeries';
import { createScale } from './core/scale';
import { createAxisLayer } from './layers/axisLayer';
import { createLineLayer } from './layers/lineLayer';
  const props = defineProps({
  data: Array,
});

// 基本設定
const WIDTH = 800;
const HEIGHT = 700;
const DPR = window.devicePixelRatio || 1;

// Canvas 元素
const axisCanvas = ref(null);
const lineCanvas = ref(null);
const interactionCanvas = ref(null);

// 資料
let series = null;

let ctx = null;
let scale = null;
let lineLayer = null;

let axisCtx = null;
let axisLayer = null;
const data = ref([]);
/* =====================
   初始化
===================== */
onMounted(() => {
 series = createRealtimeSeries({
    startPrice: 100,
    maxPoints: 30,
    interval: 1000
  });

  data.value = series.getData();
  ctx = setupCanvas(lineCanvas.value);
  axisCtx = setupCanvas(axisCanvas.value);

  scale = createScale({
    width: WIDTH,
    height: HEIGHT,
    padding: 40
  });


  lineLayer = createLineLayer({ data, scale });
  axisLayer = createAxisLayer({ scale });
// ★ 啟動資料流
  series.start(() => {
    console.log(data.value, 'data')
    const prices = data.value.length > 0 ? data.value.map(d => d.price) : [];
    scale.setDomain(
      Math.min(...prices),
      Math.max(...prices)
    );

    lineLayer.markDirty();
    renderLine();
  });
});

/* =====================
   Canvas 初始化
===================== */
function setupCanvas(canvas) {
  canvas.width = WIDTH * DPR;
  canvas.height = HEIGHT * DPR;
  canvas.style.width = `${WIDTH}px`;
  canvas.style.height = `${HEIGHT}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  return ctx;
}



/* =====================
   單層 render（之後可升級）
===================== */
function renderLine() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  axisCtx.clearRect(0, 0, WIDTH, HEIGHT);
  lineLayer.draw(ctx);
  axisLayer.draw(axisCtx);
  console.log(data.value, 'data')
}

</script>
<style scoped>
.chart {
  position: relative;
  width: 800px;
  height: 700px;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
}
</style>

