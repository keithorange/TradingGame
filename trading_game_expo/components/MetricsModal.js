import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList } from 'react-native';
import { LineChart, PieChart, BarChart, PopulationPyramid } from 'react-native-gifted-charts';

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
        // label: trade.roi.toFixed(2),
        frontColor: trade.roi >= 0 ? 'green' : 'red',
    }));

    // Charts setup
    const sortedTrades = trades.sort((a, b) => b.roi - a.roi);
    const pyramidData = sortedTrades.map(trade => ({
        left: trade.roi < 0 ? Math.abs(trade.roi) : 0,
        right: trade.roi > 0 ? trade.roi : 0,
        yAxisLabel: trade.roi.toFixed(2)
    }));
    const cumulativeData = barData.reduce((acc, current, index) => {
        const cumulativeValue = index === 0 ? current.value : acc[index - 1].value + current.value;
        acc.push({value: cumulativeValue});
        return acc;
    }, []);

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
                <View style={styles.modalView}>
                    {
                        (trades.length > 0) && (
                            <>
                                <Text style={styles.modalText}>Total ROI: {winLossData.totalROI.toFixed(2)}%</Text>
                                <Text style={styles.modalText}>Wins: {winLossData.wins} Losses: {winLossData.losses} Win Rate: {winRate.toFixed(2)}%</Text>

                                <PieChart
                                    data={pieChartData}
                                    donut

                                    innerRadius={60}
                                    centerLabelComponent={() => <Text style={{ fontSize: 20 }}>Win/Loss</Text>}
                                />

                                <BarChart
                                    data={barData}
                                    showLine
                                    lineData={cumulativeData}
                                    lineConfig={{
                                        color: 'blue',
                                        thickness: 2,
                                        isAnimated: true
                                    }}
                                    width={350}
                                    round={100}
                                    showGradient={false}
                                    initialSpacing={20}
                                />

                                <PopulationPyramid
                                    data={pyramidData}
                                    showMidAxis
                                    
                                    midAxisLabelFontStyle='italic'
                                    midAxisLabelColor='gray'
                                    midAxisLeftColor='red'
                                    midAxisRightColor='green'
                                />

                                <FlatList
                                    data={trades}
                                    height={'20%'}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => <TradeItem item={item} />}
                                    contentContainerStyle={styles.listContainer}
                                    ListHeaderComponent={() => <Text style={styles.listHeader}>Trade Details</Text>}
                                />
                            </>
                        )
                    }
                    {(trades.length === 0) && (
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
        padding: 10
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
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        width: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 3,
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
        paddingBottom: 20,
    },
    listHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'darkblue',
    },
});

export default MetricsModal;
