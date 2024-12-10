import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThemeSelector from './ThemeSelector';


const themes = {
  default: {
    name: 'Default',
    dynamicColorFn: (candle) => {
      const isBullish = candle.close > candle.open;
      const priceChange = Math.abs((candle.close - candle.open) / candle.open);
      const intensity = Math.min(priceChange * 10, 1);
      return isBullish
        ? "#006F44" : "#C8102E"// ? `rgba(0,${Math.round(128 + 127 * intensity)},0,1)`
        // : `rgba(${Math.round(128 + 127 * intensity)},0,0,1)`;
    },
    strokeColor: 'rgba(255,255,255,0.5)',
  },

  rainbow: {
    name: 'Rainbow',
    dynamicColorFn: (candle) => {
      const isBullish = candle.close > candle.open;
      // const uniqueValue = candle.open *candle.high *candle.low *candle.close
      const uniqueValue = Math.random() * 100000;
      const hue = (uniqueValue * 20) % 360;
      const saturation = isBullish ? '100%' : '50%';
      const lightness = isBullish ? '50%' : '25%';
      return `hsl(${hue}, ${saturation}, ${lightness})`;
    },
    strokeColor: 'rgba(255,255,255,0.5)',
  },

  dynamic: {
    name: 'Dynamic',
    dynamicColorFn: (candle) => {
      const priceChange = ((candle.close - candle.open) / candle.open) * 100;
      const intensity = Math.min(Math.abs(priceChange) / 5, 1);
      const hue = priceChange > 0 ? 120 : 0; // Green for bullish, Red for bearish
      return `hsla(${hue}, 100%, ${240 * intensity}%, 1)`;
    },
    strokeColor: 'rgba(255,255,255,0.5)',
  },

  volatility: {
    name: 'Volatility',
    dynamicColorFn: (candle) => {
      const volatility = (candle.high - candle.low) / candle.open;
      const intensity = Math.min(volatility * 10, 1);
      const isBullish = candle.close > candle.open;
      const hue = isBullish ? 120 : 0; // Green for bullish, Red for bearish
      return `hsla(${hue}, 100%, ${20 + intensity * 220}%, 1)`;
    },
    strokeColor: 'rgba(255,255,255,0.5)',
  },

  volume: {
    name: 'Volume',
    dynamicColorFn: (candle, allCandles) => {
      const maxVolume = Math.max(...allCandles.map(c => c.volume));
      const volumeIntensity = candle.volume / maxVolume;
      const isBullish = candle.close > candle.open;
      const hue = isBullish ? 120 : 0; // Green for bullish, Red for bearish
      return `hsla(${hue}, 100%, ${30 * volumeIntensity}%, 1)`;
    },
    strokeColor: 'rgba(255,255,255,0.5)',
  },

    candleHarmony: {
      name: 'CandleHarmony',
        dynamicColorFn: (candle, allCandles, index) => {
          const isBullish = candle.close > candle.open;
          const bodySize = Math.abs(candle.close - candle.open);
          const wickSize = candle.high - candle.low;
          const prevCandle = allCandles[index - 1] || candle;
          const nextCandle = allCandles[index + 1] || candle;

          const avgBodySize = allCandles.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / allCandles.length;
          const relativeBodySize = bodySize / avgBodySize;
          const relativeWickSize = wickSize / bodySize;

          let candleType;
          let color;

          // Determine candle type and assign unique color for important patterns
          if (relativeBodySize > 2 && relativeWickSize < 0.5) {
            candleType = 'marubozu';
            color = '#772583'; // Indigo
          } else if (relativeBodySize < 0.1 && relativeWickSize > 2) {
            candleType = 'doji';
            color = '#FFD700'; // Gold
          } else if ((isBullish && candle.low < prevCandle.low && candle.high > prevCandle.high) ||
            (!isBullish && candle.high > prevCandle.high && candle.low < prevCandle.low)) {
            candleType = 'engulfing';
            color = '#FF1493'; // Deep Pink
          } else if (isBullish && candle.open <= prevCandle.low && candle.close >= prevCandle.high) {
            candleType = 'bullish_kicker';
            color = '#00FFFF'; // Cyan
          } else if (!isBullish && candle.open >= prevCandle.high && candle.close <= prevCandle.low) {
            candleType = 'bearish_kicker';
            color = '#3C1053'; // Dark Magenta
          } else if (isBullish && candle.low > prevCandle.high) {
            candleType = 'bullish_gap_up';
            color = '#FF671F'; // Orange
          } else if (!isBullish && candle.high < prevCandle.low) {
            candleType = 'bearish_gap_down';
            color = '#8B4513'; // Saddle Brown
          } else if (isBullish && candle.open === prevCandle.low && candle.close === candle.high && relativeWickSize > 2) {
            candleType = 'hammer';
            color = '#32CD32'; // Lime Green
          } else if (!isBullish && candle.open === prevCandle.high && candle.close === candle.low && relativeWickSize > 2) {
            candleType = 'hanging_man';
            color = '#F5E1A4'; // Crimson
          } else if (isBullish && candle.close > prevCandle.high && nextCandle.open > candle.close && nextCandle.close < candle.open) {
            candleType = 'morning_star';
            color = '#1E90FF'; // Dodger Blue
          } else if (!isBullish && candle.close < prevCandle.low && nextCandle.open < candle.close && nextCandle.close > candle.open) {
            candleType = 'evening_star';
            color = '#FF69B4'; // Hot Pink
          } else if (isBullish && candle.open < prevCandle.low && candle.close > (prevCandle.open + prevCandle.close) / 2) {
            candleType = 'piercing_line';
            color = '#00FA9A'; // Medium Spring Green
          } else if (!isBullish && candle.open > prevCandle.high && candle.close < (prevCandle.open + prevCandle.close) / 2) {
            candleType = 'dark_cloud_cover';
            color = '#D14124'; // Orange Red
          } else if (isBullish && candle.low === prevCandle.low && candle.high > prevCandle.high) {
            candleType = 'tweezer_bottom';
            color = '#20B2AA'; // Light Sea Green
          } else if (!isBullish && candle.high === prevCandle.high && candle.low < prevCandle.low) {
            candleType = 'tweezer_top';
            color = '#DDA0DD'; // Plum
          } else {
            candleType = 'normal';
            color = isBullish ? '#006F44' : '#C8102E'; // Light Green / Light Coral for normal candles
          }

          return color;
        },
          strokeColor: 'rgba(255,255,255,0.7)', // White stroke for all candles
  },

  malibuSurf: {
    name: 'Malibu Surf',
    dynamicColorFn: (candle) => {
      const isBullish = candle.close > candle.open;
      return isBullish ? '#0077be' : '#e6f2ff'; // Deep ocean blue for bullish, super light blue for bearish
    },
    strokeColor: 'rgba(255,255,255,0.7)',
  },

  creamsicle: {
    name: 'Creamsicle',
    dynamicColorFn: (candle) => {
      const isBullish = candle.close > candle.open;
      return isBullish ? '#ff7f00' : '#fff5e6'; // Orange for bullish, creamy off-white for bearish
    },
    strokeColor: 'rgba(0,0,0,0.3)',
  },

  canadaStyle: {
    name: 'Canada Style',
    dynamicColorFn: (candle) => {
      const isBullish = candle.close > candle.open;
      return isBullish ? '#ffffff' :  '#ff0000'; // White for bullish, red for bearish
    },
    strokeColor: 'rgba(0,0,0,0.5)',
  },

  neonDreams: {
    name: 'Neon Dreams',
    dynamicColorFn: (candle) => {
      const isBullish = candle.close > candle.open;
      return isBullish ? '#39ff14' : '#ff00ff'; // Neon green for bullish, neon pink for bearish
    },
    strokeColor: 'rgba(0,0,0,0.7)',
  },

  retroWave: {
    name: 'RetroWave',
    dynamicColorFn: (candle) => {
      const isBullish = candle.close > candle.open;
      return isBullish ?  '#41c5ff': '#fd3777' ; // Hot pink for bullish, bright cyan for bearish
    },
    strokeColor: 'rgba(255,255,255,0.5)',
  },

  forestMist: {
    name: 'Forest Mist',
    dynamicColorFn: (candle) => {
      const isBullish = candle.close > candle.open;
      return isBullish ? '#2ecc71' : '#95a5a6'; // Emerald green for bullish, misty gray for bearish
    },
    strokeColor: 'rgba(255,255,255,0.6)',
  },

  goldenSunset: {
    name: 'Golden Sunset',
    dynamicColorFn: (candle) => {
      const isBullish = candle.close > candle.open;
      return isBullish ? '#ff9500' : '#4a0e4e'; // Bright orange for bullish, deep purple for bearish
    },
    strokeColor: 'rgba(255,255,255,0.5)',
  }
};


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
  initialTheme = 'candleHarmony',
}) => {
  const chartWidth = width;
  const chartHeight = height;
  const padding = { top: 10, right: 35, bottom: 20, left: 40 };
    const [theme, setTheme] = useState(initialTheme);

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
}, [chartWidth, candleData.length, padding.left, padding.right]);

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

