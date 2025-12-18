<script lang="ts" setup>
import {
    CandlestickData,
    createChart,
    HistogramData,
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
let candleSeries: ISeriesApi<"Candlestick">;
let priceLineSeries: ISeriesApi<"Line">;
let volumeSeries: ISeriesApi<"Histogram">;
let timer: number | null = null;

// ----------------------------
// 狀態
// ----------------------------
let lastClose = START_PRICE;
let currentTime = Math.floor(Date.now() / 1000);

// ----------------------------
// 假資料產生器
// ----------------------------
function generateCandle() {
  const open = lastClose;
  const delta = (Math.random() - 0.5) * VOLATILITY;
  const close = +(open + delta).toFixed(2);
  const high = Math.max(open, close) + Math.random() * VOLATILITY * 0.5;
  const low = Math.min(open, close) - Math.random() * VOLATILITY * 0.5;
  const volume = Math.floor(Math.random() * 100 + 10); // 假成交量

  lastClose = close;
  currentTime += 1;

  const candle: CandlestickData = {
    time: currentTime,
    open,
    high: +high.toFixed(2),
    low: +low.toFixed(2),
    close,
  };
  const priceLine: LineData = { time: currentTime, value: close };
  const vol: HistogramData = {
    time: currentTime,
    value: volume,
    color: close >= open ? "#22c55e" : "#ef4444",
  };

  return { candle, priceLine, vol };
}

// ----------------------------
// lifecycle
// ----------------------------
onMounted(() => {
  if (!chartContainer.value) return;

  // 建立主圖表
  const chart = createChart(chartContainer.value, {
    width: 800,
    height: 400,
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
    },
  });

  // K 線
  candleSeries = chart.addCandlestickSeries({
    upColor: "#22c55e",
    downColor: "#ef4444",
    borderVisible: false,
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
  });

  // 價格線
  priceLineSeries = chart.addLineSeries({
    color: "#facc15",
    lineWidth: 2,
  });

  // 成交量
  volumeSeries = chart.addHistogramSeries({
    color: "#22c55e",
    priceFormat: {
      type: "volume",
    },
    priceScaleId: "",
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  });

  const TOTAL_CANDLES = 50000; // 初始化資料量
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

  // 每 INTERVAL 新增
  timer = window.setInterval(() => {
    const { candle, priceLine, vol } = generateCandle();
    candleSeries.update(candle);
    priceLineSeries.update(priceLine);
    volumeSeries.update(vol);
  }, INTERVAL);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div>
    <h2 style="color: #e5e7eb">
      Fake Stock Market (1s K-Line + Price + Volume)
    </h2>
    <div ref="chartContainer" />
  </div>
</template>

<style scoped>
div[ref="chartContainer"] {
  width: 100%;
  height: 400px;
}
</style>