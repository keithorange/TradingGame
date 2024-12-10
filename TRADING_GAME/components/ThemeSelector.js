import { StyleSheet, TouchableOpacity, Text } from 'react-native';


const ThemeSelector = ({ currentTheme, themes, onThemeChange }) => {
  const cycleTheme = () => {
    const themeNames = Object.keys(themes);
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    onThemeChange(themeNames[nextIndex]);
  };

  return (
    <TouchableOpacity onPress={cycleTheme} style={styles.container}>
      <Text style={styles.text}>{currentTheme}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
    zIndex: 1,
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
});

export default ThemeSelector;
