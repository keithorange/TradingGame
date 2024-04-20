import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CandlestickChart, LineChart } from 'react-native-wagmi-charts';


const CandlestickChartComponent = ({ ohlc, tradeStartIndex, currentIndex, currPrice, tradeStartPrice, onPressChartFn, takeProfit, stopLoss, trailingStop }) => {


  const lineData = ohlc.map(entry => ({
    timestamp: entry.timestamp,
    value: entry.close
  }));


  var tradeDuration = 0;
  if (currentIndex > 0 && tradeStartIndex > 0) {
    tradeDuration = currentIndex - tradeStartIndex;
  }

  const normalizedLastIndex = lineData.length - 1
  const normalizedTradeStartIndex = normalizedLastIndex - tradeDuration;


  const roi = ((currPrice - tradeStartPrice) / tradeStartPrice) * 100.0;


  console.log('ccc', 'takeprofit', takeProfit, 'stoploss', stopLoss, 'trailingstop', trailingStop, 'tradeStartIndex', tradeStartIndex, 'currentIndex', currentIndex, 'tradeDuration', tradeDuration, 'roi', roi, 'currPrice', currPrice, 'tradeStartPrice', tradeStartPrice, 'normalizedLastIndex', normalizedLastIndex, 'normalizedTradeStartIndex', normalizedTradeStartIndex)

  return (
    <View style={styles.container}>

      {ohlc.length && (
        <CandlestickChart.Provider data={ohlc}>
          <CandlestickChart height={300} style={styles.chart}>
            <CandlestickChart.Candles />
            <CandlestickChart.Crosshair
              color={"rgba(250,99,2,0)"}
              onCurrentXChange={(xValue) => {
                console.log('CCC onCurrentXChange value', xValue);
                onPressChartFn(xValue);
            }}>
              {/* <CandlestickChart.Tooltip /> */}
            </CandlestickChart.Crosshair>
            
          </CandlestickChart>
          {/* <CandlestickChart.PriceText type="open" />
          <CandlestickChart.PriceText type="high" />
          <CandlestickChart.PriceText type="low" />
          <CandlestickChart.PriceText type="close" />
          <CandlestickChart.DatetimeText /> */}
        </CandlestickChart.Provider>
      )}

        {lineData.length > 0 && (
        <LineChart.Provider data={lineData}>
          <LineChart height={300} style={styles.overlayChart}>
            <LineChart.Path color="rgba(240,240,240,0.1)">
              {/* Dots for path */}
              <LineChart.Dot color="orange" at={normalizedLastIndex} hasPulse pulseBehaviour={"always"} />
              {/* Highlight path */}
              <LineChart.Highlight color="rgba(250,99,2,1)" from={normalizedTradeStartIndex} to={normalizedLastIndex} />
              {/* Horiz lines for buy/sell */}
              {tradeDuration > 0 && (
                <LineChart.HorizontalLine at={{ value: currPrice }}
                  color={roi > 0 ? 'green' : 'red'} />
              )}
              {tradeDuration > 0 && (
                <LineChart.HorizontalLine at={{ value: tradeStartPrice }} color={'gray'} />
              )}

              {/* Take Profit and Stop Loss */}
              {takeProfit && (
                <LineChart.HorizontalLine
                  at={{ value: takeProfit }}
                  color="green"  // Color for Take Profit
                  label={`TP: ${takeProfit}`}
                />
              )}
              {stopLoss && (
                <LineChart.HorizontalLine
                  at={{ value: stopLoss }}
                  color="red"  // Color for Stop Loss
                  label={`SL: ${stopLoss}`}
                />
              )}

              {/* Trailing Stop */}
              {trailingStop && (
                <LineChart.HorizontalLine
                  at={{ value: trailingStop }}
                  color="blue"  // Color for Trailing Stop
                  label={`TS: ${trailingStop}`}
                />
              )}

            </LineChart.Path>
          </LineChart>
        </LineChart.Provider>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    width: '100%',
    maxHeight: 300,
    borderWidth: 2,
    position: 'relative',
    marginRight: 20,
    //padding: 20,
  },
  chart: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayChart: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none', // Allow touches to pass through
  }
});

export default CandlestickChartComponent;
