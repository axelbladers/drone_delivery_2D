const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to calculate distance between two points using Euclidean distance formula
function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy)); // Round the result
}

// Function to find the closest warehouse for a given customer
function findClosestWarehouse(customerLocation, warehouses) {
    let closestWarehouse = warehouses[0];
    let minDistance = calculateDistance(customerLocation, warehouses[0].location);

    for (let i = 1; i < warehouses.length; i++) {
        const distance = calculateDistance(customerLocation, warehouses[i].location);
        if (distance < minDistance) {
            minDistance = distance;
            closestWarehouse = warehouses[i];
        }
    }

    return closestWarehouse;
}

// Function to simulate delivery process, calculate total delivery time, count number of drones used, and consider battery consumption
function calculateTotalDeliveryTimeAndDronesAndBattery(warehouses, orders, batteryConsumptionRate, droneCapacity, totalTimeLimit, realTimeLimit, withOutput) {
    let totalTime = 0;
    let dronesUsed = 0;
    const batteryCapacity = 100; // Assume 100% battery capacity
    let batteryLevel = batteryCapacity; // Start with fully charged battery

    const startTime = Date.now();
    const endTime = startTime + realTimeLimit;

    let simulationEndTime = Infinity;
    let elapsedRealTime = 0;

    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        let closestWarehouse = findClosestWarehouse(order.location, warehouses);
        let distanceToWarehouse = calculateDistance(order.location, closestWarehouse.location);

        // Check if drones need to return for recharging
        if (batteryLevel < distanceToWarehouse * batteryConsumptionRate) {
            // If not enough battery to reach the warehouse, go to the closest warehouse and recharge
            closestWarehouse = findClosestWarehouse(closestWarehouse.location, warehouses);
            distanceToWarehouse = calculateDistance(order.location, closestWarehouse.location);
            totalTime += distanceToWarehouse; // Add time to go to the warehouse for recharge
            batteryLevel = batteryCapacity; // Recharge battery to full capacity
        }

        // Calculate delivery time and update battery level
        const deliveryTime = distanceToWarehouse; // Assume 1 unit of distance = 1 unit of time
        totalTime += deliveryTime;
        batteryLevel -= distanceToWarehouse * batteryConsumptionRate;

        // Calculate number of drones needed based on order items and drone capacity
        dronesUsed += Math.ceil(order.items.length / droneCapacity);

        // Check if the time limit has been reached
        if (totalTime >= totalTimeLimit || elapsedRealTime >= realTimeLimit) {
            simulationEndTime = Math.min(totalTime, elapsedRealTime);
            break;
        }

        // Output delivery details if withOutput is true
        if (withOutput) {
            console.log(`Warehouse ${closestWarehouse.name} delivered ${order.items.length} items to ${order.customer} (${order.location.x}, ${order.location.y})`);
            console.log(`Remaining battery: ${batteryLevel.toFixed(2)}%`);
        }

        // Update elapsed real time
        elapsedRealTime = Date.now() - startTime;
    }

    return { totalTime: simulationEndTime === Infinity ? totalTime : simulationEndTime, dronesUsed, batteryLevel };
}

// Function to take manual input for warehouse locations
function inputWarehouses(callback) {
    const warehouses = [];

    rl.question("Enter the number of warehouses:", (numWarehouses) => {
        numWarehouses = parseInt(numWarehouses);

        const inputWarehouse = (index) => {
            if (index < numWarehouses) {
                rl.question(`Enter the name of warehouse ${index + 1}:`, (name) => {
                    rl.question(`Enter the x-coordinate of warehouse ${index + 1}:`, (x) => {
                        x = parseInt(x);
                        rl.question(`Enter the y-coordinate of warehouse ${index + 1}:`, (y) => {
                            y = parseInt(y);
                            warehouses.push({ name, location: { x, y } });
                            inputWarehouse(index + 1);
                        });
                    });
                });
            } else {
                // Proceed to input orders after warehouses are inputted
                callback(warehouses);
            }
        };

        inputWarehouse(0);
    });
}

