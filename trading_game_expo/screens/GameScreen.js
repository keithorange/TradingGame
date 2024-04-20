import React, { useState, useEffect } from 'react';
import { Image, View, Text, Button, StyleSheet, PanResponder } from 'react-native';
import Slider from '@react-native-community/slider';
import CandlestickChartComponent from '../components/CandlestickChartComponent';
import NotificationBanner from '../components/NotificationBanner';  // Make sure this path is correct
import StockInfoComponent from '../components/StockInfoComponent';  // Make sure this path is correct
import GameModeSelectorComponent from '../components/GameModeSelectorComponent';  // Make sure this path is correct

import ohlcvDataSets from '../price_data/OhlcvDataSets';  // Adjust the path as needed
import { useRef } from 'react';

import { Audio } from 'expo-av'; // Ensure this is correctly imported

const MAX_CANDLES = 120;

const GameScreen = ({ route }) => {  
  const [selectedMode, setSelectedMode] = useState('longshort');
  const [selectedStock, setSelectedStock] = useState('AAPL');

  const [chartData, setChartData] = useState([]);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);  // Control the display index for the chart
  const [tradeStartIndex, setTradeStartIndex] = useState(null);  // Track where the trade starts



  const [message, setMessage] = useState(''); // notification banner

  const [position, setPosition] = useState(null); // Store current position 
  const [trades, setTrades] = useState([]); // store historical trades (closed positions)
  
  const [sound, setSound] = useState();
  
  const [totalROI, setTotalROI] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  // for longshort game mode
  const [sliderValue, setSliderValue] = useState(18);  // Default value for the slider

  // for tpsl game mode
  const [takeProfit, setTakeProfit] = useState(null);
  const [stopLoss, setStopLoss] = useState(null);
  const [tpslMode, setTpslMode] = useState('tp');  // adding tp or sl [take profit or stop loss]

  // for trailing game mode
  const [trailingStop, setTrailingStop] = useState(null);
  const [dragState, setDragState] = useState(null);



  function getCurrentPrice() {
    return chartData[currentChartIndex].close;
  }


  const gameModeConfigs = {
    longshort: {
      actions: ['Long', 'Short'],
      component: () => (
        <View>
          <Text>Long/Short Game Mode</Text>
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={6}
            maximumValue={60}
            step={1}
            value={sliderValue}
            onValueChange={(value) => setSliderValue(value)}
            minimumTrackTintColor="#307ecc"
            maximumTrackTintColor="#000000"
          />
          <Text>Skip Candles: {sliderValue}</Text>


          <View style={styles.controls}>
            <Button title="Long" onPress={() => executeTrade('Long')} disabled={!!position} style={{ color: 'green', backgroundColor: 'green' }} />
            <Button title="Short" onPress={() => executeTrade('Short')} disabled={!!position} style={{ color: 'red', backgroundColor: 'red' }} />
          </View>
        </View>
      ),
      processTrade: handleLongShortTrade,
      onPressChart: (xValue) => { }
    },
    tpsl: {
      actions: ['Set Take Profit', 'Set Stop Loss'],
      component: () => (
        <View style={styles.controls}>
          {/* <Button title="Add Take Profit" onPress={() => {
        setTpslMode('tp')
        setMessage('Drag 🤞🏼 line')
      }
      } />
      <Button title="Add Stop Loss" onPress={() => {
        setTpslMode('sl')
        setMessage('Drag 🤞🏼 line')
      }
      } /> */}

      

          <Button title="Add Take Profit" onPress={() => {
            setTpslMode('tp');
            setTakeProfit(getCurrentPrice());  // Initialize TP at current price
            setMessage("Drag to adjust Take Profit");
          }} />

          <Button title="Add Stop Loss" onPress={() => {
            setTpslMode('sl');
            setStopLoss(getCurrentPrice());  // Initialize SL at current price
            setMessage("Drag to adjust Stop Loss");
          }} />

        </View>
      ),
      onPressChart: (xValue) => {
        // make xValue integet 
        const xValueInt = parseInt(xValue);
        //console.log('float xValue', xValue, 'int xValue', xValueInt, )

        // get price from xValue
        //console.log('xValue', xValue, 'lenChart', chartData.length, 'currentChartIdex', currentChartIndex);
        const priceValue = chartData[xValueInt].close;

        console.log(xValue, priceValue, tpslMode)

        if (tpslMode == 'tp') {
          setTakeProfit(priceValue);
          console.log('Take Profit Set At:', priceValue);

          setTpslMode(null); // Reset mode after setting


        } else if (tpslMode == 'sl') {
          setStopLoss(priceValue);
          console.log('Stop Loss Set At:', priceValue);
          setTpslMode(null); // Reset mode after setting

        } else {
          console.log('No TPSL mode set', priceValue); // Log if no mode is set
        }
      }

    },
    trailing: {
      actions: ['Set Trailing Stop'],
      component: () => (
        <View style={styles.controls}>
          <Button title="Set Trailing Stop" onPress={() => {
            setSelectedMode('trailing');
            setTrailingStop(getCurrentPrice());  // Initialize at current price
            setMessage("Drag to adjust Trailing Stop");
          }} />
        </View>
      ),
      onPressChart: (xValue) => {
        // make xValue integet 
        const xValueInt = parseInt(xValue);
        //console.log('float xValue', xValue, 'int xValue', xValueInt, )
      
        // get price from xValue
        //console.log('xValue', xValue, 'lenChart', chartData.length, 'currentChartIdex', currentChartIndex);
        const priceValue = chartData[xValueInt].close;
        console.log('Trailing: Set Stop', priceValue);

        console.log(xValue, priceValue, tpslMode)
        if (trailingStop === null) {
          setTrailingStop(xValue);
          setMessage('Drag 🤞🏼 line');
        }
      }
    }
  };
  
  const panResponder = useRef(PanResponder.create({
  onStartShouldSetPanResponder: () => true,
  onPanResponderMove: (evt, gestureState) => {
    // Calculate the new price based on the drag
    const priceAdjustment = gestureState.dy * -0.01;  // Negative to invert the drag direction

    if (selectedMode === 'trailing' && trailingStop !== null) {
      setTrailingStop(prev => Math.max(0, prev + priceAdjustment)); // Update trailing stop
    } else if (tpslMode === 'tp' && takeProfit !== null) {
      setTakeProfit(prev => Math.max(0, prev + priceAdjustment));  // Update take profit
    } else if (tpslMode === 'sl' && stopLoss !== null) {
      setStopLoss(prev => Math.max(0, prev + priceAdjustment));  // Update stop loss
    }
  },
  onPanResponderRelease: () => {
    if (selectedMode === 'trailing') {
      setMessage(`Trailing Stop adjusted to ${trailingStop.toFixed(2)}`);
    } else if (tpslMode === 'tp') {
      setMessage(`Take Profit adjusted to ${takeProfit.toFixed(2)}`);
    } else if (tpslMode === 'sl') {
      setMessage(`Stop Loss adjusted to ${stopLoss.toFixed(2)}`);
    }
    // Reset drag state
    setDragState(null);
  }
})).current;



  console.log("Current game selectedMode:", selectedMode);  // Add this in your GameScreen component to check what you're receiving.


  async function getChartData(stock) {
    // Fetch OHLC data for the selected stock
    // filler function for now
    return ohlcvDataSets[stock]
  
  }


  
