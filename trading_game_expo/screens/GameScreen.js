import React, { useState, useEffect, useRef } from 'react';
import {Modal,  Image, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import ConfettiCannon from 'react-native-confetti-cannon';
import uuid from 'react-native-uuid';

import { Audio } from 'expo-av'; // Ensure this is correctly imported

import CandlestickChartComponent from '../components/CandlestickChartComponent';

import StockInfoComponent from '../components/StockInfoComponent';  // Make sure this path is correct
import DraggableAdjuster from '../components/DraggableAdjuster';  // Make sure this path is correct
import MetricsModal from '../components/MetricsModal';  // Make sure this path is correct

import ohlcvDataSets from '../price_data/OhlcvDataSets';  // Adjust the path as needed
const getRandomStockOhlc = () => {
  let stock;
  let keys = Object.keys(ohlcvDataSets);
  let randomKey = keys[Math.floor(Math.random() * keys.length)];
  stock = randomKey;
  ohlc = ohlcvDataSets[stock];
  return { stock, ohlc };
}

// get height width from dimeniosn
import { Dimensions } from 'react-native';
const { width: wWidth, height: wHeight } = Dimensions.get('window');
console.log(wWidth, wHeight, );


  const GameScreen = ({ route }) => {
  console.log('getRandomStockOhlc().stock', getRandomStockOhlc().stock)

  const [selectedStock, setSelectedStock] = useState(getRandomStockOhlc().stock);

  const [chartData, setChartData] = useState([]);
  const [candlesAmount, setCandlesAmount] = useState(120);  // Number of candles to display [default to MAX_CANDLES
  const [currentChartIndex, setCurrentChartIndex] = useState(0);  // Control the display index for the chart
  const [tradeStartIndex, setTradeStartIndex] = useState(null);  // Track where the trade starts



  const [modalVisible, setModalVisible] = useState(false); // stats metrics modal


  const [position, setPosition] = useState(null); // Store current position 
  const [trades, setTrades] = useState([]); // store historical trades (closed positions)
  
  const [sound, setSound] = useState();
  
  const [totalROI, setTotalROI] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  // for longshort game mode
  const [skipCandlesAmount, setSkipCandlesAmount] = useState(30);  // Default value for the slider

  // for tpsl game mode
  const [tpslMode, setTpslMode] = useState('tp');  // adding tp or sl [take profit or stop loss] (OR ts)
  const [takeProfit, setTakeProfit] = useState(null);
  const [stopLoss, setStopLoss] = useState(null);
  // for trailing game mode
  const [trailingStop, setTrailingStop] = useState(null); //
  const [trailingStopPct, setTrailingStopPct] = useState(null); // useEffect calculated dynamically
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);

  const triggerConfetti = () => {
    setShowConfetti(true);
    // Automatically reset confetti to not show after it's done
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000); // Assume confetti animation lastsMAX  5 seconds
  };

    // if show conetti on, shoot confetti time!
  useEffect(() => {
    if (showConfetti) { 
      if (confettiRef) { 
        confettiRef.current.start(); 
        // timetout to stop() anim after 
        setTimeout(() => {
          confettiRef.current.stop();
        }, 5000); // Assume confetti animation lasts 5 seconds
      }

    }
  }, [showConfetti])
  
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
  // Force an update to the slider by setting an initial value
    setSkipCandlesAmount(30); // Or any appropriate default value
    setCandlesAmount(120); // Or any appropriate default value
}, []);

    
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
      
    // set streak equal to # of consectuve isWins from the end
    let streak = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].isWin) {
        streak++;
      } else {
        break;
      }
    }
    setStreak(streak);

  }, [trades, position]);


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
      // uuid
      id: uuid.v4()
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

    // repeat above but not with linear scaling but with log scaling
    const animationDurationMS = 500; // 2 seconds
    const skipTimePerCandle = animationDurationMS / (Math.log(skipAmount + 1)+1)

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
            resolve();
          }
        }, skipTimePerCandle * i); // Delay for simulation effect
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
        handleExitPosition();  // Function to handle the exit of the trade
        
        playSound(position.isWin);
        displayResult(position);  // Function to display trade result dynamically on the UI

        if (position.isWin) {
            triggerConfetti();

          
        }
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
    let resultMessage = trade.isWin ? `💵 Won! ${trade.roi.toFixed(2)}%` : `🔻 Loss ${trade.roi.toFixed(2)}%`;


    showMessage({
      message: resultMessage,
      description: trade.exitReason + ' returned ' + `${trade.roi.toFixed(2)}%` + ' after ' + `${trade.duration} candles`,
      type: trade.isWin ? 'success' : 'danger',
    })
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

        // Check if take profit, stop loss, or trailing stop needs to be checked
    if (takeProfit || stopLoss || trailingStopPct) {
      for (let i = index + 1; i <= exitIndex; i++) {
        // Checking take profit and stop loss conditions
        const candle = data[i]

        if (direction === 'Long') {
          let price = candle.high;
          if (takeProfit && price >= takeProfit) {
            trade.exitPrice = price;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'take profit';
            break;
          }
          price = candle.low;
          if (stopLoss && price <= stopLoss) {
            trade.exitPrice = price;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'stop loss';
            break;
          }
        } else { // Short
          let price = candle.low;
          if (takeProfit && price <= takeProfit) {
            trade.exitPrice = price;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'take profit';
            break;
          }
          price = candle.high;
          if (stopLoss && price >= stopLoss) {
            trade.exitPrice = price;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'stop loss';
            break;
          }
        }

        // Trailing stop condition
        if (trailingStopPct) {
          const { isHit, hitPrice } = calculateTrailingStopSequence(data.slice(index, i + 1), trailingStopPct, direction);
          if (isHit) {
            trade.exitPrice = hitPrice;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'trailing stop';
            break;
          }
        }
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
      tradeStartPrice = chartData[tradeStartIndex-1].close; // -1 or else will get +1 
    }
  }

  const MAXIMUM_SKIP_AMOUNT = 100;

  const refreshNewStock = () => {
    // get new stock
    const newStock = getRandomStockOhlc().stock;
    const data = chartData.length;  // Assuming chartData is the data array for the new stock
    const randomIndex = Math.floor(Math.random() * (data.length - MAXIMUM_SKIP_AMOUNT));

    if (randomIndex > data.length - MAXIMUM_SKIP_AMOUNT) {
      // Show flash message and refresh again
      showFlashMessage("Out of data, refreshing...", "warning");
      refreshNewStock();  // Recursive call to get a new valid stock
    } else {
      setSelectedStock(newStock);
      setCurrentChartIndex(randomIndex);
    }
  }

  const showMessageAndAdjuster = (type) => {
    setTpslMode(type);
    setShowAdjuster(true);
    showMessage({
      message: `Adjust ${type.toUpperCase()} using the draggable`,
      type: 'info',
    });
  };


  const toggleTakeProfit = () => {
    if (takeProfit) {
      setTakeProfit(null);
      setShowAdjuster(false);
    } else {
      setTakeProfit(getCurrentPrice() * 1.01);
      showMessageAndAdjuster('tp');
    }
  };

  const toggleStopLoss = () => {
    if (stopLoss) {
      setStopLoss(null);
      setShowAdjuster(false);
    } else {
      setStopLoss(getCurrentPrice() * 0.99);
      showMessageAndAdjuster('sl');
    }
  };

  const toggleTrailingStop = () => {
    if (trailingStop) {
      setTrailingStopPct(null);
      setTrailingStop(null);
      setShowAdjuster(false);
    } else {
      setTrailingStopPct(null);
      setTrailingStop(getCurrentPrice() * 0.9933);
      showMessageAndAdjuster('ts');
    }
  };



  return (
    <View style={styles.container}>
      {/* INITIALLYT INVISIBLE */}
      

      {/* Metrics Modal */}
      <MetricsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        // totalROI={totalROI}
        // wins={wins}
        // losses={losses}
        // winRate={winRate}
        // streak={streak}
        trades={trades}
      />


      {showConfetti && (
        <ConfettiCannon
          count={64}
          origin={{ x: wHeight*0.2, y: 0 }}
          fadeOut={true}
          autoStart={false}
          ref={confettiRef}
          fallSpeed={3000} />
      )}
      
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
            <Text style={[styles.totalRoiText, {color: totalROI >= 0 ? 'rgba(0,148,32,1)' : 'red'}]}>{totalROI.toFixed(2)}%</Text>
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
          height={styles.chartHeightWidth.height}
          width={styles.chartHeightWidth.width}
        />

        <View style={{ position: 'absolute', top: 20, left: 20 }}>
          <Text style={{
            color: 'darkgrey', fontStyle: 'underline', fontSize: 18, 
            textDecorationLine: 'underline',
            
          }}>Length: {candlesAmount}</Text>
          <Slider
            style={{ flex: 1, height: 30, minWidth: 100, paddingTop: 10 }}
            minimumValue={10}
            maximumValue={300}
            step={1}
            value={candlesAmount}
            onValueChange={setCandlesAmount}
            minimumTrackTintColor="#307ecc"
            maximumTrackTintColor="#000000"
          />
        </View>

        
        
      </View>
      <View style={styles.controlMenu}>
          
          <View style={{ flexDirection: 'row',justifyContent: 'flex-end' }}>
            <View>
              <Text style={{ color: 'darkgrey', fontStyle: 'underline', fontSize: 18, 
            textDecorationLine: 'underline',textAlign: 'right', paddingBottom: 10 }}>Skip: {skipCandlesAmount}</Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Slider
                  style={{ flex: 1, height: 30, minWidth: 100 }}
                  minimumValue={6}
                  maximumValue={MAXIMUM_SKIP_AMOUNT}
                  step={1}
                  value={skipCandlesAmount}
                  onValueChange={setSkipCandlesAmount}
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


          <View style={{ flexDirection: 'row', }}>  {/* Parent View with horizontal flexDirection */}
            {/* Trading Action Buttons View */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around',  }}>
              <TouchableOpacity
                style={[styles.longshortButton, { backgroundColor:  'green', borderRadius: 50 }]}  
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
      {/* GLOBAL FLASH MESSAGE COMPONENT INSTANCE */}
      <FlashMessage position="top" /> {/* <--- here as the last component */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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

  chartHeightWidth: {
    height: wHeight * 0.5,
    width: wWidth*0.95-5,
  },
  chartContainer: {
    // align left

  },
  statsButtonImage: {
    width: 30,
    height: 30
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
  left: 0 ,
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
