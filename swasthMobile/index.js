// ✅ index.js - React Native CLI Entry Point
import { AppRegistry } from 'react-native';
import App from './SafeApp'; // ✅ With error boundary
// import App from './App';
// import App from './TestApp';
// import App from './MinimalApp';
// import App from './SimpleApp';
// import App from './WorkingApp';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
