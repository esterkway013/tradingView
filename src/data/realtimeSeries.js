export function createRealtimeSeries({
  startPrice = 100,
  maxPoints = 30,
  minDelta = 3,
  maxDelta = 10,
  interval = 1000
} = {}) {
  const data = [];       
  let lastPrice = startPrice;
  let timer = null;

  function generateNext() {
  return {
    time: Date.now(),
    price: Math.floor(Math.random() * (100 - 120 + 1)) + 120
  };
  }

  function push(point) {
    data.push(point);
    if (data.length > maxPoints) {
      data.shift();
    }
  }

  function tick() {
    const point = generateNext();
    push(point);
    return point;
  }

  function start(onTick) {
    if (timer) return;

    // ★ 清空陣列，不換 reference
    data.length = 0;
    lastPrice = startPrice;

    const first = {
      time: Date.now(),
      price: startPrice
    };

    data.push(first);
    onTick(first);

    timer = setInterval(() => {
      const p = tick();
      onTick(p);
    }, interval);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }


  function getData() {
    console.log(data, 'data in realtimeSeries');
    return data;
  }

  return {
    start,
    stop,
    getData
  };
}
