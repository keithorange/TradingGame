


import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { CandlestickChart, LineChart } from 'react-native-wagmi-charts';


const CandlestickChartComponent = ({ ohlc, tradeStartIndex, currentIndex, currPrice, tradeStartPrice, onPressChartFn, takeProfit, stopLoss, trailingStop,
  height, width,
hideLinePath= false
}) => {

  console.log('IN (CandlestickChartComponent)', 'ohlc', ohlc )


  const lineData = ohlc.map(entry => ({
    timestamp: entry.timestamp,
    value: entry.close
  }));


  var tradeDuration = 0;
  if (currentIndex > 0 && tradeStartIndex > 0) {
    tradeDuration = currentIndex - tradeStartIndex;
  }



  const roi = ((currPrice - tradeStartPrice) / tradeStartPrice) * 100.0;

  const isWeb = Platform.OS === 'web'



  const normalizedTradeStartIndex = tradeStartIndex - (currentIndex - ohlc.length);
  
const activePathOhlc = ohlc.map((entry, index) => {
  const mean = (entry.open + entry.high + entry.low + entry.close) / 4;

  
  // Function to create a flattened candlestick
  const flatCandle = {
    ...entry,
    open: mean,
    high: mean,
    low: mean,
    close: mean,
  };

  // Flatten the candles before the trade starts or when there's no active trade
  if (index < normalizedTradeStartIndex-1 || !tradeStartIndex) {
    return   flatCandle 
  }

  // Return normal candles after the trade has started
  return entry;
});


  // Mapping function to either return normal candles or flattened candles based on the index
  const processedOhlc = ohlc.map((entry, index) => {

    // Calculate the mean of the candlestick values
    const mean = (entry.open + entry.high + entry.low + entry.close) / 4;

    // Function to create a flattened candlestick
    const flatCandle = {
      ...entry,
      open: mean,
      high: mean,
      low: mean,
      close: mean,
    };


    // Flatten the candles past the currentIndex
    if ((tradeDuration > 0 )&&(index > normalizedTradeStartIndex)) {
      return flatCandle;
    }

    // Return normal candlestick data for those before or at the currentIndex
    return entry;
  });


  return (
    <View style={styles.container}>

      <View style={styles.chart}>

        {/* Bottom red greren candlestick chart */}

          {/* shift ohlc 1 tp left */}
          <CandlestickChart.Provider data={processedOhlc}>
            <CandlestickChart height={height} width={width}>
              <CandlestickChart.Candles useAnimations={false} />  {/* Disable animations */}
              {/* <CandlestickChart.Crosshair
                color={"rgba(250,99,2,0)"}
                onCurrentXChange={onPressChartFn}>
              </CandlestickChart.Crosshair>
               */}
            </CandlestickChart>
            {/* <CandlestickChart.PriceText type="open" />
            <CandlestickChart.PriceText type="high" />
            <CandlestickChart.PriceText type="low" />
            <CandlestickChart.PriceText type="close" />
            <CandlestickChart.DatetimeText /> */}
          </CandlestickChart.Provider>

      </View>


     <View style={styles.chart}>
      <CandlestickChart.Provider data={activePathOhlc}>
        <CandlestickChart height={height} width={width}>
          <CandlestickChart.Candles useAnimations={false} positiveColor={"rgba(0,255,0,1)"} negativeColor={"#ffb2d0"} /> 
          {/* <CandlestickChart.Crosshair
            color={"rgba(250,99,2,0)"}
            onCurrentXChange={onPressChartFn}>
          </CandlestickChart.Crosshair> */}
          
        </CandlestickChart>
        
      </CandlestickChart.Provider>
      </View > 
    

      {/* ON TOP linegraph with lines (kinda glitchy) */}
      <View style={styles.overlayChart}>
        {lineData.length > 0 && (
        <LineChart.Provider data={lineData}>
            <LineChart //yGutter={0} 
              height={height} width={width} >
              
              <LineChart.Path color="transparent" pathProps={{
              isTransitionEnabled: false,
              yGutter: 0,
              animateOnMount: false,
              animationDuration: 0,

              //curve: d3Shape.curveNatural
            }}>



                            {/* Curr place dot */}
              <LineChart.Dot color="orange" at={lineData.length-1}
                hasPulse pulseBehaviour={"always"} />
{/* 

              <LineChart.Highlight color="orange" to={lineData.length - 1} from={(lineData.length - 1) - tradeDuration} /> */}



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
                  color="rgba(255,153,221,1)"  // Color for Trailing Stop
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
