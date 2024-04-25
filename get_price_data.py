import json
import os
import yfinance as yf
from tqdm import tqdm
import csv
assets = [
    {"ticker": "AAPL", "category": "stock", "human_name": "Apple Inc."},
    {"ticker": "MSFT", "category": "stock", "human_name": "Microsoft Corporation"},
    {"ticker": "GOOGL", "category": "stock", "human_name": "Alphabet Inc."},
    {"ticker": "AMZN", "category": "stock", "human_name": "Amazon.com Inc."},
    {"ticker": "FB", "category": "stock", "human_name": "Meta Platforms Inc."},
    {"ticker": "TSLA", "category": "stock", "human_name": "Tesla Inc."},
    {"ticker": "BRK-B", "category": "stock", "human_name": "Berkshire Hathaway Inc."},
    {"ticker": "V", "category": "stock", "human_name": "Visa Inc."},
    {"ticker": "JNJ", "category": "stock", "human_name": "Johnson & Johnson"},
    {"ticker": "WMT", "category": "stock", "human_name": "Walmart Inc."},
    {"ticker": "PG", "category": "stock", "human_name": "Procter & Gamble Co."},
    {"ticker": "JPM", "category": "stock", "human_name": "JPMorgan Chase & Co."},
    {"ticker": "MA", "category": "stock", "human_name": "Mastercard Incorporated"},
    {"ticker": "UNH", "category": "stock", "human_name": "UnitedHealth Group Incorporated"},
    {"ticker": "NVDA", "category": "stock", "human_name": "NVIDIA Corporation"},
    {"ticker": "HD", "category": "stock", "human_name": "Home Depot Inc."},
    {"ticker": "DIS", "category": "stock", "human_name": "Walt Disney Co."},
    {"ticker": "BABA", "category": "stock", "human_name": "Alibaba Group Holding Limited"},
    {"ticker": "VZ", "category": "stock", "human_name": "Verizon Communications Inc."},
    {"ticker": "PYPL", "category": "stock", "human_name": "PayPal Holdings, Inc."},
    {"ticker": "NFLX", "category": "stock", "human_name": "Netflix Inc."},
    {"ticker": "KO", "category": "stock", "human_name": "Coca-Cola Co"},
    {"ticker": "PFE", "category": "stock", "human_name": "Pfizer Inc."},
    {"ticker": "NKE", "category": "stock", "human_name": "Nike Inc."},
    {"ticker": "MRK", "category": "stock", "human_name": "Merck & Co., Inc."},
    {"ticker": "PEP", "category": "stock", "human_name": "PepsiCo, Inc."},
    {"ticker": "INTC", "category": "stock", "human_name": "Intel Corporation"},
    {"ticker": "CSCO", "category": "stock", "human_name": "Cisco Systems, Inc."},
    {"ticker": "XOM", "category": "stock", "human_name": "Exxon Mobil Corporation"},
    {"ticker": "GS", "category": "stock", "human_name": "Goldman Sachs Group Inc."},
    {"ticker": "BA", "category": "stock", "human_name": "Boeing Co."},
    {"ticker": "IBM", "category": "stock", "human_name": "International Business Machines Corporation"},
    {"ticker": "CAT", "category": "stock", "human_name": "Caterpillar Inc."},
    {"ticker": "MMM", "category": "stock", "human_name": "3M Co"},
    {"ticker": "AXP", "category": "stock", "human_name": "American Express Company"},
    {"ticker": "GE", "category": "stock", "human_name": "General Electric Company"},
    {"ticker": "UPS", "category": "stock", "human_name": "United Parcel Service, Inc."},
    {"ticker": "CRM", "category": "stock", "human_name": "Salesforce.com, Inc."},
    {"ticker": "ORCL", "category": "stock", "human_name": "Oracle Corporation"},
    {"ticker": "SAP", "category": "stock", "human_name": "SAP SE"},
    {"ticker": "BTC", "category": "crypto", "human_name": "Bitcoin"},
    {"ticker": "ETH", "category": "crypto", "human_name": "Ethereum"},
    {"ticker": "XRP", "category": "crypto", "human_name": "XRP"},
    {"ticker": "LTC", "category": "crypto", "human_name": "Litecoin"},
    {"ticker": "BCH", "category": "crypto", "human_name": "Bitcoin Cash"},
    {"ticker": "BNB", "category": "crypto", "human_name": "Binance Coin"},
    {"ticker": "USDT", "category": "crypto", "human_name": "Tether"},
    {"ticker": "SOL", "category": "crypto", "human_name": "Solana"},
    {"ticker": "ADA", "category": "crypto", "human_name": "Cardano"},
    {"ticker": "DOT", "category": "crypto", "human_name": "Polkadot"},
    {"ticker": "DOGE", "category": "crypto", "human_name": "Dogecoin"},
    {"ticker": "UNI", "category": "crypto", "human_name": "Uniswap"},
    {"ticker": "LINK", "category": "crypto", "human_name": "Chainlink"},
    {"ticker": "AVAX", "category": "crypto", "human_name": "Avalanche"},
    {"ticker": "ALGO", "category": "crypto", "human_name": "Algorand"},
    {"ticker": "XTZ", "category": "crypto", "human_name": "Tezos"},
    {"ticker": "ATOM", "category": "crypto", "human_name": "Cosmos"},
    {"ticker": "VET", "category": "crypto", "human_name": "VeChain"},
    {"ticker": "FIL", "category": "crypto", "human_name": "Filecoin"},
    {"ticker": "TRX", "category": "crypto", "human_name": "TRON"},
    {"ticker": "XLM", "category": "crypto", "human_name": "Stellar"},
    {"ticker": "THETA", "category": "crypto", "human_name": "Theta Network"},
    {"ticker": "AAVE", "category": "crypto", "human_name": "Aave"},
    {"ticker": "EOS", "category": "crypto", "human_name": "EOS.IO"},
    {"ticker": "KSM", "category": "crypto", "human_name": "Kusama"},
    {"ticker": "GC", "category": "commodity", "human_name": "Gold Futures"},
    {"ticker": "SI", "category": "commodity", "human_name": "Silver Futures"},
    {"ticker": "HG", "category": "commodity", "human_name": "Copper Futures"},
    {"ticker": "PL", "category": "commodity", "human_name": "Platinum Futures"},
    {"ticker": "PA", "category": "commodity", "human_name": "Palladium Futures"},
    {"ticker": "CL", "category": "commodity", "human_name": "Crude Oil Futures"},
    {"ticker": "NG", "category": "commodity", "human_name": "Natural Gas Futures"},
    {"ticker": "ZC", "category": "commodity", "human_name": "Corn Futures"},
    {"ticker": "ZS", "category": "commodity", "human_name": "Soybean Futures"},
    {"ticker": "ZW", "category": "commodity", "human_name": "Wheat Futures"},
    {"ticker": "CC", "category": "commodity", "human_name": "Cocoa Futures"},
    {"ticker": "SB", "category": "commodity", "human_name": "Sugar Futures"},
    {"ticker": "KC", "category": "commodity", "human_name": "Coffee Futures"},
    {"ticker": "CT", "category": "commodity", "human_name": "Cotton Futures"},
    {"ticker": "OJ", "category": "commodity", "human_name": "Orange Juice Futures"},
    
    # 50 + 20 more
    {"ticker": "ABT", "category": "stock", "human_name": "Abbott Laboratories"},
    {"ticker": "LLY", "category": "stock", "human_name": "Eli Lilly and Company"},
    {"ticker": "MMM", "category": "stock", "human_name": "3M Company"},
    {"ticker": "ACN", "category": "stock", "human_name": "Accenture plc"},
    {"ticker": "ADBE", "category": "stock", "human_name": "Adobe Inc."},
    {"ticker": "ADP", "category": "stock", "human_name": "Automatic Data Processing, Inc."},
    {"ticker": "AIG", "category": "stock", "human_name": "American International Group, Inc."},
    {"ticker": "ALL", "category": "stock", "human_name": "Allstate Corp"},
    {"ticker": "AMGN", "category": "stock", "human_name": "Amgen Inc."},
    {"ticker": "ANTM", "category": "stock", "human_name": "Anthem, Inc."},
    {"ticker": "ADSK", "category": "stock", "human_name": "Autodesk, Inc."},
    {"ticker": "BKNG", "category": "stock", "human_name": "Booking Holdings Inc."},
    {"ticker": "BIIB", "category": "stock", "human_name": "Biogen Inc."},
    {"ticker": "BLK", "category": "stock", "human_name": "BlackRock, Inc."},
    {"ticker": "BMY", "category": "stock", "human_name": "Bristol-Myers Squibb Company"},
    {"ticker": "C", "category": "stock", "human_name": "Citigroup Inc."},
    {"ticker": "CHTR", "category": "stock", "human_name": "Charter Communications, Inc."},
    {"ticker": "CI", "category": "stock", "human_name": "Cigna Corporation"},
    {"ticker": "CLX", "category": "stock", "human_name": "The Clorox Company"},
    {"ticker": "CME", "category": "stock", "human_name": "CME Group Inc."},
    {"ticker": "COST", "category": "stock", "human_name": "Costco Wholesale Corporation"},
    {"ticker": "CSX", "category": "stock", "human_name": "CSX Corporation"},
    {"ticker": "CVS", "category": "stock", "human_name": "CVS Health Corporation"},
    {"ticker": "DHR", "category": "stock", "human_name": "Danaher Corporation"},
    {"ticker": "DOW", "category": "stock", "human_name": "Dow Inc."},
    {"ticker": "DUK", "category": "stock", "human_name": "Duke Energy Corporation"},
    {"ticker": "EMR", "category": "stock", "human_name": "Emerson Electric Co."},
    {"ticker": "EXC", "category": "stock", "human_name": "Exelon Corporation"},
    {"ticker": "F", "category": "stock", "human_name": "Ford Motor Company"},
    {"ticker": "FDX", "category": "stock", "human_name": "FedEx Corporation"},
    {"ticker": "GD", "category": "stock", "human_name": "General Dynamics Corporation"},
    {"ticker": "GILD", "category": "stock", "human_name": "Gilead Sciences, Inc."},
    {"ticker": "HON", "category": "stock", "human_name": "Honeywell International Inc."},
    {"ticker": "IBM", "category": "stock", "human_name": "International Business Machines Corporation"},
    {"ticker": "ICE", "category": "stock", "human_name": "Intercontinental Exchange, Inc."},
    {"ticker": "INTU", "category": "stock", "human_name": "Intuit Inc."},
    {"ticker": "ISRG", "category": "stock", "human_name": "Intuitive Surgical, Inc."},
    {"ticker": "KHC", "category": "stock", "human_name": "The Kraft Heinz Company"},
    {"ticker": "KMI", "category": "stock", "human_name": "Kinder Morgan, Inc."},
    {"ticker": "LMT", "category": "stock", "human_name": "Lockheed Martin Corporation"},
    {"ticker": "LOW", "category": "stock", "human_name": "Lowe's Companies, Inc."},
    {"ticker": "MAR", "category": "stock", "human_name": "Marriott International, Inc."},
    {"ticker": "MCD", "category": "stock", "human_name": "McDonald's Corporation"},
    {"ticker": "MDT", "category": "stock", "human_name": "Medtronic plc"},
    {"ticker": "MET", "category": "stock", "human_name": "MetLife, Inc."},
    {"ticker": "MS", "category": "stock", "human_name": "Morgan Stanley"},
    {"ticker": "NEE", "category": "stock", "human_name": "NextEra Energy, Inc."},
    {"ticker": "NOW", "category": "stock", "human_name": "ServiceNow, Inc."},
    {"ticker": "SHIB", "category": "crypto", "human_name": "Shiba Inu"},
    {"ticker": "MATIC", "category": "crypto", "human_name": "Polygon"},
    {"ticker": "FTT", "category": "crypto", "human_name": "FTX Token"},
    {"ticker": "EGLD", "category": "crypto", "human_name": "Elrond"},
    {"ticker": "NEAR", "category": "crypto", "human_name": "NEAR Protocol"},
    {"ticker": "FLOW", "category": "crypto", "human_name": "Flow"},
    {"ticker": "SAND", "category": "crypto", "human_name": "The Sandbox"},
    {"ticker": "MANA", "category": "crypto", "human_name": "Decentraland"},
    {"ticker": "ENJ", "category": "crypto", "human_name": "Enjin Coin"},
    {"ticker": "AXS", "category": "crypto", "human_name": "Axie Infinity"},
    {"ticker": "ZEC", "category": "crypto", "human_name": "Zcash"},
    {"ticker": "MKR", "category": "crypto", "human_name": "Maker"},
    {"ticker": "COMP", "category": "crypto", "human_name": "Compound"},
    {"ticker": "ZIL", "category": "crypto", "human_name": "Zilliqa"},
    {"ticker": "SNX", "category": "crypto", "human_name": "Synthetix"},
    {"ticker": "YFI", "category": "crypto", "human_name": "yearn.finance"},
    {"ticker": "UMA", "category": "crypto", "human_name": "UMA"},
    {"ticker": "LRC", "category": "crypto", "human_name": "Loopring"},
    {"ticker": "ONE", "category": "crypto", "human_name": "Harmony"},
    {"ticker": "QTUM", "category": "crypto", "human_name": "Qtum"},
    {"ticker": "ICX", "category": "crypto", "human_name": "ICON"}
]


