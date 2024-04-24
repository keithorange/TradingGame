import React, { useState } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ScrollView, Dimensions } from 'react-native';

const StockInfoComponent = ({ selectedStock, onSelectStock, allStockData, onRefresh, hideStockName }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleSelectStock = (stock) => {
        setDropdownVisible(false);
        onSelectStock(stock.ticker);
    };

    const categorizedData = allStockData.reduce((acc, item) => {
        const categoryUpper = item.category.toUpperCase();
        acc[categoryUpper] = acc[categoryUpper] || [];
        acc[categoryUpper].push(item);
        return acc;
    }, {});

    const renderCategory = ({ item }) => (
        <View style={styles.categoryContainer}>
            <Text style={styles.categoryHeader}>{item.category}</Text>
            {item.data.map((stock) => (
                <TouchableOpacity key={stock.ticker} onPress={() => handleSelectStock(stock)}>
                    <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownTextNormal}>{stock.humanName} </Text>
                        <Text style={styles.dropdownTextBold}>({stock.ticker})</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const stockNameText = hideStockName ? '****' : selectedStock;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.infoContainer} onPress={() => setDropdownVisible(true)}>
                <Text style={styles.text}>{stockNameText} ▼</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Image source={require('../assets/refresh.png')} style={styles.icon} />
            </TouchableOpacity>

            {dropdownVisible && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={dropdownVisible}
                    onRequestClose={() => {
                        setDropdownVisible(!dropdownVisible);
                    }}
                >
                    <ScrollView
                        style={styles.modalView}
                        contentContainerStyle={styles.scrollViewContent} // Ensure this is defined in your styles
                    >
                        <FlatList
                            data={Object.keys(categorizedData).map(key => ({ category: key, data: categorizedData[key] }))}
                            keyExtractor={(item) => item.category}
                            renderItem={renderCategory}
                        />
                    </ScrollView>

                </Modal>
            )}
        </View>
    );
};

const { width: wWidth } = Dimensions.get('window');

const LIGHT_MODE = false;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: LIGHT_MODE ? '#4b4b4b' : '#d1d8e0',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
    },
    refreshButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginLeft: 10,
    },
    icon: {
        width: 25,
        height: 25,
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        backgroundColor: LIGHT_MODE ? '#d1d8e0' : '#4b4b4b',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: '100%',
    },
    scrollViewContent: {
        alignItems: "center", // This was moved from modalView if it was originally there
    },
    dropdownItem: {
        flexDirection: 'row',
        padding: 20,
        marginTop: 5,
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 10,
        alignItems: 'center',
        width: wWidth * 0.9,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dropdownTextNormal: {
        fontSize: 18,
        fontWeight: 'normal',
        color: 'black'
    }
    ,dropdownTextBold: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    categoryContainer: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
    },
    categoryHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 5,
        textTransform: 'uppercase', // Categories in uppercase
        textDecorationLine: 'underline'
    }
});


export default StockInfoComponent;