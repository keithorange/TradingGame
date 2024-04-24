import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CandlestickChart, LineChart } from 'react-native-wagmi-charts';

import * as d3Shape from 'd3-shape';

const TradeItem = ({ item }) => {
  return (
    <View style={styles.tradeItemContainer}>
      <Text style={[styles.tradeTitle, {color: item.roi >= 0 ? 'green' : 'red'}]}>
        ROI: {item.roi.toFixed(2)}%
          </Text>
        <Text style={styles.tradeDetails}>Exit Reason: {item.exitReason}</Text>
        <Text style={styles.tradeDetails}>Duration: {item.duration} days</Text>
      {/* <Text style={styles.tradeDetails}>Entry Price: ${item.entryPrice.toFixed(2)}</Text>
      <Text style={styles.tradeDetails}>Exit Price: ${item.exitPrice.toFixed(2)}</Text> */}
      {/* <Text style={styles.tradeDetails}>Trade ID: {item.id}</Text> */}
      {/* <Text style={styles.tradeDetails}>Entry Date: {item.entryDate}</Text>
      <Text style={styles.tradeDetails}>Exit Date: {item.exitDate}</Text> */}
    </View>
  );
};




const MetricsModal = ({ visible, onClose, trades }) => {
  
  //  trades = [
  //   { id: 1, roi: 5, isWin: true, type: 'Long', exitReason: 'Profit Target', duration: 5 },
  //   { id: 2, roi: -2, isWin: false, type: 'Short', exitReason: 'Stop Loss', duration: 3 },
  //   { id: 3, roi: 1, isWin: true, type: 'Long', exitReason: 'Profit Target', duration: 7 },
  //    { id: 4, roi: -5, isWin: false, type: 'Short', exitReason: 'Stop Loss', duration: 2 },
    
  //    { id: 5, roi: -5, isWin: false, type: 'Short', exitReason: 'Stop Loss', duration: 2 },
  //    { id: 6, roi: -5, isWin: false, type: 'Short', exitReason: 'Stop Loss', duration: 2 },
  //    { id: 7, roi: -5, isWin: false, type: 'Short', exitReason: 'Stop Loss', duration: 2 },
  //    { id: 8, roi: -5, isWin: false, type: 'Short', exitReason: 'Stop Loss', duration: 2 },
  // ]

  
  const winLossData = {
    totalROI: 0,
    winsLong: 0,
    winsShort: 0,
    lossesLong: 0,
    lossesShort: 0,
    wins: 0,
    losses: 0,
    total: 0,
    winrate: 0,
  };

  trades.forEach((trade, index) => {
    // Calculate running sum of ROI up to and including the current trade
    winLossData.totalROI += trade.roi;

    // Logging the current state and trade info
    console.log('Current State:', winLossData, 'Trade:', trade, 'Index:', index);

    // Accumulate wins and losses for long and short trades
    if (trade.isWin) {
      if (trade.direction === 'Long') {
        winLossData.winsLong++;
      } else if (trade.direction === 'Short') {
        winLossData.winsShort++;
      }
      winLossData.wins++;

    } else {
      if (trade.direction === 'Long') {
        winLossData.lossesLong++;
      } else if (trade.direction === 'Short') {
        winLossData.lossesShort++;
      }
      winLossData.losses++;
    }
    winLossData.total++;
    winLossData.winrate  = (winLossData.wins / winLossData.total) * 100;
  });

  console.log('Final Win/Loss Data:', winLossData);

  
  // Pie chart data with categories
  const pieChartData = [
    { value: winLossData.winsLong, label: 'Win Long', color: 'green' },
    { value: winLossData.winsShort, label: 'Win Short', color: '#90ee90' }, // Pale green
    { value: winLossData.lossesLong, label: 'Lose Long', color: 'red' },
    { value: winLossData.lossesShort, label: 'Lose Short', color: '#ffcccb' } // Pale red
  ];

  // Bar chart data from each trade's ROI
  const roiBarData = trades.map(trade => ({
    value: trade.roi,
    frontColor: trade.isWin ? 'green' : 'red'
  }));
  

  // Line chart data for cumulative total ROI

  // take just roi for each as {value: roi}
  const lineChartData = trades.map(trade => ({
    value: trade.roi
  }));

  // calcualte running sum of roi with list comphresions NO FOR LOOPS
  const cumBarData = lineChartData.map((roi, index) => {
    const sum = lineChartData.slice(0, index + 1).reduce((acc, curr) => acc + curr.value, 0);
    return { value: sum, frontColor: sum > 0 ? 'green' : 'red' };
  });


    
    // PRINT OUT ALL DATA SETS USED SO I CAN COPYU PASTE FROM LOG AND HARDCODE AFERWARDS
    console.log('trades:', trades);

    const {height, width} = Dimensions.get('window');
  
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <ScrollView 
                style={styles.centeredView}
                contentContainerStyle={styles.scrollViewContainer}
            >
                
                    {
            (trades.length > 0) && (
              <View style={styles.modalView}>
                <TouchableOpacity
                        style={styles.buttonClose}
                        onPress={onClose}
                    >
                        <Text style={styles.textStyle}>Hide Metrics</Text>
                </TouchableOpacity>
                
                                <Text style={styles.modalText}>Total ROI: {winLossData.totalROI.toFixed(2)}%</Text>
                                <Text style={styles.modalText}>Wins: {winLossData.wins} Losses: {winLossData.losses} Win Rate: {winLossData.winrate.toFixed(2)}%</Text>

                  

                            <View>
                                <Text style={styles.chartTitle}>Win/Loss Distribution</Text>
                                <PieChart
                                  height={height * 0.2}
                                  width={width * 0.6}
                                  data={pieChartData}
                                  />

                                 <Text style={styles.chartTitle}>Total ROI Over Time</Text> 
                                  {cumBarData.length > 0 && (
                                    <LineChart.Provider data={cumBarData}>
                                      <LineChart yGutter={0} height={height*0.2} width={width*0.8} >
                                        <LineChart.Path color="orange" pathProps={{
                                          isTransitionEnabled: false,
                                          yGutter: 0,
                                          animateOnMount: false,
                          animationDuration: 0,
                                          curve: d3Shape.curveStepBefore
                                        }}>
                                            <LineChart.Dot color="orange" at={cumBarData.length-1}
                            pulseBehaviour={"always"} />
                          
                      {/* line at 0 */}
                          <LineChart.HorizontalLine
                            at={{ value: 0 }}
                            color="grey"  // Color for Stop Loss
                          />
                                        </LineChart.Path>
                                      </LineChart>
                                    </LineChart.Provider>
                                    )}
                                <Text style={styles.chartTitle}>Trade Profits</Text> 
                                {roiBarData.length > 0 && (
                                    <LineChart.Provider data={roiBarData}>
                                      <LineChart yGutter={0}height={height*0.12} width={width*0.8}  >
                                        <LineChart.Path color="orange" pathProps={{
                                          isTransitionEnabled: false,
                                          yGutter: 0,
                                          animateOnMount: false,
                            animationDuration: 0,
                            // no curve just straight lines
                                          curve: d3Shape.curveLinear
                                        }}>
                                            <LineChart.Dot color="orange" at={cumBarData.length-1}
                            pulseBehaviour={"always"} />
                          {/* line at 0 */}
                          <LineChart.HorizontalLine
                            at={{ value: 0 }}
                            color="grey"  // Color for Stop Loss
                          />
                                        </LineChart.Path>
                                      </LineChart>
                                    </LineChart.Provider>
                                    )}


                              <FlatList
                                  data={trades}
                                  height={height*0.2}
                                  keyExtractor={(item) => item.id.toString()}
                                  renderItem={({ item }) => <TradeItem item={item} />}
                                  contentContainerStyle={styles.listContainer}
                                  ListHeaderComponent={() => <Text style={styles.listHeader}>Trade Details</Text>}
                                  />
                            
                        </View>
                    </View>
                        )
                    }
                    {(trades.length === 0) && (
                        <Text style={styles.title}>No trades yet</Text>
                    )}
                    
                    

            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
        marginTop: '2.5%',
    marginHorizontal: '2.5%'
    },
    scrollViewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalView: {
        flex: 1,
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
      alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 16,
        color: 'gray',
        textDecorationLine: 'underline'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textDecorationLine: 'none',
        color: 'black'
    },
    buttonClose: {
        backgroundColor: "#2196F3",
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 20
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    tradeItemContainer: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 3,

        alignItems: 'center',
    },
    tradeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    tradeDetails: {
        fontSize: 14,
        marginBottom: 3,
    },
    listContainer: {
      height: height*0.2
    },
    listHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'darkblue',
    },
});

export default MetricsModal;