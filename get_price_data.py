import json
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
    {"ticker": "OJ", "category": "commodity", "human_name": "Orange Juice Futures"}
]


def fetch_data(ticker):
    data = yf.download(ticker, start="2023-01-01",
                       end="2024-04-01", progress=False, interval="1h")
    return data


def write_csv(data, filename):
    data.to_csv(filename)


def csv_to_js(asset, csv_filepath, js_filepath):
    data = []
    try:
        with open(csv_filepath, mode='r', newline='', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # Datetime,Open,High,Low,Close,Adj Close,Volume
                entry = {
                    "date": row["Datetime"],
                    "open": row["Open"],
                    "high": row["High"],
                    "low": row["Low"],
                    "close": row["Close"],
                    "volume": row["Volume"]
                }
                data.append(entry)

        js_data = f'''
const ohlcData = {json.dumps(data)};
const ticker = "{asset['ticker']}";
const category = "{asset['category']}";
const humanName = "{asset['human_name']}";

export {{ ohlcData, ticker, category, humanName }};
'''

        with open(js_filepath, 'w', encoding='utf-8') as js_file:
            js_file.write(js_data)

        print(f"Data successfully written to {js_filepath}")

    except FileNotFoundError:
        print(f"No such file or directory: '{csv_filepath}'")
    except Exception as e:
        print(f"An error occurred: {str(e)}")


if __name__ == "__main__":

    for asset in tqdm(assets, desc='Downloading asset data'):
        ohlcv_data = fetch_data(asset['ticker'])
        csv_filename = f'{asset["ticker"].lower()}_data.csv'
        js_filename = f'{asset["ticker"].lower()}_data.js'
        write_csv(ohlcv_data, csv_filename)
        csv_to_js(asset, csv_filename, js_filename)