// Function to take manual input for customer locations and orders
function inputOrders(warehouses, callback) {
    const orders = [];

    rl.question("Enter the number of orders:", (numOrders) => {
        numOrders = parseInt(numOrders);

        const inputOrder = (index) => {
            if (index < numOrders) {
                rl.question(`Enter the name of customer ${index + 1}:`, (customer) => {
                    rl.question(`Enter the x-coordinate of customer ${index + 1}:`, (x) => {
                        x = parseInt(x);
                        rl.question(`Enter the y-coordinate of customer ${index + 1}:`, (y) => {
                            y = parseInt(y);
                            rl.question(`Enter the number of items for customer ${index + 1}:`, (numItems) => {
                                numItems = parseInt(numItems);
                                const items = [];

                                // Input items for the order
                                const inputItem = (j) => {
                                    if (j < numItems) {
                                        rl.question(`Enter item ${j + 1}:`, (item) => {
                                            items.push(item);
                                            inputItem(j + 1);
                                        });
                                    } else {
                                        // Once all items are inputted, push the order to the orders array
                                        orders.push({ customer, location: { x, y }, items });
                                        inputOrder(index + 1); // Process next order
                                    }
                                };

                                inputItem(0); // Start inputting items
                            });
                        });
                    });
                });
            } else {
                // Once all orders are inputted, proceed with the simulation
                callback(warehouses, orders);
            }
        };

        inputOrder(0);
    });
}

// Function to add a new order dynamically during the simulation
function addNewOrder(warehouses, orders, batteryConsumptionRate, droneCapacity, totalTimeLimit, realTimeLimit, withOutput) {
    rl.question("Would you like to add a new order? (yes/no):", (answer) => {
        if (answer.toLowerCase() === "yes") {
            rl.question(`Enter the name of the customer:`, (customer) => {
                rl.question(`Enter the x-coordinate of the customer:`, (x) => {
                    x = parseInt(x);
                    rl.question(`Enter the y-coordinate of the customer:`, (y) => {
                        y = parseInt(y);
                        rl.question(`Enter the number of items for the customer:`, (numItems) => {
                            numItems = parseInt(numItems);
                            const items = [];

                            // Input items for the order
                            const inputItem = (j) => {
                                if (j < numItems) {
                                    rl.question(`Enter item ${j + 1}:`, (item) => {
                                        items.push(item);
                                        inputItem(j + 1);
                                    });
                                } else {
                                    // Once all items are inputted, push the order to the orders array
                                    orders.push({ customer, location: { x, y }, items });
                                    console.log("New order added successfully!");
                                    addNewOrder(warehouses, orders, batteryConsumptionRate, droneCapacity, totalTimeLimit, realTimeLimit, withOutput); // Ask for more orders
                                }
                            };

                            inputItem(0); // Start inputting items
                        });
                    });
                });
            });
        } else {
            // If the user doesn't want to add more orders, proceed with the simulation
            inputDroneDetails(warehouses, orders, batteryConsumptionRate, droneCapacity, totalTimeLimit, realTimeLimit, withOutput);
        }
    });
}

// Function to take manual input for drone details
function inputDroneDetails(warehouses, orders, batteryConsumptionRate, droneCapacity, totalTimeLimit, realTimeLimit, withOutput) {
    rl.question("Enter the drone carrying capacity:", (droneCapacityInput) => {
        droneCapacity = parseInt(droneCapacityInput);
        rl.question("Enter the drone battery consumption rate (e.g., 0.1 for 10%):", (batteryConsumptionRateInput) => {
            batteryConsumptionRate = parseFloat(batteryConsumptionRateInput);

            // Once all inputs are obtained, proceed with the simulation
            const { totalTime, dronesUsed, batteryLevel } = calculateTotalDeliveryTimeAndDronesAndBattery(warehouses, orders, batteryConsumptionRate, droneCapacity, totalTimeLimit, realTimeLimit, withOutput);
            console.log("Total delivery time:", totalTime === Infinity ? "Time limit reached" : totalTime, "units");
            console.log("Number of drones used:", dronesUsed);
            console.log("Battery level after deliveries:", batteryLevel.toFixed(2), "%");

            rl.close();
        });
    });
}

// Function to take manual input for simulation duration and real-time duration
function inputSimulationDuration(callback) {
    rl.question("Enter the simulation duration in minutes:", (totalTimeLimit) => {
        totalTimeLimit = parseInt(totalTimeLimit) * 60 * 1000; // Convert minutes to milliseconds
        rl.question("Enter the real-time duration in milliseconds:", (realTimeLimit) => {
            realTimeLimit = parseInt(realTimeLimit);
            rl.question("Do you want real-time output? (yes/no):", (answer) => {
                const withOutput = answer.toLowerCase() === "yes";
                callback(totalTimeLimit, realTimeLimit, withOutput);
            });
        });
    });
}

// Run the simulation
inputWarehouses((warehouses) => {
    inputOrders(warehouses, (warehouses, orders) => {
        inputSimulationDuration((totalTimeLimit, realTimeLimit, withOutput) => {
            addNewOrder(warehouses, orders, 0.1, 1, totalTimeLimit, realTimeLimit, withOutput); // Assume initial battery consumption rate as 0.1 (10% per unit distance) and drone capacity as 1
        });
    });
});