useEffect(() => {
  async function fetchChartData() {
    const data = await getChartData(selectedStock);
    setChartData(data);

    // Set a random starting point for the chart display
    const randomIndex = Math.floor(Math.random() * (data.length - MAX_CANDLES));
    setCurrentChartIndex(randomIndex);
  }

  fetchChartData();  // Call the async function

}, [selectedStock]);  // Depend on selectedStock to re-run the effect when it changes


  //Create a function that updates your UI based on changes to the trades list. This function should be triggered whenever the trades state updates:
  useEffect(() => {
    const stats = calculateScore(trades);

    setTotalROI(stats.roi);
    setWins(stats.wins);
    setLosses(stats.losses);
      

    // Optionally, update streak here if needed
    setStreak(trades.reduce((max, trade, index, array) => (trade.isWin && index > 0 && array[index-1].isWin) ? max + 1 : max, 0));

}, [trades]);


  function Trade({entryDate, entryPrice, exitDate, exitPrice, roi, gameMode, direction}) {
    return {
      entryDate: entryDate,
      entryPrice: entryPrice,
      exitDate: exitDate,
      exitPrice: exitPrice,
      roi: roi,
      isWin: roi > 0,
      gameMode: gameMode,
      direction, 
    };
  }


  function calculateScore(trades) { 
    // Calculate the score based on the trades list (should be filled)
    var total_wins = 0;
    var total_losses = 0;
    var total_roi = 0;


    for (let i = 0; i < trades.length; i++) {
      if (trades[i].roi > 0) {
        total_wins += 1;
      } else {
        total_losses += 1;
      }
      total_roi += trades[i].roi;
    }
    return {"wins": total_wins, "losses": total_losses, "total_trades": total_wins+total_losses, "roi": total_roi};

  }
  const fastForwardChart = (skipAmount) => {
  const promises = [];
  const additionalSleepTime = skipAmount * 35; // 200ms per update times number of skips
  for (let i = 1; i <= skipAmount; i++) {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        const newIndex = currentChartIndex + i;
        if (newIndex < chartData.length) {
          setCurrentChartIndex(newIndex);
        }
        // Resolve immediately for all but add additional sleep on the last iteration
        if (i === skipAmount) {
          // After setting the last index, wait for the total animation time
          setTimeout(resolve, additionalSleepTime);
        } else {
          resolve();
        }
      }, 215 * i); //  215 * i); is the key!!
    });
    promises.push(promise);
  }

  // Return the promise to allow chaining, ensuring all animations and the extra delay are complete
  return Promise.all(promises);
};



