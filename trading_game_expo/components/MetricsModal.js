import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MetricsModal = ({ visible, onClose, totalROI, wins, losses, winRate, streak }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Total ROI: {totalROI.toFixed(2)}%</Text>
                    <Text style={styles.modalText}>Wins: {wins} Losses: {losses} Win Rate: {winRate.toFixed(2)}%</Text>
                    <Text style={styles.modalText}>Streak: {streak}</Text>
                    <TouchableOpacity
                        style={styles.buttonClose}
                        onPress={onClose}
                    >
                        <Text style={styles.textStyle}>Hide Metrics</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'  // Semi-transparent background
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
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    buttonClose: {
        backgroundColor: "#2196F3",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    statsButtonContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    iconImage: {
        width: 50,
        height: 50,
    },
});


export default MetricsModal;