const io = require('socket.io-client');
const socket = io('http://localhost:5000');

console.log('Connecting to socket...');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('unit:position', (data) => {
  console.log('Unit Position Update:', data);
});

socket.on('unit:on_scene', (data) => {
  console.log('Unit On Scene:', data);
  process.exit(0);
});

// Trigger dispatch
const axios = require('axios');
axios.post('http://localhost:5000/api/dispatch/108', {
  incidentLat: 13.0,
  incidentLng: 80.0,
  severity: 'CRITICAL',
  requiresALS: true
}).then(res => {
  console.log('Dispatch triggered:', res.data.dispatchId);
}).catch(err => {
  console.error('Dispatch failed:', err.message);
});

setTimeout(() => {
  console.log('Test timeout');
  process.exit(1);
}, 60000);
