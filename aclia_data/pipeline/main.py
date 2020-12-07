"""
main.py
============================================
Run pipelin on data and save result in a csv
"""

import argparse
from time import time

from pipeline import pipeline

if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-d", "--data", help="Path to the compressed data folder", type=str, required=True
    )
    parser.add_argument(
        "-m", "--metadata", help="Path to the compressed metadata folder", type=str, required=True
    )
    parser.add_argument(
        "-s", "--save", default=False, help="Save dataframe as a csv", type=bool, required=False
    )
    parser.add_argument(
        "-o",
        "--output",
        default="./output.csv",
        help="Path to the output file",
        type=str,
        required=False,
    )
    parser.add_argument(
        "-p",
        "--multiprocessing",
        default=True,
        help="Use multiprocessing",
        type=bool,
        required=False,
    )
    parser.add_argument(
        "-c",
        "--num_cores",
        default=4,
        help="Number of cores for the multiprocessing",
        type=int,
        required=False,
    )
    args = parser.parse_args()

    DATA_PATH = args.data
    METADATA_PATH = args.metadata

    start_time = time()

    ppl = pipeline.Pipeline()

    # metadata
    ppl.add_metadata(METADATA_PATH)

    # data
    ppl.add_data(DATA_PATH)

    # join both dataframes
    final_df = ppl.get_full_table()

    if args.save:
        final_df.to_csv(args.output)
        print(f"Dataframe saved to {args.output}")

    print(f"\nSuccessfully executed in {round(time() - start_time, 3)}s")