def fetch_data(ticker, timeframe, start_date, end_date):
    data = yf.download(ticker, start=start_date, end=end_date,
                       progress=False, interval=timeframe)
    return data


def write_csv(data, filename):
    data.to_csv(filename)


def csv_to_js(asset, timeframe, csv_filepath, js_filepath):
    data = []
    try:
        with open(csv_filepath, mode='r', newline='', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                entry = {
                    "date": row["Datetime"],
                    "open": row["Open"],
                    "high": row["High"],
                    "low": row["Low"],
                    "close": row["Close"],
                    "volume": row["Volume"]
                }
                data.append(entry)
                
        if not data:
            # error in csv return print error no save to file
            print(f"Error in csv file: '{csv_filepath}'")
            return
        
        # ensure more than 500 rows
        if len(data) < 500:
            print(f"Data for {asset['ticker']}_{timeframe} has less than 500 rows")
            return

        modified_ticker = f"{asset['ticker']}_{timeframe}"
        modified_human_name = f"{asset['human_name']}" #// kep same

        js_data = f'''
const ohlcData = {json.dumps(data)};
const ticker = "{modified_ticker}";
const category = "{asset['category']}";
const humanName = "{modified_human_name}";

export {{ ohlcData, ticker, category, humanName }};
'''

        # with open(js_filepath, 'w', encoding='utf-8') as js_file:
        #     js_file.write(js_data)
        
        # write js to /price_data folder, creating it if it doesn't exist
        with open(f'price_data/{js_filepath}', 'w', encoding='utf-8') as js_file:
            js_file.write(js_data)
            
        # remove the csv file
        os.remove(csv_filepath)
        

        print(f"Data successfully written to {js_filepath}")

    except FileNotFoundError:
        print(f"No such file or directory: '{csv_filepath}'")
    except Exception as e:
        print(f"An error occurred: {str(e)}")


if __name__ == "__main__":

    # Fetching and writing data for 1-hour intervals for the past year
    for asset in tqdm(assets, desc='Downloading 1-hour data'):
        ohlcv_data = fetch_data(
            asset['ticker'], '1h', '2023-04-01', '2024-04-24')
        csv_filename = f'{asset["ticker"].lower()}_1h_data.csv'
        js_filename = f'{asset["ticker"].lower()}_1h_data.js'
        write_csv(ohlcv_data, csv_filename)
        csv_to_js(asset, '1h', csv_filename, js_filename)

    # Fetching and writing data for 15-minute intervals for the past 60 days
    for asset in tqdm(assets, desc='Downloading 15-minute data'):
        ohlcv_data = fetch_data(
            asset['ticker'], '15m', '2024-02-25', '2024-04-24')
        csv_filename = f'{asset["ticker"].lower()}_15m_data.csv'
        js_filename = f'{asset["ticker"].lower()}_15m_data.js'
        write_csv(ohlcv_data, csv_filename)
        csv_to_js(asset, '15m', csv_filename, js_filename)

    # Fetching and writing data for 5-minute intervals for the past 60 days
    for asset in tqdm(assets, desc='Downloading 5-minute data'):
        ohlcv_data = fetch_data(
            asset['ticker'], '5m', '2024-02-25', '2024-04-24')
        csv_filename = f'{asset["ticker"].lower()}_5m_data.csv'
        js_filename = f'{asset["ticker"].lower()}_5m_data.js'
        write_csv(ohlcv_data, csv_filename)
        csv_to_js(asset, '5m', csv_filename, js_filename)
