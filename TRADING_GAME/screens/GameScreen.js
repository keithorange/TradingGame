import React, { useState, useEffect, useRef } from 'react';
import {Modal,  Image, View, Text, Button, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
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

import ohlcvDataSets from '../OhlcvDataSets';  // Adjust the path as needed

// log to ensure we ipoted ohlcvDataSets with elngth
console.log('ohlcvDataSets.length', ohlcvDataSets.length)



const getRandomStockOhlc = () => {
  if (ohlcvDataSets.length > 0) {
    let randomIdx = Math.floor(Math.random() * ohlcvDataSets.length);
    let randomChoiceData = ohlcvDataSets[randomIdx];

    // ensure data hs sufifcient length, if not, rety
    const MIN_OHLC_DATA_LENGTH = 120;
    let i = 0;
    while (randomChoiceData.ohlcData.length < MIN_OHLC_DATA_LENGTH && i < 1000) {
      randomIdx = Math.floor(Math.random() * ohlcvDataSets.length);
      randomChoiceData = ohlcvDataSets[randomIdx];
      i++;
    }


    const { category, ticker, humanName, ohlcData } = randomChoiceData;

    // renaming cuz deprecated dummy
    //const ohlc = ohlcData;
    const stock = ticker;
    // const humanName = humanName;
    // const category = category;

    return { stock, ohlcData, humanName, category };
  } else {
    console.error('No data found in ohlcvDataSets');
    return null;
  }
}

// get height width from dimeniosn
import { Dimensions } from 'react-native';
const { width: wWidth, height: wHeight } = Dimensions.get('window');
console.log(wWidth, wHeight, );


  const GameScreen = ({ route }) => {
  console.log('getRandomStockOhlc().stock', getRandomStockOhlc().stock)

  const [selectedStock, setSelectedStock] = useState(getRandomStockOhlc().stock);

  const [chartData, setChartData] = useState({stock: '', ohlcData: [], humanName: '', category: ''});
  const [candlesAmount, setCandlesAmount] = useState(120);  // Number of candles to display [default to MAX_CANDLES
  const [currentChartIndex, setCurrentChartIndex] = useState(0);  // Control the display index for the chart
  const [tradeStartIndex, setTradeStartIndex] = useState(null);  // Track where the trade starts



  const [modalVisible, setModalVisible] = useState(false); // stats metrics modal


  const [position, setPosition] = useState(null); // Store current position 
  const [trades, setTrades] = useState([]); // store historical trades (closed positions)
  
  const [sound, setSound] = useState();
  
  const [totalROI, setTotalROI] = useState(0);
  const [winningStreak, setWinningStreak] = useState(0);
  const [losingStreak, setLosingStreak] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  // for longshort game mode
  const [skipCandlesAmount, setSkipCandlesAmount] = useState(30);  // Default value for the slider
  const [isFastForwardingChart, setIsFastForwardingChart] = useState(false)
  const [stopRequested, setStopRequested] = useState(false);


  // for tpsl game mode
  const [tpslMode, setTpslMode] = useState('tp');  // adding tp or sl [take profit or stop loss] (OR ts)
  const [takeProfit, setTakeProfit] = useState(null);
  const [stopLoss, setStopLoss] = useState(null);
  const [tradeDirection, setTradeDirection] = useState(false)

  // for trailing game mode
  const [trailingStop, setTrailingStop] = useState(null); //
  const [trailingStopPct, setTrailingStopPct] = useState(null); // useEffect calculated dynamically
  
  // chart ema 
  const [emaPeriod, setEmaPeriod] = useState(5);
  const [useHeikinAshi, setUseHeikinAshi] = useState(false);

  const [refreshChartEachTrade, setRefreshChartEachTrade] = useState(false);
  
    
  // confetti  
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);

  const resetTradeState = (keepLines = false) => {
    setTradeStartIndex(null);  // Reset the trade start index
    setPosition(null);  // Clear the current position

    if (!keepLines){
      setTakeProfit(null);  // Clear the take profit
      setStopLoss(null);  // Clear the stop loss
      setTrailingStop(null);  // Clear the trailing stop
      setTrailingStopPct(null);  // Clear the trailing stop percentage
    }
  };
  

  const triggerConfetti = () => {
    setShowConfetti(true);
    // Automatically reset confetti to not show after it's done
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000); // Assume confetti animation lastsMAX  5 seconds
  };
  useEffect(() => {
    if (showConfetti) { 
      if (confettiRef.current) { 
        confettiRef.current.start(); 
        // Timeout to stop() animation after 5 seconds
        setTimeout(() => {
          if (confettiRef.current) { // Check again before stopping
            confettiRef.current.stop();
          }
        }, 5000); // Assume confetti animation lasts 5 seconds
      } else {
        console.error("Confetti ref is null");
      }
    }
  }, [showConfetti]);
  
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
    return chartData.ohlcData[currentChartIndex].close;
  }



  async function getChartData(stock) {
    // Fetch OHLC data for the selected stock
    // filler function for now

    return ohlcvDataSets.find(item => item.ticker === stock);
  
  }

  useEffect(() => {
  // Force an update to the slider by setting an initial value
    setSkipCandlesAmount(24); // Or any appropriate default value
    setCandlesAmount(140); // Or any appropriate default value
}, []);

  async function fetchChartData() {
    // const data = await getChartData(selectedStock);
    // setChartData(data);
    const data = await getChartData(selectedStock);
    const { stock, ohlcData } = data
    setChartData(data);
    
    console.log("fetching chart data for", selectedStock, "with", ohlcData.length, "candles")
    
    // Calculate the maximum possible index that would still allow for 'MAXIMUM_SKIP_AMOUNT' number of candles to be skipped from the end
    const maxPossibleIndex = ohlcData.length - MAXIMUM_SKIP_AMOUNT;
    
    // Calculate the minimum possible index that would still allow for 'candlesAmount' number of candles to be displayed
    const minPossibleIndex = candlesAmount;
    
    // Set a random starting point for the chart display within the valid range
    const randomIndex = Math.floor(Math.random() * (maxPossibleIndex - minPossibleIndex + 1)) + minPossibleIndex;
    setCurrentChartIndex(randomIndex);
  }


    
  useEffect(() => {

    fetchChartData();  // Call the async function

  }, [selectedStock]);  // Depend on selectedStock to re-run the effect when it changes


  useEffect(() => {
    const stats = calculateScore(trades);
  
    console.log('trades', trades);
    console.log('stats', stats);
  
    setTotalROI(stats.roi);
    setWins(stats.wins);
    setLosses(stats.losses);
  
    // Calculate winning and losing streaks
    let currentStreak = 0;
    let currentStreakType = null;
    let maxWinningStreak = 0;
    let maxLosingStreak = 0;
  
    trades.forEach((trade, index) => {
      console.log(`Trade ${index}:`, trade);
  
      if (trade.isWin) {
        if (currentStreakType === 'win' || currentStreakType === null) {
          currentStreak++;
          currentStreakType = 'win';
        } else {
          maxLosingStreak = Math.max(maxLosingStreak, currentStreak);
          currentStreak = 1;
          currentStreakType = 'win';
        }
      } else {
        if (currentStreakType === 'loss' || currentStreakType === null) {
          currentStreak++;
          currentStreakType = 'loss';
        } else {
          maxWinningStreak = Math.max(maxWinningStreak, currentStreak);
          currentStreak = 1;
          currentStreakType = 'loss';
        }
      }
  
      if (currentStreakType === 'win') {
        maxWinningStreak = Math.max(maxWinningStreak, currentStreak);
      } else if (currentStreakType === 'loss') {
        maxLosingStreak = Math.max(maxLosingStreak, currentStreak);
      }
  
      console.log(`Current Streak: ${currentStreak}, Current Streak Type: ${currentStreakType}`);
      console.log(`Max Winning Streak: ${maxWinningStreak}, Max Losing Streak: ${maxLosingStreak}`);
    });
  
    console.log('Final Max Winning Streak:', maxWinningStreak, 'Final Max Losing Streak:', maxLosingStreak);
    
    if (currentStreakType === 'win') {
      setWinningStreak(currentStreak);
      setLosingStreak(0);
    } else if (currentStreakType === 'loss') {
      setLosingStreak(currentStreak);
      setWinningStreak(0);
    } else {
      setWinningStreak(0);
      setLosingStreak(0);
    }
  
  }, [trades, position]);
  
  
  


  function Trade({ entryDate, entryPrice, exitDate, exitPrice, roi, duration, direction, priceChange, exitReason = '', isWin=false }) {
    return {
      direction,
      entryDate,
      entryPrice,
      exitDate,
      exitPrice,
      duration,
      roi,
      priceChange: priceChange ? priceChange : exitPrice - entryPrice,
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
    setIsFastForwardingChart(true); // Set animating state to true
  
    const animationDurationMS = 400; // 2 seconds
    const skipTimePerCandle = animationDurationMS / (Math.log(skipAmount + 1) + 1);
  
    const loopLength = skipAmount;
    for (let i = 1; i <= loopLength + 1; i++) {
      if (stopRequested) {
        setStopRequested(false); // Reset stop request
        setIsFastForwardingChart(false); // Set animating state to false
        break; // Exit early if stop requested
      }
  
      promises.push(
        new Promise((resolve) => {
          setTimeout(() => {
            const newIndex = currentChartIndex + i;
            if (newIndex < chartData.ohlcData.length) {
              setCurrentChartIndex(newIndex);
  
              // Ensure trailing stop is calculated and updated correctly
              if (trailingStopPct && position) {
                const slicedData = chartData.ohlcData.slice(tradeStartIndex, newIndex + 1); // Include current candle in calculation
                const { isHit, trailingStops, hitPrice } = calculateTrailingStopSequence(
                  slicedData,
                  trailingStopPct,
                  position.direction
                );
  
                const currentTrailingStop = trailingStops[trailingStops.length - 1];
                setTrailingStop(currentTrailingStop);
  
                if (isHit) {
                  setPosition({ ...position, exitPrice: hitPrice, exitReason: 'trailing stop hit' });
                  setTrailingStop(null);
                  setTrailingStopPct(null);
                  resolve();
                  return;
                }
              }
              resolve();
            }
          }, skipTimePerCandle * i); // Delay for simulation effect
        })
      );
    }
  
    return Promise.all(promises).then(() => {
      setIsFastForwardingChart(false); // Set animating state to false
    });
  };
  

  function executeTrade(direction) {
    if (!position) {
      resetTradeState(true); // Keep the trailing stop values
      const skipAmount = skipCandlesAmount;
      const tradeIndex = currentChartIndex;
      const trade = handleTradeWithConditions(direction, chartData.ohlcData, tradeIndex, skipAmount);
    
      setTradeStartIndex(tradeIndex);
      setPosition(trade);
      setTradeDirection(direction);
    }
  }
  
  

    const MAX_SKIP_AMOUNT = 200;

  // LINKED TO THE useEffect HOOK BELOW

  useEffect(() => {
    // if insufficnet candles, notify and fresh new chart
    if (currentChartIndex + MAX_SKIP_AMOUNT >= chartData.ohlcData.length + 1) {
        
      // dont show on first time
      if (!tradeStartIndex) {

        showMessage({
          message: 'Out of candles! Refreshing New Chart!',
          type: 'warning',
        })
      }
        refreshNewStock()
        return
      }
    // FF if user placed trade
    if (position) {
      const tradeDuration = position.duration;

      fastForwardChart(tradeDuration).then(() => {
        // console.log("FastForwared ", tradeDuration, "candles")
        // console.log("Position", position)
        handleExitPosition();  // Function to handle the exit of the trade
        
        playSound(position.isWin);
        displayResult(position);  // Function to display trade result dynamically on the UI

        if (position.isWin) {
            triggerConfetti();         
        }
        

        // fetch and refresh new stock chart
      
      });
    }


  }, [tradeStartIndex]);

  

  async function setVolumeFromStreak(sound, streak) {
    function getVolumeFromStreak(maxStreak = 10, minVol = 0.5, maxVol = 1.0) {
      const cappedStreak = Math.min(streak, maxStreak);
      const scaledVol = (cappedStreak / maxStreak) * (maxVol - minVol) + minVol;
      return scaledVol;
    }

    const scaledVolume = getVolumeFromStreak();
    await sound.setVolumeAsync(scaledVolume); // Use the new sound object
  }

  async function playSound(isWin) {
    const { sound } = await Audio.Sound.createAsync(
      isWin ? require('../sounds/success.mp3') : require('../sounds/error.mp3')
    );
    setSound(sound);

    await sound.playAsync();
    setVolumeFromStreak(sound, isWin ? winningStreak : losingStreak)
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
    const closedTrade = position; // Declare and assign the closed trade
    setTrades([...trades, closedTrade]);
  
    // Clear the current position
    setPosition(null);
  
    // Uncomment to clear path/lines AFTER trade (comment to keep in!)
    setTradeStartIndex(null);  // Reset the trade start index
  
    // Clear any set TPSL
    resetTradeState(false)
  
    if (refreshChartEachTrade) {
      refreshNewStock();
    }
  }
  
  
  const calculateTrailingStopSequence = (data, trailingStopPct, direction, emaPeriod = 12, exitPriceIsStop = true) => {
    const calculateEMA = (data, period) => {
      const k = 2 / (period + 1);
      let ema = data[0].close;
      return data.map((candle) => {
        ema = candle.close * k + ema * (1 - k);
        return ema;
      });
    };
  
    const emaData = calculateEMA(data, emaPeriod);
    console.log('EMA Data:', emaData);  // Debugging

    
    
    // bug
    const calculateHMA = (data, period) => {
      // Function to calculate WMA
      const calculateWMA = (data, period) => {
        const weights = Array.from({length: period}, (_, i) => period - i);
        const sum = weights.reduce((a, b) => a + b, 0);
    
        return data.map((_, i, arr) => {
          if (i < period - 1) return null;
          let wma = 0;
          for (let j = 0; j < period; j++) {
            wma += arr[i - j].close * weights[j];
          }
          return wma / sum;
        });
      };
    
      // Calculate WMA with period / 2
      const halfPeriod = Math.floor(period / 2);
      const wmaHalf = calculateWMA(data, halfPeriod);
    
      // Calculate WMA with full period
      const wmaFull = calculateWMA(data, period);
    
      // Calculate raw HMA: (2 * WMA(n/2) - WMA(n))
      const rawHMA = wmaHalf.map((half, i) => {
        if (half === null || wmaFull[i] === null) return null;
        return 2 * half - wmaFull[i];
      });
    
      // Calculate final HMA: WMA of rawHMA with sqrt(n) period
      const sqrtPeriod = Math.floor(Math.sqrt(period));
      const hma = calculateWMA(rawHMA.map(value => ({close: value})), sqrtPeriod);
    
      return hma;
    };
    
    // // Usage
    // const hmaPeriod = emaPeriod;
    // const hmaData = calculateHMA(data, hmaPeriod);
    // // console.log('HMA Data:', hmaData); // Debugging
  
    // // TODO: only wrote logic for EMA so on backedn just swap out EMA or HMA code
    // const emaData = hmaData

    let extremePrice = emaData[0]; // Initialize with the first EMA value
    let trailingStops = [];
    let stopPrice = 0;
    let hitDetected = false;
    let hitPrice = null;
    let hitIdx = -1;
  
    // Ensure trailingStopPct is always positive
    let adjustedTrailingStopPct = Math.abs(trailingStopPct) / 100.0;
    // console.log('Adjusted Trailing Stop Percentage:', adjustedTrailingStopPct);  // Debugging
  
    for (let i = 1; i < emaData.length; i++) {
      const ema = emaData[i];
      // console.log(`Processing index ${i}, EMA value: ${ema}`);  // Debugging
  
      if (direction === 'Long') {
        extremePrice = Math.max(extremePrice, ema);
        stopPrice = extremePrice - (extremePrice * adjustedTrailingStopPct);
      } else {
        extremePrice = Math.min(extremePrice, ema);
        stopPrice = extremePrice + (extremePrice * adjustedTrailingStopPct);
      }
  
      trailingStops.push(stopPrice);
      // console.log(`Updated Trailing Stop for index ${i}: ${stopPrice}`);  // Debugging
  
      if (!hitDetected) {
        if ((direction === 'Long' && ema <= stopPrice) ||
            (direction === 'Short' && ema >= stopPrice)) {
          hitDetected = true;
          hitPrice = exitPriceIsStop ? stopPrice : ema;
          hitIdx = i;
          console.log(`Trailing Stop Hit at index ${i}, Hit Price: ${hitPrice}`);  // Debugging
        }
      }
  
      if (hitDetected) break;
    }
  
    // Final debugging
    console.log('Trailing Stops:', trailingStops);
  
    return {
      isHit: hitDetected,
      stopPrice: stopPrice,
      trailingStops: trailingStops,
      hitPrice: hitPrice,
      hitIdx: hitIdx
    };
  };
  
  
    function handleTradeWithConditions(direction, data, index, skipInterval, use_mean_price=false, exitPriceIsStop=true) {
    console.log('direction', direction, 'data.length', data.length, 'index', index, 'skipInterval', skipInterval)

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
    

    console.log("Trade", trade);
    console.log("TakeProfit", takeProfit);  // Price level for taking profit
    console.log("StopLoss", stopLoss);     // Price level for stopping loss

 // Check if take profit, stop loss, or trailing stop needs to be checked
if (takeProfit || stopLoss || trailingStopPct) {
  for (let i = index + 1; i <= exitIndex; i++) {
    // Checking take profit and stop loss conditions
    const candle = data[i]
    const meanPrice = (candle.open + candle.high + candle.low + candle.close) / 4;
    
    const doTakeProfitLogic = () => { 
      trade.exitPrice = exitPriceIsStop ? takeProfit : price;
      trade.exitDate = data[i].date;
      trade.duration = i - index;
      trade.priceChange = trade.exitPrice - trade.entryPrice;
      trade.exitReason = 'take profit';
    }

    const doStopLossLogic = () => {
      trade.exitPrice = exitPriceIsStop ? stopLoss : price;
      trade.exitDate = data[i].date;
      trade.duration = i - index;
      trade.priceChange = trade.exitPrice - trade.entryPrice;
      trade.exitReason = 'stop loss';
    }


    if (direction === 'Long') {
      
      let price = use_mean_price ? meanPrice : candle.high;

      

      if (takeProfit && price >= takeProfit) {
        doTakeProfitLogic();
        break;
      }
      price = use_mean_price ? meanPrice : candle.low;
      if (stopLoss && price <= stopLoss) {
        doStopLossLogic();
        break;
      }
    } else { // Short
      let price = use_mean_price ? meanPrice : candle.low;
      if (takeProfit && price <= takeProfit) {
        doTakeProfitLogic()
        break;
      }
      price = use_mean_price ? meanPrice : candle.high;
      if (stopLoss && price >= stopLoss) {
        doStopLossLogic();
        break;
      }
    }

        // Trailing stop condition
        if (trailingStopPct) {
          const { isHit, hitPrice } = calculateTrailingStopSequence(data.slice(index, i + 1), trailingStopPct, direction,emaPeriod, exitPriceIsStop);
          if (isHit) {
            trade.exitPrice = hitPrice;
            trade.exitDate = data[i].date;
            trade.duration = i - index;
            trade.exitReason = 'trailing stop';

            // calc isWin roi base don 'Long' short
            trade.priceChange = hitPrice - trade.entryPrice;
            break;
          }
        }


      }
    }

      

    // default roi
    if (trade.direction === 'Long') {
      trade.isWin = trade.priceChange > 0;
      trade.roi = (trade.priceChange / trade.entryPrice) * 100.0;
    } else { // Short
      trade.isWin = trade.priceChange < 0;
      trade.roi = - (trade.priceChange / trade.entryPrice) * 100.0;
    }
    return trade;
  }

  


  
  const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;
  
  var currPrice = null;
  var tradeStartPrice = null;
  if (tradeStartIndex !== null) {

    currPrice = chartData.ohlcData[currentChartIndex].close;
    tradeStartPrice = null;
    if (tradeStartIndex !== null) {
      tradeStartPrice = chartData.ohlcData[tradeStartIndex-1].close; // -1 or else will get +1 
    }
  }

  const MAXIMUM_SKIP_AMOUNT = 300;

  const refreshNewStock = () => {
    // get new stock
    const newStock = getRandomStockOhlc().stock;

    setSelectedStock(newStock);

    resetTradeState(false)

    // useEffect on selectedStock updates chart!
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
      setTrailingStopPct(null); //default value
      setTrailingStop(getCurrentPrice() * 0.9999) // default value before user selects;
      showMessageAndAdjuster('ts');
    }
  };


    const TRADE_FEE = 0.2; // 0.4% fee for each trade
    const feeTotalROI = totalROI - TRADE_FEE*trades.length
    console.log('chartData', chartData)

    const HIDE_STOCK_NAME = true // keep hidden replace with ****

    const showingChartData = chartData.ohlcData.slice(currentChartIndex - candlesAmount, currentChartIndex+1) // +1 to show CURRENT candle too!


    console.log('showingChartData',showingChartData, 'currentChartIndex', currentChartIndex, 'candlesAmount', candlesAmount)
    
    const handleStopPress = () => {
      setStopRequested(true); // Set stop request to true
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


      
      
      <View style={styles.headerContainer}>
        <StockInfoComponent
          selectedStock={selectedStock}
          onSelectStock={setSelectedStock}
          allStockData={ohlcvDataSets.map(({ticker, humanName, category}) => ({ticker, humanName, category}))}
          onRefresh={refreshNewStock}
          hideStockName={HIDE_STOCK_NAME}
        />

          {/* Metrics Button */}
          <View style={styles.statsButtonContainer}>
          <View style={ {flexDirection: 'row'}}>
            <Text style={[styles.totalRoiText, {color: totalROI >= 0 ? 'rgba(0,148,32,1)' : 'red'}]}>{totalROI.toFixed(2)}%</Text>

            <Text style={[styles.totalRoiText, {color: feeTotalROI >= 0 ? 'rgba(0,148,32,1)' : 'red', paddingLeft: 10,fontWeight: 300}]}>{(feeTotalROI).toFixed(2)}%</Text>
            </View>
            <View>
              <Text style={[styles.streakText, losingStreak > 0 && { color: 'red' }]}>
                {winningStreak > 0 ? `${winningStreak}x` : `${losingStreak}x`}
              </Text>

            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
             <Icon name="bar-chart" size={24} color={LIGHT_MODE ? 'black' : 'white'} style={styles.statsButtonImage} />
            </TouchableOpacity>
          </View>
        </View>

      <View style={styles.chartContainer}>
        <CandlestickChartComponent
          ohlc={showingChartData}
          tradeStartIndex={tradeStartIndex}
          currentIndex={currentChartIndex}
          currPrice={currPrice}
          tradeStartPrice={tradeStartPrice}
          takeProfit={takeProfit}
          stopLoss={stopLoss}
          trailingStop={trailingStop}
          height={styles.chartHeightWidth.height}
          width={styles.chartHeightWidth.width}
          hideLinePath={isFastForwardingChart}
          isLong={tradeDirection == 'Long'}
          emaPeriod={emaPeriod}
          useHeikinAshi={useHeikinAshi}
        />

        <View style={{ position: 'absolute', top: 20, left: 20 }}>
          <Text style={{
            color: LIGHT_MODE ? '#808e9b' : '#d2dae2', fontStyle: 'underline', fontSize: 18, 
            textDecorationLine: 'underline',
            
          }}>Length: {candlesAmount}</Text>
          <Slider
            style={{ flex: 1, height: 30, minWidth: 100, paddingTop: 10 }}
            minimumValue={10}
            maximumValue={800}
            step={1}
            value={candlesAmount}
            onSlidingComplete={setCandlesAmount}
            minimumTrackTintColor="#ffa801"
                  maximumTrackTintColor="#d2dae2"
          />
        </View>

        
        
      </View>

    {isFastForwardingChart ? (
      <TouchableOpacity style={styles.stopButton} onPress={handleStopPress}>
        <Text style={styles.stopButtonText}>STOP</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.controlMenu}>
          
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <View>
            <Text style={{ color: LIGHT_MODE ? '#808e9b' : '#d2dae2', fontStyle: 'underline', fontSize: 18, textDecorationLine: 'underline', textAlign: 'right', paddingBottom: 10 }}>
              Skip: {skipCandlesAmount}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Slider
                style={{ flex: 1, height: 30, minWidth: 100, paddingTop: 5 }}
                minimumValue={6}
                maximumValue={MAXIMUM_SKIP_AMOUNT}
                step={1}
                value={skipCandlesAmount}
                onSlidingComplete={setSkipCandlesAmount}
                minimumTrackTintColor="#ffa801"
                maximumTrackTintColor="#d2dae2"
              />
              <TouchableOpacity
                style={[styles.button, { marginLeft: 10 }]}
                onPress={() => fastForwardChart(skipCandlesAmount)}
              >
                <Icon name="fast-forward" size={30} color="white"/>
              </TouchableOpacity>
            </View>
          </View>
        </View>


          <View style={{ flexDirection: 'row', }}> 
            <View style={{ flexDirection: 'row', justifyContent: 'space-around',  }}>
              <TouchableOpacity
                style={[styles.longshortButton, { backgroundColor:  '#4cd137', borderRadius: 50 }]}  
                onPress={() => executeTrade('Long')}
              >
                <Text style={styles.longshortButtonText}>Long </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.longshortButton, { backgroundColor: '#EA2027', borderRadius: 50 }]} 
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
                  borderColor: trailingStop ? 'rgba(255,153,221,1)' : 'rgba(255,153,221,1)',
                  backgroundColor: trailingStop ? 'rgba(255,153,221,1)' : 'white'
                }]}
                onPress={toggleTrailingStop}
              >
                <Text style={[styles.tpsltsButtonText, { color: trailingStop ? 'white' : 'rgba(255,153,221,1)' }]}>
                  {trailingStop ? 'Trailing Stop' : 'Trailing Stop'}
                </Text>
              </TouchableOpacity>
              {/* ema period input */}
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Text style={{color:'white', paddingRight: '5px', paddingTop: '12px'}}>Current MA Period: </Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(emaPeriod)}
                    onChangeText={(text) => setEmaPeriod(Number(text))}
                  />
              </View>


            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: 'white', paddingRight: 5 }}>Use Heikin Ashi: </Text>
              <Switch
                value={useHeikinAshi}
                onValueChange={(value) => setUseHeikinAshi(value)}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: 'white', paddingRight: 5 }}>Refresh Chart Each Trade: </Text>
              <Switch
                value={refreshChartEachTrade}
                onValueChange={(value) => setRefreshChartEachTrade(value)}
              />
            </View>
              
            </View>
          </View>
        </View>

          )}
          {showConfetti && (
        <ConfettiCannon
          count={64}
          origin={{ x: wHeight*0.2, y: 0 }}
          fadeOut={true}
          autoStart={false}
          ref={confettiRef}
          fallSpeed={3000} />
      )}

          {/* Draggable Adjuster for TS, TP, SL setting via touch */}
          {showAdjuster && (
            <DraggableAdjuster
              onAdjust={handleAdjust}
              onClose={handleCloseAdjuster}
            />
          )}
          
      {/* GLOBAL FLASH MESSAGE COMPONENT INSTANCE */}
      <FlashMessage position="top" /> {/* <--- here as the last component */}
    </View>
  );
}

const LIGHT_MODE = false // light or dark

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_MODE ? '#d1d8e0' : '#4b4b4b'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 5,
    color: 'white',

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
    height: wHeight * 0.8,
    width: wWidth*0.99-5,
  },
  chartContainer: {
    // align left
    flex: 1,
    
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
    backgroundColor: LIGHT_MODE ? '#a5b1c2' : '#3d3d3d',
    elevation: 10, 
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
  backgroundColor: LIGHT_MODE ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', 
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

});
export default GameScreen;
