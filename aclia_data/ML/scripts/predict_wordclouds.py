"""
predict_wordclouds.py
==========================
Use a trained model to create a wordcloud for each label
"""

import argparse
import os

import matplotlib.pyplot as plt
import pandas as pd
from ML.classifier import classifier_model
from tqdm import tqdm
from wordcloud import WordCloud

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Make predictions with the trained model \
        and create a wordcloud with the most useful features"
    )
    parser.add_argument(
        "-d",
        "--dataset",
        help="Path to the dataset",
        type=str,
        required=False,
        default=None,
    )
    parser.add_argument(
        "-t",
        "--type",
        help="Type of labels to train on",
        type=str,
        required=True,
        choices=[
            "nature",
            "matiere_1",
            "matiere_2_1",
            "matiere_2_2",
            "matiere_2_3",
            "matiere_2_4",
            "matiere_2_5",
            "matiere_2_6",
            "matiere_2_7",
        ],
    )
    parser.add_argument("-m", "--model", help="Trained model", type=str, required=True)
    parser.add_argument(
        "-s",
        "--save",
        help="Path where to save the wordclouds",
        type=str,
        required=False,
        default=None,
    )
    args = parser.parse_args()

    model = classifier_model.Classifier.load_model(args.model)
    actes_df = pd.read_pickle(args.dataset)
    train_df = actes_df[actes_df["split"] == "TRAIN"]
    test_df = actes_df[actes_df["split"] == "TEST"]

    features_by_label = {label: {} for label in model.model.classes_}

    for text in tqdm(actes_df["preprocessed_text"].values):
        if len(text) == 0:
            continue

        prediction, lime_features = model.predict_with_lime(text, num_features=100)

        lime_features = [word for word in lime_features if word[1] > 0]

        features_dict = features_by_label[prediction]

        for i, feature in enumerate(lime_features):
            word = feature[0]
            weight = feature[1]
            if word in features_dict.keys():
                features_dict[word] = features_dict[word] + weight
            else:
                features_dict[word] = weight

        features_by_label[prediction] = features_dict

    if not os.path.exists(args.save):
        os.makedirs(args.save)

    for label in model.model.classes_:
        words_dict = features_by_label[label]
        if len(words_dict) == 0:
            continue

        text = " ".join([(k + " ") * int(v * 100) for k, v in dict(words_dict).items()])

        wordcloud = WordCloud(
            max_words=30, background_color="white", collocations=False, width=1920, height=1080
        ).generate(text)

        plt.figure(figsize=(20, 10), facecolor="k")
        plt.imshow(wordcloud, interpolation="bilinear")
        plt.axis("off")
        plt.savefig(os.path.join(args.save, f"{args.type}_100_features.png"))
