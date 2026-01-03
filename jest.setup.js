jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native', () => {
  const React = require('react');

  const createElement = (name) =>
    React.forwardRef((props, ref) => React.createElement(name, { ...props, ref }, props.children));

  const View = createElement('View');
  const Text = createElement('Text');
  const Pressable = ({ onPress, children, ...rest }) =>
    React.createElement('Pressable', { ...rest, onPress }, children);

  return {
    __esModule: true,
    View,
    Text,
    Pressable,
    StyleSheet: {
      create: (styles) => styles,
    },
  };
});

jest.mock('react-native-reanimated', () => {
  const noop = () => {};

  const Animated = {
    View: 'Animated.View',
    Text: 'Animated.Text',
    // Allow spreading props onto animated components
    createAnimatedComponent: (Component) => Component,
  };

  return {
    __esModule: true,
    default: Animated,
    View: Animated.View,
    Text: Animated.Text,
    useSharedValue: (value) => ({ value }),
    useAnimatedStyle: (styleFn) => styleFn(),
    withTiming: (value) => value,
    withRepeat: (value) => value,
    withSequence: (...values) => values[values.length - 1],
    runOnJS: (fn) => fn,
    Easing: { linear: noop },
  };
});

