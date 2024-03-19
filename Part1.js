const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt user for input
function getUserInput() {
    return new Promise((resolve, reject) => {
        const input = {};

        // Prompt for warehouses
        rl.question("Enter the number of warehouses: ", (warehouseCount) => {
            input.warehouses = [];
            getWarehouseInput(0);

            function getWarehouseInput(index) {
                if (index < parseInt(warehouseCount)) {
                    rl.question(`Enter x-coordinate of warehouse ${index + 1}: `, (x) => {
                        rl.question(`Enter y-coordinate of warehouse ${index + 1}: `, (y) => {
                            input.warehouses.push({ x: parseInt(x), y: parseInt(y), name: `Warehouse ${index + 1}` });
                            getWarehouseInput(index + 1);
                        });
                    });
                } else {
                    // Prompt for orders
                    rl.question("Enter the number of orders: ", (orderCount) => {
                        input.orders = [];
                        const orders = parseInt(orderCount);
                        getOrderInput(0, orders);
                    });
                }
            }
        });

        // Function to prompt for order input
        function getOrderInput(index, orders) {
            if (index < orders) {
                const order = {};
                rl.question(`Enter client's name for order ${index + 1}: `, (name) => {
                    order.name = name;
                    rl.question(`Enter x-coordinate of order ${index + 1}: `, (x) => {
                        rl.question(`Enter y-coordinate of order ${index + 1}: `, (y) => {
                            order.coordinates = { x: parseInt(x), y: parseInt(y) };
                            rl.question(`Enter the number of products for order ${index + 1}: `, (productCount) => {
                                order.products = [];
                                getProductInput(0, parseInt(productCount), order, () => {
                                    input.orders.push(order);
                                    getOrderInput(index + 1, orders);
                                });
                            });
                        });
                    });
                });
            } else {
                rl.close();
                resolve(input);
            }
        }

        // Function to prompt for product input
        function getProductInput(productIndex, productCount, order, callback) {
            if (productIndex < productCount) {
                rl.question(`Enter product ${productIndex + 1}: `, (product) => {
                    order.products.push(product);
                    getProductInput(productIndex + 1, productCount, order, callback);
                });
            } else {
                callback();
            }
        }
    });
}

// Function to calculate distance between two points
function calculateDistance(point1, point2) {
    return Math.abs(point2.x - point1.x) + Math.abs(point2.y - point1.y);
}

// Function to calculate delivery time for a single order
function calculateDeliveryTime(order, warehouses) {
    // Find nearest warehouse for the order
    const warehouse = warehouses.reduce((closest, current) =>
        calculateDistance(current, order.coordinates) < calculateDistance(closest, order.coordinates) ? current : closest
    );

    // Calculate distance between warehouse and customer
    const distance = calculateDistance(warehouse, order.coordinates);

    // Calculate delivery time for this order
    const deliveryTime = distance; // Assuming 1 unit/minute speed
    return deliveryTime;
}

// Function to calculate delivery time and drones used
function calculateDelivery(input) {
    let totalDeliveryTime = 0;
    let dronesUsed = 0;
    const deliveryDetails = {};

    // Loop through orders
    for (const order of input.orders) {
        const deliveryTime = calculateDeliveryTime(order, input.warehouses);
        totalDeliveryTime += deliveryTime;

        // Store warehouse assigned to order
        deliveryDetails[order.name] = {
            warehouse: input.warehouses.find(warehouse =>
                calculateDistance(warehouse, order.coordinates) === deliveryTime
            ).name,
            deliveryTime: deliveryTime
        };

        // Each order requires a new drone
        dronesUsed++;
    }

    return { totalDeliveryTime, dronesUsed, deliveryDetails };
}

// Function to assign warehouse to each order
function assignWarehouseToOrder(input) {
    const deliveryDetails = calculateDelivery(input).deliveryDetails;
    for (const [client, details] of Object.entries(deliveryDetails)) {
        console.log(`${details.warehouse} made the delivery to ${client} in ${details.deliveryTime} minutes`);
    }
}

// Main function
async function main() {
    // Get user input
    const input = await getUserInput();

    // Calculate delivery time and drones used
    const { totalDeliveryTime, dronesUsed } = calculateDelivery(input);
    console.log("Total Delivery Time:", totalDeliveryTime, "minutes");
    console.log("Drones Used:", dronesUsed);

    // Assign warehouse to each order
    assignWarehouseToOrder(input);
}

// Run main function
main();
