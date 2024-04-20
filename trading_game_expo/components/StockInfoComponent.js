import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';

const StockInfoComponent = ({ selectedStock, onSelectStock, stockNames, onRefresh }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleSelectStock = (stock) => {
        onSelectStock(stock);
        setDropdownVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.infoContainer} onPress={() => setDropdownVisible(true)}>
                <Text style={styles.text}>{selectedStock} ▼</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Text>⟳</Text>
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
                    <View style={styles.modalView}>
                        <FlatList
                            data={stockNames}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectStock(item)}>
                                    <Text style={styles.dropdownText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    refreshButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
        marginLeft: 10,
    },
    icon: {
        width: 25,
        height: 25,
    },
    modalView: {
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
        shadowRadius: 3.84,
        elevation: 5
    },
    dropdownItem: {
        padding: 10,
        marginTop: 2,
        backgroundColor: '#f9c2ff',
        borderColor: '#f9c2ff',
        borderWidth: 1,
        fontSize: 16,
        color: 'black',
    },
    dropdownText: {
        fontSize: 16,
        color: 'black'
    }
});

export default StockInfoComponent;
