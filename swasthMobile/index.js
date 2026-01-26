// ✅ index.js - React Native CLI Entry Point
import { AppRegistry } from 'react-native';
import App from './SafeApp';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
