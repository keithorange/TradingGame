import React, { useState } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ScrollView } from 'react-native';

const StockInfoComponent = ({ selectedStock, onSelectStock, stockNames, onRefresh }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleSelectStock = (stock) => {
        setDropdownVisible(false);
        onSelectStock(stock);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.infoContainer} onPress={() => setDropdownVisible(true)}>
                <Text style={styles.text}>{selectedStock} ▼</Text>
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
                    <View style={styles.modalView}>
                        <FlatList
                            data={stockNames}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleSelectStock(item)}>
                                    <View style={styles.dropdownItem}>
                                        <Text style={styles.dropdownText}>{item}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Modal>
            )}

        </View>
    );
};

// import dimensions as wWidth and wHeight
import { Dimensions } from 'react-native';

const { width: wWidth, height: wHeight } = Dimensions.get('window');

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
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        backgroundColor: "white",
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
    dropdownItem: {
        flex: 1,
        padding: 20,
        marginTop: 5,
        borderColor: 'gray',
        borderWidth: 2,
        fontSize: 24,
        color: 'black',
        borderRadius: 10,
        alignItems: 'center',
        width: wWidth*0.9,
        
        // make nice elevated card look
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,


    },
    dropdownText: {
        fontSize: 24,
        color: 'black'
    }
});

export default StockInfoComponent;
