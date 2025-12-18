<script setup lang="ts">
    import {
    CandlestickData,
    createChart,
    HistogramData,
    LineData,
} from 'lightweight-charts';
import { onMounted, ref } from 'vue';

// ----------------------------
// 設定
// ----------------------------
const START_PRICE = 100;
const VOLATILITY = 0.6;
const INTERVAL = 50;

// ----------------------------
// refs（三個圖表）
// ----------------------------
const candleEl = ref<HTMLDivElement | null>(null);
const priceEl = ref<HTMLDivElement | null>(null);
const volumeEl = ref<HTMLDivElement | null>(null);

let timer: ReturnType<typeof setInterval> | null = null;

// ----------------------------
// 狀態
// ----------------------------
let lastClose = START_PRICE;
let currentTime = Math.floor(Date.now() / 1000);

// ----------------------------
// 假資料產生器（3.8.0 OK）
// ----------------------------
function generate() {
  const open = lastClose;
  const delta = (Math.random() - 0.5) * VOLATILITY;
  const close = +(open + delta).toFixed(2);
  const high = Math.max(open, close) + Math.random();
  const low = Math.min(open, close) - Math.random();
  const volume = Math.floor(Math.random() * 100 + 10);

  lastClose = close;
  currentTime += 1;

  return {
    candle: {
      time: currentTime,
      open,
      high,
      low,
      close,
    } as CandlestickData,
    price: {
      time: currentTime,
      value: close,
    } as LineData,
    volume: {
      time: currentTime,
      value: volume,
      color: close >= open ? '#22c55e' : '#ef4444',
    } as HistogramData,
  };
}

// ----------------------------
// lifecycle
// ----------------------------
onMounted(() => {
  if (!candleEl.value || !priceEl.value || !volumeEl.value) return;

  const common = {
    layout: {
      backgroundColor: '#0f172a',
      textColor: '#e5e7eb',
    },
    grid: {
      vertLines: { color: '#1e293b' },
      horzLines: { color: '#1e293b' },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
    },
  };

  // ----------------------------
  // K 線圖
  // ----------------------------
  const candleChart = createChart(candleEl.value, {
    ...common,
    height: 260,
  });

  const candleSeries = candleChart.addCandlestickSeries({
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderVisible: false,
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
  });

  // ----------------------------
  // 價格線圖
  // ----------------------------
  const priceChart = createChart(priceEl.value, {
    ...common,
    height: 160,
  });

  const priceSeries = priceChart.addLineSeries({
    color: '#facc15',
    lineWidth: 2,
  });

  // ----------------------------
  // 成交量圖
  // ----------------------------
  const volumeChart = createChart(volumeEl.value, {
    ...common,
    height: 120,
  });

  const volumeSeries = volumeChart.addHistogramSeries({
    priceFormat: { type: 'volume' },
  });

  // 初始化資料
  const INIT = 300;
  const candles: CandlestickData[] = [];
  const prices: LineData[] = [];
  const volumes: HistogramData[] = [];

  for (let i = 0; i < INIT; i++) {
    const d = generate();
    candles.push(d.candle);
    prices.push(d.price);
    volumes.push(d.volume);
  }

  candleSeries.setData(candles);
  priceSeries.setData(prices);
  volumeSeries.setData(volumes);

  // 即時更新
  timer = setInterval(() => {
    const d = generate();
    candleSeries.update(d.candle);
    priceSeries.update(d.price);
    volumeSeries.update(d.volume);
  }, INTERVAL);
});

</script>
<template>
  <div class="wrapper">
    <h2>Fake Stock Market (3 Charts)</h2>

    <div ref="candleEl" class="chart candle" />
    <div ref="priceEl" class="chart price" />
    <div ref="volumeEl" class="chart volume" />
  </div>
</template>



<style scoped>
div[ref="chartContainer"] {
  width: 100%;
  height: 400px;
}
div{
    padding-bottom: 20px;
}

</style>