const renderCandle = (candle, index, allCandles, useSplitStyle = true, splitRatio = 0.25) => {
  const x = xScale(index);
  const openY = yScale(useBBCandles ? candle.bbOpen : candle.open);
  const closeY = yScale(useBBCandles ? candle.bbClose : candle.close);
  const highY = yScale(useBBCandles ? candle.bbHigh : candle.high);
  const lowY = yScale(useBBCandles ? candle.bbLow : candle.low);

  const isActive = tradeStartIndex > 0 && index >= normalizedTradeStartIndex && index <= currentIndex;
  const isBullish = candle.close > candle.open;

  const themeColors = themes[theme] || themes.default;
  let fillColor, strokeColor;

  if (themeColors.dynamicColorFn) {
    fillColor = themeColors.dynamicColorFn(candle, allCandles, index);
    strokeColor = themeColors.strokeColor;
  } else {
    fillColor = isBullish ? themeColors.bullishFill : themeColors.bearishFill;
    strokeColor = isBullish ? (themeColors.bullishStroke || fillColor) : (themeColors.bearishStroke || fillColor);
  }

  const candleHeight = Math.max(Math.abs(closeY - openY), 1);

  return (
    <g key={index}>
      <line
        x1={x + candleWidth / 2}
        y1={highY}
        x2={x + candleWidth / 2}
        y2={lowY}
        stroke="white"  // Force wick color to be white
        strokeWidth={1}
      />
      <rect
        x={x}
        y={Math.min(openY, closeY)}
        width={candleWidth}
        height={candleHeight}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={0.5}
      />
    </g>
  );
};



  const renderGradientDefs = () => {
    const themeColors = themes[theme] || themes.default;
    
    if (!themeColors.gradientFn) return null;

    return (
      <defs>
        {candleData.map((candle, index) => {
          const isBullish = candle.close > candle.open;
          const gradientColors = themeColors.gradientFn(isBullish, candle, index);

          if (!gradientColors || !gradientColors.bullish || !gradientColors.bearish) {
            console.warn(`Gradient colors not defined for candle at index ${index}`);
            return null;
          }

          const gradientId = `gradient-${theme}-${index}-${isBullish ? 'bullish' : 'bearish'}`;

          return (
            <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              {gradientColors[isBullish ? 'bullish' : 'bearish'].map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
              ))}
            </linearGradient>
          );
        })}
      </defs>
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
        <polyline points={upperPoints} fill="none" stroke="rgba(255,0,0,0.5)" strokeWidth={1} />
        <polyline points={middlePoints} fill="none" stroke="rgba(0,255,0,0.5)" strokeWidth={1} />
        <polyline points={lowerPoints} fill="none" stroke="rgba(0,0,255,0.5)" strokeWidth={1} />
      </>
    );
  };

  const renderEMA = () => {
    if (!emaPeriod || !candleData.length) return null;
    let emaValues = calculateEMA(candleData, emaPeriod);
    let pointsString = emaValues.map((value, index) =>
      `${xScale(index)},${yScale(value)}`
    ).join(' ');

    return (
      <polyline points={pointsString} fill="none" stroke="#FF6E4A" strokeWidth={4} />
    );
  };


  const _calculateEMA = (data, emaPeriod) => {
    let k = 2 / (emaPeriod + 1);
    let ema = [];

    if (data.length > 0) {
      ema[0] = data[0].close;

      for (let i = 1; i < data.length; i++) {
        if (i < emaPeriod) {
          ema[i] = (data[i].close + (ema[i - 1] * (i - 1))) / i;
        } else {
          let newEma = (data[i].close * k) + (ema[i - 1] * (1 - k));
          ema.push(newEma);
        }
      }
    }

    return ema;
  };
