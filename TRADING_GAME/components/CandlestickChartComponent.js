import React, { useMemo } from 'react';
import { View, StyleSheet, TextInput, Switch, Text } from 'react-native';

const CandlestickChart = ({
  ohlc,
  tradeStartIndex,
  currentIndex,
  currPrice,
  tradeStartPrice,
  onPressChartFn,
  takeProfit,
  stopLoss,
  trailingStop,
  height,
  width,
  hideLinePath = false,
  isLong,
  emaPeriod,
  useHeikinAshi,
}) => {

  const chartWidth = width;
  const chartHeight = height;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };

  const calculateHeikinAshi = (data) => {
    if (!data || data.length === 0) return [];
    const haData = [];
    let previousHA = { open: data[0].open, close: data[0].close };
    data.forEach((candle, index) => {
      const haClose = (candle.open + candle.high + candle.low + candle.close) / 4;
      const haOpen = (previousHA.open + previousHA.close) / 2;
      const haHigh = Math.max(candle.high, haOpen, haClose);
      const haLow = Math.min(candle.low, haOpen, haClose);
      haData.push({ open: haOpen, high: haHigh, low: haLow, close: haClose });
      previousHA = { open: haOpen, close: haClose };
    });
    return haData;
  };

  // console.log('USE useHeikinAshi? ', useHeikinAshi)
  const candleData = useMemo(() => useHeikinAshi ? calculateHeikinAshi(ohlc) : ohlc, [ohlc, useHeikinAshi]);

  const candleWidth = useMemo(() => {
    return (chartWidth - padding.left - padding.right) / candleData.length * 0.8;
  }, [chartWidth, candleData.length]);

  const xScale = useMemo(() => {
    const domain = [0, candleData.length - 1];
    const range = [padding.left, chartWidth - padding.right];
    return (index) => {
      return ((index - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
    };
  }, [chartWidth, candleData.length]);

  const yScale = useMemo(() => {
    const prices = candleData.flatMap(candle => [candle.high, candle.low]);
    const domain = [Math.min(...prices), Math.max(...prices)];
    const range = [chartHeight - padding.bottom, padding.top];
    return (price) => {
      return ((price - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
    };
  }, [chartHeight, candleData]);

  const normalizedTradeStartIndex = tradeStartIndex - (currentIndex - candleData.length);

  const renderCandle = (candle, index) => {
    const x = xScale(index);
    const openY = yScale(candle.open);
    const closeY = yScale(candle.close);
    const highY = yScale(candle.high);
    const lowY = yScale(candle.low);

    const isActive = tradeStartIndex > 0 && index >= normalizedTradeStartIndex && index <= currentIndex;
    const isBullish = candle.close > candle.open;

    let fillColor, strokeColor;
    if (!isActive) {
      fillColor = isBullish ? 'rgba(0,128,0,1)' : 'rgba(255,0,0,1)';
      strokeColor = isBullish ? 'rgba(0,100,0,1)' : 'rgba(178,34,34,1)'; // Slightly darker
    } else {
      fillColor = isBullish ? 'rgba(0,255,0,1)' : 'rgba(255,105,180,1)'; // Light neon green and light pink
      strokeColor = isBullish ? 'rgba(50,205,50,1)' : 'rgba(255,0,127,1)'; // Darker green and pink
    }

    return (
      <g key={index}>
        <line
          x1={x + candleWidth / 2}
          y1={highY}
          x2={x + candleWidth / 2}
          y2={lowY}
          stroke={strokeColor}
          strokeWidth={2.24} // wicks (john wick ;)
        />
        <rect
          x={x}
          y={Math.min(openY, closeY)}
          width={candleWidth}
          height={Math.max(Math.abs(closeY - openY), 1)}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={0.5}
        />
      </g>
    );
  };

  const isProfit = currPrice != null && tradeStartPrice != null && 
    ((isLong && currPrice > tradeStartPrice) || (!isLong && currPrice < tradeStartPrice));
  const currentPriceColor = isProfit ? 'green' : 'red';

  const renderHorizontalLine = (value, color, label) => {
    if (value == null || isNaN(value)) return null;
    const y = yScale(value);
    if (isNaN(y)) return null;
    return (
      <g key={label}>
        <line
          x1={padding.left}
          y1={y}
          x2={chartWidth - padding.right}
          y2={y}
          stroke={color}
          strokeDasharray="5,5"
        />
        <text
          x={chartWidth - padding.right + 5}
          y={y}
          fill={color}
          dominantBaseline="middle"
          fontSize="10"
        >
          {label}
        </text>
      </g>
    );
  };

  const renderPulsatingDot = () => {
    if (currPrice == null || isNaN(currPrice)) return null;
    const x = xScale(candleData.length - 1);
    const y = yScale(currPrice);
    if (isNaN(y)) return null;
    return (
      <g>
        <circle
          cx={x}
          cy={y}
          r={6}
          fill="white"
        >
          <animate
            attributeName="r"
            values="3;5;3"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.8;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  };

  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    let ema = data[0].close;
    return data.map((candle) => {
      ema = candle.close * k + ema * (1 - k);
      return ema;
    });
  };

  const renderEMA = () => {
    if (candleData.length === 0) return null;
    const ema = calculateEMA(candleData, emaPeriod);
    const points = ema.map((value, index) => `${xScale(index)},${yScale(value)}`).join(' ');
    return (
      <polyline
        points={points}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={3}
      />
    );
  };

  console.log('poop', trailingStop)
  return (
    <View style={styles.container}>
      <svg width={chartWidth} height={chartHeight}>
        {candleData.map(renderCandle)}
        {emaPeriod && renderEMA()} 
        {currPrice != null && renderHorizontalLine(currPrice, currentPriceColor, `Current: ${currPrice.toFixed(2)}`)}
        {tradeStartIndex > 0 && tradeStartPrice != null && renderHorizontalLine(tradeStartPrice, 'gray', `Start: ${tradeStartPrice.toFixed(2)}`)}
        {takeProfit && renderHorizontalLine(takeProfit, '#2196F3', `TP: ${takeProfit.toFixed(2)}`)}
        {stopLoss && renderHorizontalLine(stopLoss, '#FF9800', `SL: ${stopLoss.toFixed(2)}`)}
        {trailingStop && renderHorizontalLine(trailingStop, 'rgba(255,153,221,1)', `TS: ${trailingStop.toFixed(2)}`)}
        {renderPulsatingDot()} 
      </svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    color: 'white',
    paddingHorizontal: 10,
    borderRadius: 5,
  }
});

export default CandlestickChart;