function executeTrade(direction) {
  if (!position) {
    const skipAmount = sliderValue;
    const tradeIndex = currentChartIndex;
    const trade = gameModeConfigs[selectedMode].processTrade(direction, chartData, tradeIndex, skipAmount);

    setTradeStartIndex(tradeIndex);  // Set where the trade starts
    setPosition(trade); // Set current trade

  }
}

  // LINKED TO THE useEffect HOOK BELOW

  useEffect(() => {
    if (position) {
      const skipAmount = sliderValue;
      fastForwardChart(skipAmount).then(() => {
        console.log("FastForwared ", skipAmount, "candles")
        console.log("Position", position)
        playSound(position.isWin);
        displayResult(position);  // Function to display trade result dynamically on the UI
        handleExitPosition();  // Function to handle the exit of the trade

      });
    }
  }, [tradeStartIndex]);

  async function playSound(isWin) {
    const { sound } = await Audio.Sound.createAsync(
      isWin ? require('../sounds/success.mp3') : require('../sounds/error.mp3')
    );
    setSound(sound);

    await sound.playAsync();
  }

  // Remember to handle sound cleanup
  useEffect(() => {
    return sound ? () => {
      sound.unloadAsync().catch(console.error);
    } : undefined;
  }, [sound]);


  function displayResult(trade) {
    const resultMessage = trade.isWin ? `💵 Win: ${trade.roi.toFixed(2)}%` : `🔻 Loss: ${trade.roi.toFixed(2)}%`;
    setMessage(''); // Clear previous message to ensure the banner always updates
    setTimeout(() => setMessage(resultMessage), 10); // slight delay to ensure the clear happens
  }


  function handleExitPosition() {    
    // Update the last trade in the trades list with the result and final ROI
    closedTrade = position
    setTrades([...trades, closedTrade]);

    // Clear the current position
    setPosition(null);

    // setTradeStartIndex(null);  // Reset the trade start index
}


  function handleLongShortTrade(direction, data, index, skipInterval) {
    const entry = data[index];
    //
    const distance = index + skipInterval;
    const exitIndex = distance < data.length ? distance: data.length - 1;
    const exit = data[exitIndex]; 
    
    console.log("Entry", entry);
    console.log("Exit", exit);

    const trade = Trade({
      entryPrice: parseFloat(entry.close),
      exitPrice: parseFloat(exit.close),
      entryDate: entry.date,
      exitDate: exit.date,
      gameMode: 'longshort',
      direction: direction
    });


    if (direction === 'Long') {
      trade.result = trade.exitPrice - trade.entryPrice;
      trade.isWin = trade.result > 0;
    } else { // Short
      trade.result = trade.entryPrice - trade.exitPrice;
      trade.isWin = trade.result > 0;
    }

    trade.roi = (trade.result / trade.entryPrice) * 100.0;

    return trade;
  }


 
  const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;


  
  var currPrice = null;
  var tradeStartPrice = null;
  if (tradeStartIndex !== null) {

    currPrice = chartData[currentChartIndex].close;
    tradeStartPrice = null;
    if (tradeStartIndex !== null) {
      tradeStartPrice = chartData[tradeStartIndex].close;
    }
  }

const modeOptions = [
    { label: "Long/Short", value: "longshort" },
    { label: "Take Profit/Stop Loss", value: "tpsl" },
    { label: "Trailing Stop Loss", value: "trailing" },
];

  return (
   <View style={styles.container}>
    <NotificationBanner message={message} />
    <GameModeSelectorComponent
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        modeOptions={modeOptions}
    />

    <StockInfoComponent
        selectedStock={selectedStock}
        onSelectStock={setSelectedStock}
        stockNames={Object.keys(ohlcvDataSets)}
        onRefresh={() => {
            const randomIndex = Math.floor(Math.random() * (chartData.length - MAX_CANDLES));
            setCurrentChartIndex(randomIndex);
        }}
    />

    <View style={styles.chartContainer}>
        <CandlestickChartComponent
            key={selectedMode} // This forces re-render on mode change
          ohlc={chartData.slice(currentChartIndex - MAX_CANDLES, currentChartIndex)}
          tradeStartIndex={tradeStartIndex}
          currentIndex={currentChartIndex}
          currPrice={currPrice}
          tradeStartPrice={tradeStartPrice}
          //onPressChartFn={x => gameModeConfigs[selectedMode].onPressChart(x)}
          onPressChartFn={gameModeConfigs[selectedMode].onPressChart}
          takeProfit={takeProfit}
          stopLoss={stopLoss}
          trailingStop={trailingStop}
        />

    </View>
    
    <View style={styles.chartContainer}>
      {gameModeConfigs[selectedMode].component()}
    </View>


    <Text style={styles.streak}>Streak: {streak}</Text>
    <Text style={styles.winLoss}>Wins: {wins} Losses: {losses} Win Rate: {winRate.toFixed(2)}%</Text>
    <Text style={styles.roi}>Total ROI: {totalROI.toFixed(2)}%</Text>
  </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  streak: {
    fontSize: 18,
  },
  winLoss: {
    fontSize: 18,
    marginTop: 10,
  },
});

export default GameScreen;

