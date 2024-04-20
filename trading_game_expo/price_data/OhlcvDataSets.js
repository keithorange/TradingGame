// // ohlcvDataSets.js

// import BtcOhlcvData from '../price_data/BtcOhlcvData';
// import EthOhlcvData from '../price_data/EthOhlcvData';
// import AaplOhlcvData from '../price_data/AaplOhlcvData';

// const ohlcvDataSets = {
//   BTC: BtcOhlcvData,
//   ETH: EthOhlcvData,
//   AAPL: AaplOhlcvData,
// };

// export default ohlcvDataSets;

// Helper function to add a timestamp key by converting date to timestamp
function addTimestamps(data) {
    return data.map(entry => {
        const timestamp = new Date(entry.date).getTime();
        return {
            ...entry,
            timestamp: isNaN(timestamp) ? null : timestamp  // Ensuring only valid timestamps are added, otherwise null or handle differently
        };
    });
}

function addDefaultValue(data) {
    return data.map(entry => ({
        ...entry,
        value: data.close 
    }));
}

function numbersToFloat(data) {
    return data.map(entry => ({
        ...entry,
        open: typeof entry.open === 'string' ? parseFloat(entry.open) : entry.open,
        high: typeof entry.high === 'string' ? parseFloat(entry.high) : entry.high,
        low: typeof entry.low === 'string' ? parseFloat(entry.low) : entry.low,
        close: typeof entry.close === 'string' ? parseFloat(entry.close) : entry.close,
        // volume: typeof entry.volume === 'string' ? parseFloat(entry.volume) : entry.volume,
    }));
}

import aaplOhlcvData from "../price_data/aapl_data"
import btcOhlcvData from "../price_data/btc_data"
import ethOhlcvData from "../price_data/eth_data"
import goldOhlcvData from "../price_data/gold_data"
import jpmOhlcvData from "../price_data/jpm_data"
import spyOhlcvData from "../price_data/spy_data"
import dogeOhlcvData from "../price_data/doge_data"
import gasOhlcvData from "../price_data/gas_data"
import googlOhlcvData from "../price_data/googl_data"
import nflxOhlcvData from "../price_data/nflx_data"
import tslaOhlcvData from "../price_data/tsla_data"


const originalOhlcvDataSets = {
    BTC: btcOhlcvData,
    ETH: ethOhlcvData,
    DOGE: dogeOhlcvData,
    SPY: spyOhlcvData,
    AAPL: aaplOhlcvData,
    JPM: jpmOhlcvData,
    GOOGL: googlOhlcvData,
    NFLX: nflxOhlcvData,
    TSLA: tslaOhlcvData,
    Gas: gasOhlcvData,
    Gold: goldOhlcvData,
};

// Transform each dataset to apply addTimestamps and addDefaultValue
const ohlcvDataSets = Object.keys(originalOhlcvDataSets).reduce((acc, key) => {
    acc[key] = addTimestamps(originalOhlcvDataSets[key]);
    return acc;
}, {});

// ensure all are floats
Object.keys(ohlcvDataSets).forEach(key => {
    ohlcvDataSets[key] = numbersToFloat(ohlcvDataSets[key]);
});

// add default value
Object.keys(ohlcvDataSets).forEach(key => {
    ohlcvDataSets[key] = addDefaultValue(ohlcvDataSets[key]);
});

export default ohlcvDataSets;
