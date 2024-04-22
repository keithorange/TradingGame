


import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CandlestickChart, LineChart } from 'react-native-wagmi-charts';


const CandlestickChartComponent = ({ ohlc, tradeStartIndex, currentIndex, currPrice, tradeStartPrice, onPressChartFn, takeProfit, stopLoss, trailingStop,
height, width
}) => {


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

  const isWeb = Platform.OS === 'web'


  return (
    <View style={styles.container}>

      <View style={styles.chart}>

        
        {ohlc.length && (
          <CandlestickChart.Provider data={ohlc}>
            <CandlestickChart height={height} width={width}>
              <CandlestickChart.Candles useAnimations={false} />  {/* Disable animations */}
              <CandlestickChart.Crosshair
                color={"rgba(250,99,2,0)"}
                onCurrentXChange={onPressChartFn}>
              </CandlestickChart.Crosshair>
              
            </CandlestickChart>
            {/* <CandlestickChart.PriceText type="open" />
            <CandlestickChart.PriceText type="high" />
            <CandlestickChart.PriceText type="low" />
            <CandlestickChart.PriceText type="close" />
            <CandlestickChart.DatetimeText /> */}
          </CandlestickChart.Provider>
        )}
      </View>

      <View style={styles.overlayChart}>
        {lineData.length > 0 && (
        <LineChart.Provider data={lineData}>
          <LineChart yGutter={0} height={height} width={width} >
            <LineChart.Path color="transparent" pathProps={{
              isTransitionEnabled: false,
              yGutter: 0,
              animateOnMount: false,
              animationDuration: 0.001,

              //curve: d3Shape.curveNatural
            }}>
              {/* Dots for path */}
              <LineChart.Dot color="orange" at={normalizedLastIndex} hasPulse pulseBehaviour={"always"} />
              {/* Highlight path */}
              <LineChart.Highlight color="rgb(240,240,240,0.4)" from={normalizedTradeStartIndex} to={normalizedLastIndex} />
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
                  color="#2196F3"  // Color for Take Profit
                  label={`TP: ${takeProfit}`}
                />
              )}
              {stopLoss && (
                <LineChart.HorizontalLine
                  at={{ value: stopLoss }}
                  color="#FF9800"  // Color for Stop Loss
                  label={`SL: ${stopLoss}`}
                />
              )}

              {/* Trailing Stop */}
              {trailingStop && (
                <LineChart.HorizontalLine
                  at={{ value: trailingStop }}
                  color="#9C27B0"  // Color for Trailing Stop
                  label={`TS: ${trailingStop}`}
                />
              )}

            </LineChart.Path>
          </LineChart>
        </LineChart.Provider>
        )}
        </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
