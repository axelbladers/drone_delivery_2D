const WebSocket = require('ws');

// Define Drone class
class Drone {
  constructor(type, maxLoad, powerConsumption, batteryLevel) {
    this.type = type;
    this.maxLoad = maxLoad; // Maximum load capacity in kilograms
    this.powerConsumption = powerConsumption; // Power consumption in W per kg per minute
    this.batteryLevel = batteryLevel; // Current battery level in percentage
  }

  // Method to calculate power consumption based on load
  calculatePowerConsumption() {
    return Math.round(this.maxLoad * this.powerConsumption);
  }
}

// Define ChargingStation class
class ChargingStation {
  constructor(type, price, chargingRate, maxDrones) {
    this.type = type;
    this.price = price; // Price of the charging station
    this.chargingRate = chargingRate; // Charging rate in percentage per minute
    this.maxDrones = maxDrones; // Maximum number of drones the station can accommodate
    this.drones = []; // Array to hold drones at the station
  }

  // Method to calculate charging time for drones at the station
  calculateChargingTime() {
    let maxChargingTime = 0;
    for (let drone of this.drones) {
      const chargingTime = (100 - drone.batteryLevel) / this.chargingRate;
      if (chargingTime > maxChargingTime) {
        maxChargingTime = chargingTime;
      }
    }
    return maxChargingTime;
  }
}

// Function to simulate charging process
function simulateCharging(drone, chargingStation, fastChargingFactor) {
  const chargingTime = (100 - drone.batteryLevel) / chargingStation.chargingRate; // Calculate charging time in minutes
  if (chargingStation.type === "Fast") {
    return chargingTime / fastChargingFactor; // Fast charging
  } else {
    return chargingTime; // Standard charging
  }
}

// Function to get user input for drones using prompt-sync
function getDroneData() {
  const prompt = require('prompt-sync')({sigint: true});

  const numDrones = parseInt(prompt("Enter the number of drones: "));
  const drones = [];
  for (let i = 1; i <= numDrones; i++) {
    const type = prompt(`Enter type for drone ${i} (Normal or Fast): `);
    const maxLoad = parseInt(prompt(`Enter max load for drone ${i} (kg): `));
    const powerConsumption = parseInt(prompt(`Enter power consumption for drone ${i} (W per kg per minute): `));
    const batteryLevel = parseInt(prompt(`Enter battery level for drone ${i} (percentage): `));
    drones.push(new Drone(type, maxLoad, powerConsumption, batteryLevel));
  }
  return drones;
}

// Function to add new orders
function addNewOrders() {
  const prompt = require('prompt-sync')({sigint: true});

  const numOrders = parseInt(prompt("Enter the number of new orders: "));
  const orders = [];
  for (let i = 1; i <= numOrders; i++) {
    const order = prompt(`Enter details for order ${i} (e.g., destination, weight): `);
    orders.push(order);
  }
  return orders;
}

// Function to display order statuses
function displayOrderStatuses(orders) {
  console.log("Order statuses:");
  orders.forEach(order => {
    console.log(order);
  });
}

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Handle WebSocket connections
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    // Handle messages from clients
    console.log('received: %s', message);
  });

  // Send initial message to client
  ws.send('Connection established. Ready to receive data.');
});

// Example usage
const fastChargingFactor = 2; // Fast charging factor

// Get drone data from user
const drones = getDroneData();

// Input data for charging stations (assuming these remain constant)
const cheapestStation = new ChargingStation("Cheapest", 100, 10, 5); // Type, price, charging rate, max drones
const normalStation = new ChargingStation("Normal", 200, 5, 5);
const fastStation = new ChargingStation("Fast", 300, 20, 2);

// Assign drones to stations (assuming this remains constant)
cheapestStation.drones = drones.slice(0, 2); // Assign first 2 drones
normalStation.drones = drones.slice(2, 3); // Assign 3rd drone
fastStation.drones = drones.slice(3); // Assign remaining drones

// Output charging time for each drone at each station
console.log("Charging time for drones at each station:");
cheapestStation.drones.forEach(drone => {
  console.log(`Cheapest Station for Drone ${drone.type} - ${simulateCharging(drone, cheapestStation, fastChargingFactor)} minutes`);
});
normalStation.drones.forEach(drone => {
  console.log(`Normal Station: Drone ${drone.type} - ${simulateCharging(drone, normalStation, fastChargingFactor)} minutes`);
});
fastStation.drones.forEach(drone => {
  console.log(`Fast Station: Drone ${drone.type} - ${simulateCharging(drone, fastStation, fastChargingFactor)} minutes`);
});

// Calculate and output average charging time
const totalChargingTime = cheapestStation.calculateChargingTime() + normalStation.calculateChargingTime() + fastStation.calculateChargingTime();
const averageDeliveryTime = totalChargingTime / drones.length;
console.log(`Average charge time: ${averageDeliveryTime} minutes`);

// Add new orders
const newOrders = addNewOrders();

// Display order statuses
displayOrderStatuses(newOrders);
