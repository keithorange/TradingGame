import React, { useState, useEffect } from 'react';
import {Modal,  Image, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import CandlestickChartComponent from '../components/CandlestickChartComponent';
import NotificationBanner from '../components/NotificationBanner';  // Make sure this path is correct
import StockInfoComponent from '../components/StockInfoComponent';  // Make sure this path is correct
import DraggableAdjuster from '../components/DraggableAdjuster';  // Make sure this path is correct
import MetricsModal from '../components/MetricsModal';  // Make sure this path is correct

import ohlcvDataSets from '../price_data/OhlcvDataSets';  // Adjust the path as needed


import { Audio } from 'expo-av'; // Ensure this is correctly imported



const GameScreen = ({ route }) => {
  const [selectedStock, setSelectedStock] = useState('AAPL');

  const [chartData, setChartData] = useState([]);
  const [candlesAmount, setCandlesAmount] = useState(80);  // Number of candles to display [default to MAX_CANDLES
  const [currentChartIndex, setCurrentChartIndex] = useState(0);  // Control the display index for the chart
  const [tradeStartIndex, setTradeStartIndex] = useState(null);  // Track where the trade starts



  const [message, setMessage] = useState(''); // notification banner

  const [modalVisible, setModalVisible] = useState(false); // stats metrics modal


  const [position, setPosition] = useState(null); // Store current position 
  const [trades, setTrades] = useState([]); // store historical trades (closed positions)
  
  const [sound, setSound] = useState();
  
  const [totalROI, setTotalROI] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  // for longshort game mode
  const [skipCandlesAmount, setSkipCandlesAmount] = useState(20);  // Default value for the slider

  // for tpsl game mode
  const [tpslMode, setTpslMode] = useState('tp');  // adding tp or sl [take profit or stop loss] (OR ts)
  const [takeProfit, setTakeProfit] = useState(null);
  const [stopLoss, setStopLoss] = useState(null);
  // for trailing game mode
  const [trailingStop, setTrailingStop] = useState(null); //
  const [trailingStopPct, setTrailingStopPct] = useState(null); // useEffect calculated dynamically

  // for trailing stop dynamic calculation

  const trailingStopToPct = (trailingStop, currentPrice) => {
    const diff = trailingStop - currentPrice;
    const pct = Math.abs(diff / currentPrice) * 100; // Ensure the result is positive
    console.log(`Calculated Trailing Stop Percentage: ${pct}%`);
    return pct;
  }


  useEffect(() => {
    if (trailingStop) {
      const pct = trailingStopToPct(trailingStop, getCurrentPrice());
      
      console.log("useEffect Trailing Stop Pct", pct, "trailStop", trailingStop, "currentPrice", getCurrentPrice());

      // Ensure the percentage is positive
      if (pct < 0) {
        console.warn("Negative trailing stop percentage detected, converting to positive.");
      }

      setTrailingStopPct(Math.abs(pct))

      
    }
  }, [trailingStop]);

  


  // for draggable adjuster
  const [showAdjuster, setShowAdjuster] = useState(false);

  const handleAdjust = (factor) => {

    if (tpslMode === 'tp' && takeProfit !== null) {
      setTakeProfit(prev => Math.max(0, prev * (1 + factor)));
    } else if (tpslMode === 'sl' && stopLoss !== null) {
      setStopLoss(prev => Math.max(0, prev * (1 + factor)));
    } else if (tpslMode === 'ts' && trailingStop !== null) {
      setTrailingStop(prev => Math.max(0, prev * (1 + factor)));
    }
  };

  

  const handleCloseAdjuster = () => {
    setShowAdjuster(false);
    setTpslMode(null);
  };

  function getCurrentPrice() {
    return chartData[currentChartIndex].close;
  }



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
      const randomIndex = Math.floor(Math.random() * (data.length - candlesAmount));
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
    setStreak(trades.reduce((max, trade, index, array) => (trade.isWin && index > 0 && array[index - 1].isWin) ? max + 1 : max, 0));

  }, [trades]);


  function Trade({ entryDate, entryPrice, exitDate, exitPrice, roi, duration, direction, exitReason = null }) {
    return {
      direction,
      entryDate,
      entryPrice,
      exitDate,
      exitPrice,
      duration,
      roi,
      isWin: direction === 'Long' ? exitPrice > entryPrice : exitPrice < entryPrice,
      exitReason,
      
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
    return { "wins": total_wins, "losses": total_losses, "total_trades": total_wins + total_losses, "roi": total_roi };

  }
  

  const fastForwardChart = (skipAmount) => {
    let promises = [];
    for (let i = 1; i <= skipAmount; i++) {
      promises.push(new Promise((resolve) => {
        setTimeout(() => {
          const newIndex = currentChartIndex + i;
          if (newIndex < chartData.length) {
            const newPrice = chartData[newIndex].close;
            setCurrentChartIndex(newIndex);

            // Ensure trailing stop is calculated and updated correctly
            if (trailingStopPct && position) {
              const slicedData = chartData.slice(tradeStartIndex, newIndex + 1); // Include current candle in calculation
              const { isHit, trailingStops, hitPrice } = calculateTrailingStopSequence(slicedData, trailingStopPct, position.direction);

              // Logging for debugging
              console.log("Processing index", newIndex, "with trailing stop percentage", trailingStopPct, "and direction", position.direction);
              console.log('Updated Trailing Stops:', trailingStops);

              // Update the trailing stop to the last calculated value
              const currentTrailingStop = trailingStops[trailingStops.length - 1];
              setTrailingStop(currentTrailingStop);

              // Check if the trailing stop was hit
              if (isHit) {
                console.log('Trailing Stop Hit at', hitPrice, 'at index', newIndex);
                setPosition({ ...position, exitPrice: hitPrice, exitReason: 'trailing stop hit' });
                resolve(); // Resolve the promise early due to stop hit
                return;
              }
            }

            // Resolve normally if no early exit
            if (i === skipAmount) {
              setTimeout(resolve, 200); // Ensure the last promise resolves with a slight delay
            } else {
              resolve();
            }
          }
        }, 215 * i); // Delay for simulation effect
      }));
    }

    return Promise.all(promises).then(() => {
      console.log("Fast forward complete. Current chart index:", currentChartIndex);
    });
  };


  function executeTrade(direction) {
    if (!position) {
      const skipAmount = skipCandlesAmount;
      const tradeIndex = currentChartIndex;
      const trade = handleTradeWithConditions(direction, chartData, tradeIndex, skipAmount);

      setTradeStartIndex(tradeIndex);
      setPosition(trade);

    }
  }




  // LINKED TO THE useEffect HOOK BELOW

  useEffect(() => {
    if (position) {
      const tradeDuration = position.duration;

      fastForwardChart(tradeDuration + 1).then(() => {
        console.log("FastForwared ", tradeDuration, "candles")
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
    let resultMessage = trade.isWin ? `💵 Win: ${trade.roi.toFixed(2)}%` : `🔻 Loss: ${trade.roi.toFixed(2)}%`;
    resultMessage += ` via ` + trade.exitReason

    setMessage(''); // Clear previous message to ensure the banner always updates
    setTimeout(() => setMessage(resultMessage), 10); // slight delay to ensure the clear happens
  }


  function handleExitPosition() {
    // Update the last trade in the trades list with the result and final ROI
    closedTrade = position
    setTrades([...trades, closedTrade]);

    // Clear the current position
    setPosition(null);

    // uncomment to clear path/lines AFTER trade (comment to keep in!)
    setTradeStartIndex(null);  // Reset the trade start index

    // clear any set TPSL
    setTakeProfit(null);
    setStopLoss(null);
    setTrailingStop(null);
    setTrailingStopPct(null);

    
  }

  function calculateTrailingStopSequence(data, trailingStopPct, direction) {
    let extremePrice = data[0].close; // Initialize with the first closing price
    let trailingStops = [];
    let stopPrice = 0;
    let hitDetected = false;
    let hitPrice = null;
    let hitIdx = -1;

    // Ensure trailingStopPct is always positive
    let adjustedTrailingStopPct = Math.abs(trailingStopPct) / 100.0;

    for (let i = 1; i < data.length; i++) {
      const candle = data[i];
      if (direction === 'Long') {
        extremePrice = Math.max(extremePrice, candle.high);
        stopPrice = extremePrice - (extremePrice * adjustedTrailingStopPct);
      } else {
        extremePrice = Math.min(extremePrice, candle.low);
        stopPrice = extremePrice + (extremePrice * adjustedTrailingStopPct);
      }

      trailingStops.push(stopPrice);

      if (!hitDetected) {
        if ((direction === 'Long' && candle.low <= stopPrice) ||
          (direction === 'Short' && candle.high >= stopPrice)) {
          hitDetected = true;
          hitPrice = direction === 'Long' ? candle.low : candle.high;
          hitIdx = i;
        }
      }

      // Stop adding new stops if a hit has been detected
      if (hitDetected) break;
    }

    // Determine the return value after collecting all data
    return {
      isHit: hitDetected,
      stopPrice: stopPrice,
      trailingStops: trailingStops,
      hitPrice: hitPrice,
      hitIdx: hitIdx
    };
  }




  
  function handleTradeWithConditions(direction, data, index, skipInterval) {
    const entry = data[index];

    const distance = index + skipInterval;
    const exitIndex = distance < data.length ? distance : data.length - 1;
    const exit = data[exitIndex];

    console.log("Entry", entry);
    console.log("Exit", exit);

    // create default trade props
    const trade = new Trade({
      entryPrice: parseFloat(entry.close),
      exitPrice: parseFloat(exit.close),
      entryDate: entry.date,
      exitDate: exit.date,
      duration: exitIndex - index,
      direction: direction,
      exitReason: `times up`,
    });
    // Calculate the result of the trade
    if (direction === 'Long') {
      trade.result = trade.exitPrice - trade.entryPrice;
    } else { // Short
      trade.result = trade.entryPrice - trade.exitPrice;
    }
    trade.isWin = trade.result > 0;
    trade.roi = (trade.result / trade.entryPrice) * 100.0;

    


    console.log("Trade", trade);
    console.log("TakeProfit", takeProfit);  // Price level for taking profit
    console.log("StopLoss", stopLoss);     // Price level for stopping loss

    // Check if take profit or stop loss needs to be checked
    if (takeProfit || stopLoss) {
      for (let i = index + 1; i <= exitIndex; i++) {
        const price = data[i].close; // Current price at index i

        if (direction === 'Long') {
          if (takeProfit && price >= takeProfit) {
            trade.exitPrice = data[i].close;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'take profit';
            break;
          }
          if (stopLoss && price <= stopLoss) {
            trade.exitPrice = data[i].close;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'stop loss';
            break;
          }
        } else { // Short
          if (takeProfit && price <= takeProfit) {
            trade.exitPrice = data[i].close;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'take profit';
            break;
          }
          if (stopLoss && price >= stopLoss) {
            trade.exitPrice = data[i].close;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'stop loss';
            break;
          }
        }
      }
    }
    console.log("Trailing Stop", trailingStop, "Trailing Stop Pct", trailingStopPct)
    
    // Check if trailing stop needs to be checked

    console.log('handleTradeWithConditions:: ', "ts=", trailingStop, "tsp=", trailingStopPct)

    if (trailingStopPct) {
      const { isHit, trailingStops, hitPrice, hitIdx } = calculateTrailingStopSequence(data.slice(index, exitIndex), trailingStopPct, direction);
      console.log("Trailing Stops", trailingStops, "isHit", isHit);
      console.log("closes", data[index]);

      if (isHit) {
        trade.exitPrice = data[hitIdx].close;
        trade.exitDate = data[hitIdx].date;
        trade.duration = trailingStops.length;
        trade.exitPrice = hitPrice;
        trade.exitReason = 'trailing stop';
      }
    }


      
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

  const refreshNewStock = () => {
    // Fetch a new stock and reset the chart
    const randomIndex = Math.floor(Math.random() * (chartData.length - candlesAmount));
    setCurrentChartIndex(randomIndex);
  }
  
  const showMessageAndAdjuster = (type) => {
    setTpslMode(type);
    setShowAdjuster(true);
    setMessage(`Adjust ${type.toUpperCase()} using the draggable`);
  };


  const toggleTakeProfit = () => {
    if (takeProfit) {
      setTakeProfit(null);
      setMessage('');
      setShowAdjuster(false);
    } else {
      setTakeProfit(getCurrentPrice() * 1.01);
      showMessageAndAdjuster('tp');
    }
  };

  const toggleStopLoss = () => {
    if (stopLoss) {
      setStopLoss(null);
      setMessage('');
      setShowAdjuster(false);
    } else {
      setStopLoss(getCurrentPrice() * 0.99);
      showMessageAndAdjuster('sl');
    }
  };

  const toggleTrailingStop = () => {
    if (trailingStop) {
      setTrailingStop(null);
      setMessage('');
      setShowAdjuster(false);
    } else {
      setTrailingStop(getCurrentPrice() * 0.9933);
      showMessageAndAdjuster('ts');
    }
  };



  return (
    <View style={styles.container}>
      {/* INITIALLYT INVISIBLE */}
      <NotificationBanner message={message} />

      {/* Metrics Modal */}
      <MetricsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        totalROI={totalROI}
        wins={wins}
        losses={losses}
        winRate={winRate}
        streak={streak}
      />
      
      <View style={styles.headerContainer}>
        <StockInfoComponent
          selectedStock={selectedStock}
          onSelectStock={setSelectedStock}
          stockNames={Object.keys(ohlcvDataSets)}
          onRefresh={refreshNewStock}
        />

          {/* Metrics Button */}
          <View style={styles.statsButtonContainer}>
            <View>
              <Text style={styles.totalRoiText}>{totalROI.toFixed(2)}%</Text>
            </View>
            <View>
              <Text style={styles.streakText}>{streak}x</Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image source={require('../assets/stats.png')} style={styles.statsButtonImage} />
            </TouchableOpacity>
          </View>
        </View>

      <View style={styles.chartContainer}>
        <CandlestickChartComponent
          ohlc={chartData.slice(currentChartIndex - candlesAmount, currentChartIndex)}
          tradeStartIndex={tradeStartIndex}
          currentIndex={currentChartIndex}
          currPrice={currPrice}
          tradeStartPrice={tradeStartPrice}
          takeProfit={takeProfit}
          stopLoss={stopLoss}
          trailingStop={trailingStop}
          height={styles.chartContainer.height}
        />

        <View style={{ position: 'absolute', top: 20, left: 20 }}>
          <Text style={{ color: 'grey', fontStyle: 'underline' }}>Length: {candlesAmount}</Text>
          <Slider
            style={{ flex: 1, height: 30, minWidth: 100, paddingTop: 10 }}
            minimumValue={10}
            maximumValue={500}
            step={20}
            value={candlesAmount}
            onValueChange={(value) => setCandlesAmount(value)}
            minimumTrackTintColor="#307ecc"
            maximumTrackTintColor="#000000"
          />
        </View>

        
        <View style={styles.controlMenu}>
          
          <View style={{ flexDirection: 'row',justifyContent: 'flex-end' }}>
            <View>
              <Text style={{ color: 'grey', fontStyle: 'underline', textAlign: 'right' }}>Skip: {skipCandlesAmount}</Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Slider
                  style={{ flex: 1, height: 30, minWidth: 100 }}
                  minimumValue={6}
                  maximumValue={60}
                  step={1}
                  value={skipCandlesAmount}
                  onValueChange={(value) => setSkipCandlesAmount(value)}
                  minimumTrackTintColor="#307ecc"
                  maximumTrackTintColor="#000000"
                />
                <TouchableOpacity
                  style={[styles.button, { marginLeft: 10 }]}
                  onPress={() => fastForwardChart(skipCandlesAmount)}
                >
                  <Image source={require('../assets/fast-forward.png')} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>


          <View style={{ flexDirection: 'row' }}>  {/* Parent View with horizontal flexDirection */}
            {/* Trading Action Buttons View */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around',  }}>
              <TouchableOpacity
                style={[styles.longshortButton, { backgroundColor: 'green', borderRadius: 50 }]}  
                onPress={() => executeTrade('Long')}
              >
                <Text style={styles.longshortButtonText}>Long </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.longshortButton, { backgroundColor: 'red', borderRadius: 50 }]} 
                onPress={() => executeTrade('Short')}
              >
                <Text style={styles.longshortButtonText}>Short</Text>
              </TouchableOpacity>
            </View>
            {/* TP, SL, TS Buttons View */}
            <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}> 
              <TouchableOpacity
                style={[styles.tpsltsButton, {
                  borderColor: takeProfit ? '#2196F3' : '#2196F3',
                  backgroundColor: takeProfit ? '#2196F3' : 'white'
                }]}
                onPress={toggleTakeProfit}
              >
                <Text style={[styles.tpsltsButtonText, { color: takeProfit ? 'white' : '#2196F3' }]}>
                  {takeProfit ? 'Take Profit' : 'Take Profit'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tpsltsButton, {
                  borderColor: stopLoss ? '#FF9800' : '#FF9800',
                  backgroundColor: stopLoss ? '#FF9800' : 'white'
                }]}
                onPress={toggleStopLoss}
              >
                <Text style={[styles.tpsltsButtonText, { color: stopLoss ? 'white' : '#FF9800' }]}>
                  {stopLoss ? 'Stop Loss' : 'Stop Loss'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tpsltsButton, {
                  borderColor: trailingStop ? '#9C27B0' : '#9C27B0',
                  backgroundColor: trailingStop ? '#9C27B0' : 'white'
                }]}
                onPress={toggleTrailingStop}
              >
                <Text style={[styles.tpsltsButtonText, { color: trailingStop ? 'white' : '#9C27B0' }]}>
                  {trailingStop ? 'Trailing Stop' : 'Trailing Stop'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          

          {/* Draggable Adjuster for TS, TP, SL setting via touch */}
          {showAdjuster && (
            <DraggableAdjuster
              onAdjust={handleAdjust}
              onClose={handleCloseAdjuster}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  tradeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20
  },
  settingsActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20
  },

  chartContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: '#ddd',
    alignItems: 'center',

  },
  statsButtonImage: {
    width: 30,
    height: 30
  },
  container: {
    flex: 1,
    alignItems: 'center',

  },
  headerContainer: {
    // side-byside align items, strethced max in between
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  
  statsButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    flex: 1
  },


controlMenu: {
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 20,
  position: 'absolute',
  bottom: 0,
  left: 0,
  borderRadius: 10,
  backgroundColor: 'rgba(255,255,255,0.5)', // Semi-transparent white background
},


  longshortButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,

    backgroundColor: '#61DBFB', // React Blue
    borderRadius: 100, // Circle-like shape
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // For Android shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowRadius: 6, // For iOS shadow
    shadowOpacity: 0.2, // For iOS shadow
    
    marginRight: 10, // Spacing between buttons,

    // add 

  },
  longshortButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    fontFamily: 'System', // Default system font, replace with your custom font
  },
  tpsltsButton: {
    backgroundColor: '#61DBFB', // React Blue
    borderRadius: 20, // Rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    minWidth: 100, // To accommodate around 10 chars
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowRadius: 4, // For iOS shadow
    shadowOpacity: 0.2, // For iOS shadow
    elevation: 2, // For Android shadow


    marginVertical: 5,
    marginHorzontal: 10
  },
  tpsltsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    fontFamily: 'System', // Default system font, replace with your custom font
  }
  ,
  totalRoiText: {
    fontWeight: 'bold',
    fontSize: 42,
    color: 'rgba(0,228,22,1)', // A color that represents money/growth
    textShadowColor: 'rgba(0, 0, 0, 0.25)', // Drop shadow for depth
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Style for the streak text
  streakText: {
    fontWeight: 'bold',
    fontSize: 32,
    color: 'rgba(255,133,0,1)', // Attention-grabbing color
    textShadowColor: 'rgba(0, 0, 0, 0.25)', // Drop shadow for depth
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
}
);
export default GameScreen;