const _calculateHMA = (data, period) => {
    // Helper function to calculate Weighted Moving Average (WMA)
    const calculateWMA = (values, period) => {
        if (values.length < period) return null;
        const weight = period * (period + 1) / 2;
        return values
            .slice(0, period)
            .reduce((sum, value, i) => sum + value * (period - i), 0) / weight;
    };

    // Calculate HMA
    let hma = Array(data.length).fill(null);
    if (data.length >= period) {
        const closes = data.map(d => d.close);
        const halfPeriod = Math.floor(period / 2);
        const sqrtPeriod = Math.round(Math.sqrt(period));

        for (let i = period - 1; i < data.length; i++) {
            // Calculate WMA with period 'period'
            const wma1 = calculateWMA(
                closes.slice(i - period + 1, i + 1),
                period
            );

            // Calculate WMA with period 'period/2'
            const wma2 = calculateWMA(
                closes.slice(i - halfPeriod + 1, i + 1),
                halfPeriod
            );

            if (wma1 === null || wma2 === null) continue;

            // Calculate 2 * WMA(n/2) - WMA(n)
            const rawHMA = 2 * wma2 - wma1;

            // Calculate WMA of rawHma with period sqrt(n)
            if (i >= period + sqrtPeriod - 2) {
                const rawHMASlice = [];
                for (let j = 0; j < sqrtPeriod; j++) {
                    const sliceI = i - j;
                    const tempWMA1 = calculateWMA(
                        closes.slice(sliceI - period + 1, sliceI + 1),
                        period
                    );
                    const tempWMA2 = calculateWMA(
                        closes.slice(sliceI - halfPeriod + 1, sliceI + 1),
                        halfPeriod
                    );
                    if (tempWMA1 !== null && tempWMA2 !== null) {
                        rawHMASlice.push(2 * tempWMA2 - tempWMA1);
                    }
                }
                if (rawHMASlice.length === sqrtPeriod) {
                    hma[i] = calculateWMA(rawHMASlice.reverse(), sqrtPeriod);
                }
            }
        }
    }

    return hma;
};



  const calculateEMA = _calculateEMA

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
          strokeDasharray="5,5"
          strokeWidth={1.5}
        />
        <text
          x={chartWidth - padding.right + 5}
          y={yPosition}
          fill={color}
          dominantBaseline="middle"
          fontSize="12"
          fontWeight="bold"
        >
          {label}
        </text>
      </g>
    );
  };

  const isProfit = currPrice != null && tradeStartPrice != null &&
                 ((isLong && currPrice > tradeStartPrice) || (!isLong && currPrice < tradeStartPrice));

  let currentPriceColor = isProfit ? 'limegreen' : 'crimson';

  return (
    <View style={styles.container}>
      <ThemeSelector
        currentTheme={theme}
        themes={themes}
        onThemeChange={setTheme}
      />
      <svg width={chartWidth} height={chartHeight}>
        {renderGradientDefs()}
        {renderBollingerBands()}
        {candleData.map((candle, index) => renderCandle(candle, index, candleData))}
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
    backgroundColor: "#100C08",
    paddingTop: 25,
    paddingRight: 25,
  },
});

export default CandlestickChart;