const {logInfo, logError} = require("./logger");

const inventory = new Map();

const getInventory = () => {
    const contentArray = Array.from(inventory.entries());
    const contents = contentArray.reduce((contents, [name, quantity]) => {
        return {...contents, [name]: quantity};
    }, {});

    logInfo({contents}, 'fetched contents successfully');
    return {...contents, generatedAt: new Date()};
}

const addToInventory = (item, quantity) => {
    if(!+quantity) {
        logError({item, quantity}, 'Quantity must be a number');
        throw new Error('Quantity must be a number')
    };
    const currentQuantity = inventory.get(item) || 0;
    const newQuantity = currentQuantity + quantity;
    inventory.set(item, newQuantity);
    logInfo({item, newQuantity, memoryUsage: process.memoryUsage().rss}, 'Items added into the inventory successfully.');
    return newQuantity;
}

const removeInventoryFromItem = item => {
    if(!inventory.has(item) || !inventory.get(item) > 0) {
        const err = new Error(`${item} is unavailable.`);
        err.statusCode = 404;
        throw err;
    }

    inventory.set(item, inventory.get(item) - 1);
}

module.exports = {
    inventory,
    addToInventory,
    getInventory,
    removeInventoryFromItem
}