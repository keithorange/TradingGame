import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';

const TradeItem = ({ item }) => {
  return (
    <View style={styles.tradeItemContainer}>
      <Text style={[styles.tradeTitle, { color: item.roi >= 0 ? 'green' : 'red' }]}>
        ROI: {item.roi.toFixed(2)}%
      </Text>
      <Text style={styles.tradeDetails}>Exit Reason: {item.exitReason}</Text>
      <Text style={styles.tradeDetails}>Duration: {item.duration} days</Text>
    </View>
  );
};

const MetricsModal = ({ visible, onClose, trades }) => {
  const winLossData = trades.reduce((acc, trade) => {
    acc.totalROI += trade.roi || 0;
    acc.wins += (trade.isWin ? 1 : 0);
    acc.losses += (trade.isWin ? 0 : 1);
    acc.roiValues.push({ value: trade.roi || 0 });
    return acc;
  }, { totalROI: 0, wins: 0, losses: 0, roiValues: [] });

  const winRate = (winLossData.wins / trades.length) * 100;
  const pieChartData = [
    { value: winLossData.wins, label: 'Wins', color: 'green' },
    { value: winLossData.losses, label: 'Losses', color: 'red' }
  ];

  const barData = trades.map(trade => ({
    value: trade.roi,
    frontColor: trade.roi >= 0 ? 'green' : 'red',
  }));

  const cumulativeData = barData.reduce((acc, current, index) => {
    const cumulativeValue = index === 0 ? current.value : acc[index - 1].value + current.value;
    acc.push({ value: cumulativeValue });
    return acc;
  }, []);

  return (
      <Modal
          style={{flex: 1}}
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ScrollView
        style={styles.centeredView}
        contentContainerStyle={styles.scrollViewContainer}
          >
              <Text style={{fontSize: 40, fontWeight: 'bold', color: 'black', marginBottom: 10, fontUnderline: 'underline'}}>
                    Metrics 
            </Text>
        <View style={styles.modalView}>
          {trades.length > 0 && (
<View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>Total ROI:</Text>
    <Text style={styles.chartValue}>{winLossData.totalROI.toFixed(2)}%</Text>
    <Text style={styles.chartTitle}>Wins:</Text>
    <Text style={styles.chartValue}>{winLossData.wins}</Text>
    <Text style={styles.chartTitle}>Losses:</Text>
    <Text style={styles.chartValue}>{winLossData.losses}</Text>
    <Text style={styles.chartTitle}>Win Rate:</Text>
    <Text style={styles.chartValue}>{winRate.toFixed(2)}%</Text>


              <PieChart
                data={pieChartData}
                donut
                innerRadius={60}
                              centerLabelComponent={() => <Text style={{ fontSize: 20 }}>{ winLossData.totalROI.toFixed(2)}</Text>}
                style={styles.chart}
              />
              <Text style={styles.chartTitle}>ROI Over Time</Text>
              <BarChart
                data={barData}
                showLine
                lineData={cumulativeData}
                lineConfig={{
                  color: 'blue',
                  thickness: 3,
                  isAnimated: true
                }}
                style={styles.chart}
              />
              <FlatList
                data={trades}
                style={styles.listHeight}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <TradeItem item={item} />}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={() => <Text style={styles.listHeader}>Trade Details</Text>}
              />
            </View>
          )}
          {trades.length === 0 && (
            <Text style={styles.title}>No trades yet</Text>
          )}
          <TouchableOpacity
            style={styles.buttonClose}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>Hide Metrics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
      alignItems: 'center',
    width: '100%',
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
      elevation: 5,
    width: '100%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    color: 'darkblue',
    textDecorationLine: 'underline'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
    color: 'green'
  },
  tradeDetails: {
    fontSize: 14,
    marginBottom: 3,
    color: 'black'
  },
  listContainer: {
    flexGrow: 1,
  },
  listHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'darkblue',
  },
  
  chart: {
    marginBottom: 20,
    padding: 10,
    height: '25%', // Fixed height for charts
    width: '100%'
  },
    chartContainer: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: 'grey',
        textDecorationLine: 'underline',
        marginTop: 5,
    },
    chartValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
});

export default MetricsModal;
