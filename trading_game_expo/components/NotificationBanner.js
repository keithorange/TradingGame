import React, { useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const NotificationBanner = ({ message }) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (message) {
      const animate = async () => {
        await Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          })
        ]).start();
      };

      animate();
    }
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.notificationContainer, { opacity }]}>
      <Text style={styles.notificationText}>{message}</Text>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 20, // Make sure it's not off-screen
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', // Ensure it's visible
    padding: 10,
    zIndex: 1000, // Ensure it appears above all other content
  },
  notificationText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});


export default NotificationBanner;
