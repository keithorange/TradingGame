import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';

const GameModeSelectorComponent = ({ selectedMode, onSelectMode, modeOptions }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Select Game Mode:</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.modeContainer}>
                <Text style={styles.modeText}>{selectedMode} ▼</Text>
            </TouchableOpacity>

            {modalVisible && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <FlatList
                            data={modeOptions}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.dropdownItem} onPress={() => {
                                    onSelectMode(item.value);
                                    setModalVisible(false);
                                }}>
                                    <Text style={styles.dropdownText}>{item.label}</Text>
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
        padding: 10
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    modeContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10
    },
    modeText: {
        fontSize: 16
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        margin: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxHeight: 400, // Manage modal height
        overflow: 'hidden'
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee' // subtle separation between items
    },
    dropdownText: {
        fontSize: 16,
        textAlign: 'center'
    }
});

export default GameModeSelectorComponent;
