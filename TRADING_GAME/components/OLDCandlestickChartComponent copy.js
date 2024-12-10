import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

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
  useBBCandles,
}) => {
  const chartWidth = width;
  const chartHeight = height;
  const padding = { top: 10, right: 10, bottom: 20, left: 40 };

  const calculateHeikinAshi = (data) => {
    if (!data || data.length === 0) return [];
    const haData = [];
    let previousHA = { open: data[0].open, close: data[0].close };
    data.forEach((candle) => {
      const haClose = (candle.open + candle.high + candle.low + candle.close) / 4;
      const haOpen = (previousHA.open + previousHA.close) / 2;
      const haHigh = Math.max(candle.high, haOpen, haClose);
      const haLow = Math.min(candle.low, haOpen, haClose);
      haData.push({ open: haOpen, high: haHigh, low: haLow, close: haClose });
      previousHA = { open: haOpen, close: haClose };
    });
    return haData;
  };

  const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
    const closes = data.map(d => d.close);
    
    const sma = closes.map((_, i, arr) => 
      arr.slice(Math.max(0, i - period + 1), i + 1)
        .reduce((sum, val) => sum + val, 0) / Math.min(i + 1, period)
    );

    const stdDevs = closes.map((_, i, arr) => {
      const slice = arr.slice(Math.max(0, i - period + 1), i + 1);
      const mean = sma[i];
      const squareDiffs = slice.map(val => Math.pow(val - mean, 2));
      return Math.sqrt(squareDiffs.reduce((sum, diff) => sum + diff, 0) / slice.length);
    });

    const upperBand = sma.map((smaValue, i) => smaValue + stdDev * stdDevs[i]);
    const lowerBand = sma.map((smaValue, i) => smaValue - stdDev * stdDevs[i]);

    return data.map((candle, i) => ({
      ...candle,
      sma: sma[i],
      upperBand: upperBand[i],
      lowerBand: lowerBand[i],
      bbOpen: (candle.open - lowerBand[i]) / (upperBand[i] - lowerBand[i]),
      bbHigh: (candle.high - lowerBand[i]) / (upperBand[i] - lowerBand[i]),
      bbLow: (candle.low - lowerBand[i]) / (upperBand[i] - lowerBand[i]),
      bbClose: (candle.close - lowerBand[i]) / (upperBand[i] - lowerBand[i]),
    }));
  };

  const candleData = useMemo(() => {
    if (useHeikinAshi) {
      return calculateHeikinAshi(ohlc);
    } else if (useBBCandles) {
      return calculateBollingerBands(ohlc);
    }
    return ohlc;
  }, [ohlc, useHeikinAshi, useBBCandles]);

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
    if (useBBCandles) {
      return (value) => {
        return chartHeight - ((value * (chartHeight - padding.top - padding.bottom)) + padding.bottom);
      };
    } else {
      const prices = candleData.flatMap(candle => [candle.high, candle.low]);
      const domain = [Math.min(...prices), Math.max(...prices)];
      const range = [chartHeight - padding.bottom, padding.top];
      return (price) => {
        return ((price - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
      };
    }
  }, [chartHeight, candleData, useBBCandles]);

  const normalizedTradeStartIndex = tradeStartIndex - (currentIndex - candleData.length);

  const renderCandle = (candle, index) => {
    const x = xScale(index);
    const openY = yScale(useBBCandles ? candle.bbOpen : candle.open);
    const closeY = yScale(useBBCandles ? candle.bbClose : candle.close);
    const highY = yScale(useBBCandles ? candle.bbHigh : candle.high);
    const lowY = yScale(useBBCandles ? candle.bbLow : candle.low);

    const isActive = tradeStartIndex > 0 && index >= normalizedTradeStartIndex && index <= currentIndex;
    const isBullish = candle.close > candle.open;

    let fillColor;
    let strokeColor;

    if (!isActive) {
      fillColor = isBullish ? 'rgba(0,128,0,1)' : 'rgba(255,0,0,1)';
      strokeColor = isBullish ? 'rgba(0,100,0,1)' : 'rgba(178,34,34,1)';
    } else {
      fillColor = isBullish ? 'rgba(0,255,0,1)' : 'rgba(255,105,180,1)';
      strokeColor = isBullish ? 'rgba(50,205,50,1)' : 'rgba(255,0,127,1)';
    }

    return (
      <g key={index}>
        <line
          x1={x + candleWidth / 2}
          y1={highY}
          x2={x + candleWidth / 2}
          y2={lowY}
          stroke={strokeColor}
          strokeWidth={2.24}
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

  const renderHorizontalLine = (value, color, label) => {
    if (value == null || isNaN(value)) return null;
    const yValue = useBBCandles
      ? (value - candleData[candleData.length - 1].lowerBand) /
        (candleData[candleData.length - 1].upperBand - candleData[candleData.length - 1].lowerBand)
      : value;

    const yPosition = yScale(yValue);

    if (isNaN(yPosition)) return null;

    return (
      <g key={label}>
        <line
          x1={padding.left}
          y1={yPosition}
          x2={chartWidth - padding.right}
          y2={yPosition}
          stroke={color}
          strokeDasharray="5"
        />
        <text
          x={chartWidth - padding.right + 5}
          y={yPosition}
          fill={color}
          dominantBaseline="middle"
          fontSize="10"
        >
          {label}
        </text>
      </g>
    );
  };

  const renderBollingerBands = () => {
    if (!useBBCandles || candleData.length === 0) return null;

    const upperPoints = candleData.map((_, index) =>
      `${xScale(index)},${yScale(1)}`
    ).join(' ');

    const middlePoints = candleData.map((_, index) =>
      `${xScale(index)},${yScale(0.5)}`
    ).join(' ');

    const lowerPoints = candleData.map((_, index) =>
      `${xScale(index)},${yScale(0)}`
    ).join(' ');

    return (
      <>
        <polyline points={upperPoints} fill="none" stroke="rgba(255,0,0,.5)" strokeWidth={1} />
        <polyline points={middlePoints} fill="none" stroke="rgba(0,.5,.5,.5)" strokeWidth={1} />
        <polyline points={lowerPoints} fill="none" stroke="rgba(255,.5,.5,.5)" strokeWidth={1} />
      </>
    );
  };

const renderEMA = () => {
    // Ensure we have enough data to calculate EMA
    if (!emaPeriod || !candleData.length) return null;

    // Calculate EMA using all candle data and pass emaPeriod
    let emaValues = calculateEMA(candleData, emaPeriod);
    
    // Create points for rendering the EMA line
    let pointsString = emaValues.map((value, index) =>
      `${xScale(index)},${yScale(value)}`
    ).join(' ');

    return (
<polyline points={pointsString} fill="none" stroke="rgba(255, 255, 255, 0.69)" strokeWidth={2} />
    );
};

const calculateEMA = (data, emaPeriod) => {
    let k = 2 / (emaPeriod + 1);
    let ema = [];

    // Initialize EMA with first value
    if (data.length > 0) {
        ema[0] = data[0].close; // Start with the first closing price

        // Calculate subsequent EMA values
        for (let i = 1; i < data.length; i++) {
            if (i < emaPeriod) {
                // For the initial period, just carry forward the previous value
                ema[i] = (data[i].close + (ema[i - 1] * (i - 1))) / i;
            } else {
                // Calculate EMA using the formula
                let newEma = (data[i].close * k) + (ema[i - 1] * (1 - k));
                ema.push(newEma);
            }
        }
    }

    return ema;
};


  const renderPulsatingDot = () => {
    if (currPrice == null || isNaN(currPrice)) return null;

    let x = xScale(candleData.length - 1);
    let y = yScale(useBBCandles
      ? (currPrice - candleData[candleData.length - 1].lowerBand) /
        (candleData[candleData.length - 1].upperBand - candleData[candleData.length - 1].lowerBand)
      : currPrice
    );

    if (isNaN(y)) return null;

    return (
      <g>
        <circle cx={x} cy={y} r="6" fill="white">
          <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.8;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  }

  const isProfit = currPrice != null && tradeStartPrice != null &&
                 ((isLong && currPrice > tradeStartPrice) || (!isLong && currPrice < tradeStartPrice));

  let currentPriceColor = isProfit ? 'green' : 'red';

  return (
    <View style={styles.container}>
      <svg width={chartWidth} height={chartHeight}>
        {renderBollingerBands()}
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
    backgroundColor: 'black',
    paddingTop: 25,
  },
});

export default CandlestickChart;