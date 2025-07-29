module.exports = {
  presets: [
    ['babel-preset-expo', { reanimated: false }], // ← 자동 삽입 방지
  ],
  plugins: ['react-native-worklets/plugin'],
};