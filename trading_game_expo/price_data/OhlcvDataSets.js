// Dynamic import setup
//const priceDataContext = require.context('../price_data', true, /\.js$/);

// same thing but ignore 'OhlcvDataSets.js' 
const priceDataContext = require.context('../price_data', true, /^\.\/(?!OhlcvDataSets\.js$).*\.js$/);

// Helper function to add a timestamp key by converting date to timestamp
function addTimestamps(data) {
    return data.map(entry => ({
        ...entry,
        timestamp: new Date(entry.date).getTime() || null
    }));
}

function addDefaultValue(data) {
    return data.map(entry => ({
        ...entry,
        value: (entry.high + entry.low + entry.open + entry.close) / 4
    }));
}

function numbersToFloat(data) {
    return data.map(entry => ({
        ...entry,
        open: parseFloat(entry.open),
        high: parseFloat(entry.high),
        low: parseFloat(entry.low),
        close: parseFloat(entry.close)
    }));
}

console.log("priceDataContext.keys(): ", priceDataContext.keys());

// Transform imported modules into a list of enhanced objects
const ohlcvDataList = priceDataContext.keys().map(path => {
    const { category, ticker, humanName, ohlcData } = priceDataContext(path);

    if (!category || !ticker || !humanName || !ohlcData) {
        console.error(`Invalid data format for ${path}`);
        return null;
    }

    return {
        category,
        ticker,
        humanName,
        ohlcData: addDefaultValue(numbersToFloat(addTimestamps(ohlcData)))
    };

}).filter(item => item !== null); // Filter out any null entries

export default ohlcvDataList;