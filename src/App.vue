<script lang="ts" setup>
import {
  CandlestickData,
  createChart,
  HistogramData,
  IChartApi,
  ISeriesApi,
  LineData,
} from "lightweight-charts";
import { onMounted, onUnmounted, ref } from "vue";

// ----------------------------
// 設定
// ----------------------------
const START_PRICE = 100;
const VOLATILITY = 0.6;
const INTERVAL = 50; // 1 秒

// ----------------------------
// refs
// ----------------------------
const chartContainer = ref<HTMLDivElement | null>(null);
const volumeChartContainer = ref<HTMLDivElement | null>(null);

let mainChart: IChartApi;
let volChart: IChartApi;

let candleSeries: ISeriesApi<"Candlestick">;
let priceLineSeries: ISeriesApi<"Line">;
let volumeSeries: ISeriesApi<"Histogram">;

let timer: number | null = null;
let handleResize: () => void;

// ----------------------------
// 狀態
// ----------------------------
let lastClose = START_PRICE;
let currentTime = Math.floor(Date.now() / 100);

// ----------------------------
// 假資料產生器
// ----------------------------
const PRICE_VOLATILITY = 2.5;
const VOLUME_BASE = 50;
const VOLUME_NOISE = 120;

function generateCandle() {
  const open = lastClose;
  const delta = (Math.random() - 0.5) * PRICE_VOLATILITY;
  const close = +(open + delta).toFixed(2);
  const high = Math.max(open, close) + Math.random() * PRICE_VOLATILITY * 0.6;
  const low = Math.min(open, close) - Math.random() * PRICE_VOLATILITY * 0.6;

  const randomVolume = VOLUME_BASE + Math.random() * VOLUME_NOISE;
  const volume = Math.floor(randomVolume);

  lastClose = close;
  currentTime += 1;

  return {
    candle: {
      time: currentTime,
      open,
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close,
    },
    priceLine: { time: currentTime, value: close },
    vol: {
      time: currentTime,
      value: volume,
      color: close >= open ? "#22c55e" : "#ef4444",
    },
  };
}

// ----------------------------
// 同步邏輯
// ----------------------------
function syncCharts(c1: IChartApi, c2: IChartApi) {
  let isSyncing = false;
  
  const sync = (source: IChartApi, target: IChartApi) => {
    const range = source.timeScale().getVisibleLogicalRange();
    if (range) {
      target.timeScale().setVisibleLogicalRange(range);
    }
  };

  c1.timeScale().subscribeVisibleLogicalRangeChange(() => {
    if (!isSyncing) {
      isSyncing = true;
      sync(c1, c2);
      isSyncing = false;
    }
  });

  c2.timeScale().subscribeVisibleLogicalRangeChange(() => {
    if (!isSyncing) {
      isSyncing = true;
      sync(c2, c1);
      isSyncing = false;
    }
  });
}

// ----------------------------
// lifecycle
// ----------------------------
onMounted(async () => {
  await new Promise((r) => setTimeout(r, 100));

  if (!chartContainer.value || !volumeChartContainer.value) return;

  const w = window.innerWidth;
  const CHART_WIDTH = w ? w - 50 : 300;

  // 1. Main Chart (Price)
  mainChart = createChart(chartContainer.value, {
    width: CHART_WIDTH,
    height: 300,
    layout: {
      background: { color: "#0f172a" },
      textColor: "#e5e7eb",
    },
    grid: {
      vertLines: { color: "#1e293b" },
      horzLines: { color: "#1e293b" },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
      visible: false, // Hide dates on main chart
    },
  });

  candleSeries = mainChart.addCandlestickSeries({
    upColor: "#22c55e",
    downColor: "#ef4444",
    borderVisible: false,
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
  });

  priceLineSeries = mainChart.addLineSeries({
    color: "#facc15",
    lineWidth: 2,
  });

  // 2. Volume Chart (Sub)
  volChart = createChart(volumeChartContainer.value, {
    width: CHART_WIDTH,
    height: 100,
    layout: {
      background: { color: "#0f172a" },
      textColor: "#e5e7eb",
    },
    grid: {
      vertLines: { color: "#1e293b" },
      horzLines: { color: "#1e293b" },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
      visible: true, // Also show dates on bottom
    },
  });

  volumeSeries = volChart.addHistogramSeries({
    color: "#22c55e",
    priceFormat: {
      type: "volume",
    },
  });

  // 3. Sync them
  syncCharts(mainChart, volChart);

  // 4. Initial Data
  const TOTAL_CANDLES = 50;
  const candles: CandlestickData[] = [];
  const priceLineData: LineData[] = [];
  const volumes: HistogramData[] = [];

  for (let i = 0; i < TOTAL_CANDLES; i++) {
    const { candle, priceLine, vol } = generateCandle();
    candles.push(candle);
    priceLineData.push(priceLine);
    volumes.push(vol);
  }

  candleSeries.setData(candles);
  priceLineSeries.setData(priceLineData);
  volumeSeries.setData(volumes);

  // 5. Timer
  timer = window.setInterval(() => {
    const { candle, priceLine, vol } = generateCandle();
    candleSeries.update(candle);
    priceLineSeries.update(priceLine);
    volumeSeries.update(vol);
  }, INTERVAL);

  // 6. Resize
  handleResize = () => {
    const newWidth = window.innerWidth - 50;
    mainChart.resize(newWidth, 300);
    volChart.resize(newWidth, 100);
  };
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener("resize", handleResize);
  if (mainChart) mainChart.remove();
  if (volChart) volChart.remove();
});
</script>

<template>
  <div>
    <h2 style="color: #e5e7eb">
      Kway Stock Market <br />(Dual Pane: Price & Volume)
    </h2>
    <div ref="chartContainer" class="chart-box" />
    <div ref="volumeChartContainer" class="chart-box" />
  </div>
</template>

<style scoped>
.chart-box {
  width: 100%;
}
</style>