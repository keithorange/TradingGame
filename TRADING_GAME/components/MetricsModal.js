import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart, ScatterChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, Pie, Scatter, Cell, Area } from 'recharts';

const { width } = Dimensions.get('window');

const MetricsModal = ({ visible, onClose, trades }) => {
  const [profitData, setProfitData] = useState([]);
  const [profitDataWithFees, setProfitDataWithFees] = useState([]);
  const [cumulativeProfitData, setCumulativeProfitData] = useState([]);
  const [profitDistribution, setProfitDistribution] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [tradingPairData, setTradingPairData] = useState([]);
  const [fee, setFee] = useState('0.2');

  const colors = {
    profit: '#4CAF50',
    loss: '#F44336',
    neutral: '#2196F3',
    background: '#F5F5F5',
    text: '#333333',
    grid: '#E0E0E0',
  };

  useEffect(() => {
    if (trades && trades.length > 0) {
      const sortedTrades = [...trades].sort((a, b) => new Date(a.exitDatetime) - new Date(b.exitDatetime));
      updateChartData(sortedTrades, parseFloat(fee));
    }
  }, [trades, fee]);

  const updateChartData = (sortedTrades, feePerTrade) => {
    // Profit over time data
    const profitOverTime = sortedTrades.map((trade, index) => ({
      tradeNumber: index + 1,
      profit: parseFloat(trade.roi.toFixed(2)),
      profitWithFees: parseFloat((trade.roi - feePerTrade).toFixed(2)),
      symbol: trade.symbol
    }));
    setProfitData(profitOverTime);
    setProfitDataWithFees(profitOverTime);

    // Cumulative profit data
    let cumulativeProfit = 0;
    let cumulativeProfitWithFees = 0;
    const cumulativeProfits = sortedTrades.map((trade, index) => {
      cumulativeProfit += trade.roi;
      cumulativeProfitWithFees += (trade.roi - feePerTrade);
      return {
        tradeNumber: index + 1,
        cumulativeProfit: parseFloat(cumulativeProfit.toFixed(2)),
        cumulativeProfitWithFees: parseFloat(cumulativeProfitWithFees.toFixed(2))
      };
    });
    setCumulativeProfitData(cumulativeProfits);

    // Profit distribution data
    const distribution = [
      { range: '<-10%', count: 0 },
      { range: '-10% to -5%', count: 0 },
      { range: '-5% to 0%', count: 0 },
      { range: '0% to 5%', count: 0 },
      { range: '5% to 10%', count: 0 },
      { range: '>10%', count: 0 },
    ];
    sortedTrades.forEach(trade => {
      const profitWithFees = trade.roi - feePerTrade;
      if (profitWithFees < -10) distribution[0].count++;
      else if (profitWithFees < -5) distribution[1].count++;
      else if (profitWithFees < 0) distribution[2].count++;
      else if (profitWithFees < 5) distribution[3].count++;
      else if (profitWithFees < 10) distribution[4].count++;
      else distribution[5].count++;
    });
    setProfitDistribution(distribution);

    // Scatter plot data
    const scatter = sortedTrades.map(trade => ({
      duration: trade.duration,
      profit: parseFloat((trade.roi - feePerTrade).toFixed(2)),
      symbol: trade.symbol
    }));
    setScatterData(scatter);

    // Pie chart data
    const winCount = sortedTrades.filter(trade => (trade.roi - feePerTrade) >= 0).length;
    const lossCount = sortedTrades.length - winCount;
    setPieData([
      { name: 'Wins', value: winCount },
      { name: 'Losses', value: lossCount }
    ]);

    // Trading pair performance data
    const pairPerformance = {};
    sortedTrades.forEach(trade => {
      if (!pairPerformance[trade.symbol]) {
        pairPerformance[trade.symbol] = { totalProfit: 0, count: 0 };
      }
      pairPerformance[trade.symbol].totalProfit += (trade.roi - feePerTrade);
      pairPerformance[trade.symbol].count++;
    });
    const tradingPairPerformance = Object.entries(pairPerformance).map(([symbol, data]) => ({
      symbol,
      averageProfit: parseFloat((data.totalProfit / data.count).toFixed(2)),
      tradeCount: data.count
    }));
    setTradingPairData(tradingPairPerformance);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipLabel}>{`Trade: ${label}`}</Text>
          {payload.map((entry, index) => (
            <Text key={index} style={styles.tooltipValue}>
              {`${entry.name}: ${entry.value}`}
            </Text>
          ))}
          {payload[0].payload.symbol && (
            <Text style={styles.tooltipSymbol}>{`Symbol: ${payload[0].payload.symbol}`}</Text>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ScrollView style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Trade Metrics</Text>

          <View style={styles.feeInputContainer}>
            <Text style={styles.feeInputLabel}>Fee per trade (%):</Text>
            <TextInput
              style={styles.feeInput}
              value={fee}
              onChangeText={setFee}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Profit Over Time</Text>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="tradeNumber" stroke={colors.text} />
                <YAxis stroke={colors.text} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="profit" name="Profit" stroke={colors.profit} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="profitWithFees" name="Profit with Fees" stroke={colors.loss} activeDot={{ r: 8 }} />
                <Area type="monotone" dataKey="profit" fill={colors.profit} fillOpacity={0.1} />
                <Area type="monotone" dataKey="profitWithFees" fill={colors.loss} fillOpacity={0.1} />
              </LineChart>
            </ResponsiveContainer>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Cumulative Profit</Text>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cumulativeProfitData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="tradeNumber" stroke={colors.text} />
                <YAxis stroke={colors.text} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="cumulativeProfit" name="Without Fees" stroke={colors.profit} />
                <Line type="monotone" dataKey="cumulativeProfitWithFees" name="With Fees" stroke={colors.loss} />
                <Area type="monotone" dataKey="cumulativeProfit" fill={colors.profit} fillOpacity={0.1} />
                <Area type="monotone" dataKey="cumulativeProfitWithFees" fill={colors.loss} fillOpacity={0.1} />
              </LineChart>
            </ResponsiveContainer>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Profit Distribution (with Fees)</Text>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={profitDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="range" stroke={colors.text} />
                <YAxis stroke={colors.text} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={colors.neutral} />
              </BarChart>
            </ResponsiveContainer>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Trade Duration vs Profit (with Fees)</Text>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid stroke={colors.grid} />
                <XAxis type="number" dataKey="duration" name="Duration (days)" stroke={colors.text} />
                <YAxis type="number" dataKey="profit" name="Profit (%)" stroke={colors.text} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter name="Trades" data={scatterData} fill={colors.neutral} />
              </ScatterChart>
            </ResponsiveContainer>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Win/Loss Ratio (with Fees)</Text>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell key="cell-0" fill={colors.profit} />
                  <Cell key="cell-1" fill={colors.loss} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Trading Pair Performance</Text>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tradingPairData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="symbol" stroke={colors.text} />
                <YAxis stroke={colors.text} />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageProfit" name="Avg Profit (%)" fill={colors.profit} />
                <Bar dataKey="tradeCount" name="Trade Count" fill={colors.neutral} />
              </BarChart>
            </ResponsiveContainer>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: width * 0.66,
    alignSelf: 'center',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  feeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  feeInputLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#333333',
  },
  feeInput: {
    width: 60,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  chartContainer: {
    width: '100%',
    marginBottom: 30,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333333',
  },
  tooltipContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tooltipLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  tooltipValue: {
    color: '#666',
  },
  tooltipSymbol: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default MetricsModal;