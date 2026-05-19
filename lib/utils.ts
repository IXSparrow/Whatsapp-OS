export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number, decimals = 1) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

export function generateChartData(points = 8) {
  const data: { x: number; y: number }[] = [];
  for (let i = 0; i < points; i++) {
    data.push({ x: i, y: getRandomInt(20, 100) });
  }
  return data;
}
