import csv
from tqdm import tqdm
import yfinance as yf
import json


def fetch_data(ticker):
    data = yf.download(ticker, start="2023-01-01",
                       end="2024-04-01", progress=False, interval="1h")
    return data



def write_csv(data, filename):
    data.to_csv(filename)


def csv_to_js(csv_filepath, js_filepath):
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

        js_data = 'const ohlcvData = [\n' + ',\n'.join(
            [json.dumps(item) for item in data]) + '\n];\n\nexport default ohlcvData;'

        with open(js_filepath, 'w', encoding='utf-8') as js_file:
            js_file.write(js_data)

        print(f"Data successfully written to {js_filepath}")

    except FileNotFoundError:
        print(f"No such file or directory: '{csv_filepath}'")
    except Exception as e:
        print(f"An error occurred: {str(e)}")


if __name__ == "__main__":
    assets = ["SPY", "AAPL", "GOOGL", "NFLX", "TSLA", "JPM",
              "BTC-USD", "ETH-USD", "DOGE-USD", "GC=F", "CL=F"]
    for asset in tqdm(assets, desc='Downloading asset data'):
        ohlcv_data = fetch_data(asset)
        csv_filename = f'{asset.lower()}_data.csv'
        js_filename = f'{asset.lower()}_data.js'
        write_csv(ohlcv_data, csv_filename)
        csv_to_js(csv_filename, js_filename)
