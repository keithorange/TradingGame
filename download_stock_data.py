import yfinance as yf
import pandas as pd
import json
from datetime import datetime, timedelta
import os
import numpy as np
from asset_names import *


def download_stock_data(symbol, start_date, end_date, interval='5m'):
    """
    Download stock data using yfinance
    """
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(start=start_date, end=end_date, interval=interval)
        return df
    except Exception as e:
        print(f"Error downloading data for {symbol}: {str(e)}")
        return None


# def normalize(data, center=100, range_size=50):
#     """
#     Normalizes price data while preserving exact OHLCV candlestick proportions.

#     Parameters:
#     - data: DataFrame with OHLC columns
#     - center: Target price center (default 100)
#     - range_size: Size of the target range (default 25)

#     Returns:
#     - DataFrame with normalized prices maintaining exact candlestick proportions
#     """
#     result = data.copy()

#     # Fast column filtering using set intersection
#     price_cols = list(set(data.columns) & {'Open', 'High', 'Low', 'Close'})
#     if not price_cols:
#         raise ValueError("No OHLC columns found in data")

#     # Vectorized min/max computation across all price columns at once
#     price_matrix = data[price_cols].values  # Convert to numpy array for speed
#     global_min = np.min(price_matrix)
#     global_max = np.max(price_matrix)

#     if global_max == global_min:
#         return data.copy()

#     # Compute offset once
#     offset = center - range_size/2
#     scale_factor = range_size / (global_max - global_min)

#     # Fast vectorized operations on numpy arrays
#     result = data.copy()
#     result[price_cols] = (price_matrix - global_min) * scale_factor + offset

#     # Vectorized volume normalization if present
#     if 'Volume' in data.columns:
#         volume = data['Volume'].values  # Convert to numpy array
#         vol_min = np.min(volume)
#         vol_max = np.max(volume)
#         if vol_max != vol_min:
#             result['Volume'] = (volume - vol_min) / \
#                 (vol_max - vol_min) * range_size + offset


def normalize(data, center=100, range_size=50, window_size=6000, global_normalization=True):
    """Vectorized price data normalization implementation with strict shape preservation"""

    price_cols = list(set(data.columns) & {'Open', 'High', 'Low', 'Close'})
    if not price_cols:
        raise ValueError(f"No OHLC columns found in data! Columns are {
                         list(data.columns)}")

    result = data.copy()
    original_index = data.index

    offset = center - range_size / 2

    if global_normalization:
        global_min = data['Close'].min()
        global_max = data['Close'].max()

        if global_max == global_min:
            return data.copy()

        scale_factor = range_size / (global_max - global_min)

        for col in price_cols:
            result[col] = (data[col] - global_min) * scale_factor + offset
    else:
        # Vectorized rolling min/max calculation using pandas, based on Close prices
        window_mins = data['Close'].rolling(
            window=window_size, min_periods=1).min()
        window_maxs = data['Close'].rolling(
            window=window_size, min_periods=1).max()

        # Calculate scale factors safely using vectorized operations
        diff = window_maxs - window_mins
        scale_factors = np.where(diff != 0, range_size / diff, 0)

        for col in price_cols:
            result[col] = (data[col] - window_mins) * scale_factors + offset

        # Handle cases where max equals min
        equal_cases = diff == 0
        for col in price_cols:
            result.loc[equal_cases, col] = center

    if 'Volume' in data.columns:
        if global_normalization:
            vol_min = data['Volume'].min()
            vol_max = data['Volume'].max()
        else:
            # Vectorized volume normalization using pandas
            vol_mins = data['Volume'].rolling(
                window=window_size, min_periods=1).min()
            vol_maxs = data['Volume'].rolling(
                window=window_size, min_periods=1).max()
            vol_min = vol_mins
            vol_max = vol_maxs

        vol_range = np.maximum(vol_max - vol_min, 1e-8)
        result['Volume'] = (data['Volume'] - vol_min) / \
            vol_range * range_size + offset

    assert result.shape == data.shape, f"Shape changed during normalization: {
        data.shape} -> {result.shape}"
    assert result.index.equals(
        original_index), "Index changed during normalization"

    return result


def create_js_file(df, symbol, interval, output_dir='price_data!!!'):
    """
    Create JavaScript file with normalized stock data
    """
   # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Convert DataFrame to list of dictionaries
    ohlcv_data = []
    for index, row in df.iterrows():
        data_point = {
            "date": index.strftime("%Y-%m-%d %H:%M:%S"),
            "open": row['Open'],
            "high": row['High'],
            "low": row['Low'],
            "close": row['Close'],
            "volume": row['Volume']
        }
        ohlcv_data.append(data_point)

    # Create JavaScript content
    js_content = f"""const ohlcData = {json.dumps(ohlcv_data, indent=2)};


const ticker = "{symbol}_{interval}_normalized";
const category = "stock";
const humanName = "{symbol} (Normalized)";

export {{ohlcData, ticker, category, humanName}};
"""

    # Save to file
    filename = f"{symbol}_{interval}_normalized.js"
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w') as f:
        f.write(js_content)

    return filepath


def main():
    # Configuration
    # forex + commodities  # us_market_stocks_popular
    # assets = us_market_stocks_popular  # + cryptocurrencies
    # assets = forex + commodities+ cryptocurrencies
    assets =  us_market_stocks# + cryptocurrencies + commodities

    import random
    random.shuffle(assets)

    # n = 180
    # assets = assets[:n]

    # Default dates (last 60 days)

    end_date = datetime.now()
    start_date = end_date - timedelta(days=59)
    interval = '5m'

    # Process each asset
    for symbol in assets:
        print(f"Processing {symbol}...")

        # Download data
        df = download_stock_data(symbol, start_date, end_date, interval)
        if df is None:
            continue

        # Normalize data
        df = normalize(df)

        # Create JS file
        output_file = create_js_file(df, symbol, interval)
        print(f"Created {output_file}")


if __name__ == "__main__":
    main()
