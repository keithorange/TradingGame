import React from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';


const DraggableAdjuster = ({ onAdjust, onClose }) => {
  let lastY = 0; // Keep track of the last Y position

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      lastY = 0; // Reset on new touch
    },
    onPanResponderMove: (evt, gestureState) => {
      const deltaY = lastY - gestureState.dy; // Calculate change since last event
      const adjustmentFactor = -deltaY / 2000; // Negative to make drag intuitive
      onAdjust(adjustmentFactor);
        lastY = gestureState.dy; // Update lastY to current position
    console.log('lastY', lastY);
    },
    onPanResponderRelease: () => {
      //onClose(); // Close the adjuster when released
    }
  });

return (
  <TouchableOpacity style={{flex: 1, alignItems: 'center', justifyContent: "center"}} onPress={onClose}>
    <View style={styles.overlay} {...panResponder.panHandlers}>
      <View style={styles.draggableContainer}>
        <View pointerEvents="none">
          <Text style={styles.draggableText}>⬆️⬇️</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggableContainer: {
    width: '80%',  // Static size based on parent container
    height: 400,  // Static height
    borderRadius: 10,  // Slightly rounded corners
    backgroundColor: rgba(255,213,209,0.5),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,  // Shadow for Android
    shadowColor: '#000',  // Shadow for iOS
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  draggableText: {
    fontSize: 32,  // Large size for visibility
      color: '#888',  // Grey color for the icon
    userSelect: "none"  // Prevent text selection
  }
});

export default DraggableAdjuster;
