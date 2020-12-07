import argparse

import pandas as pd


def clean_text(objet):
    return objet.replace("'", " ").replace("é", "e").lower()


def regles_transmissible(objet, texte, nature, matiere_1, matiere_2):

    objet = clean_text(objet)
    texte = clean_text(texte)

    # 13/10/2020
    if nature == "1" and matiere_1 == "3" and ("classement" in objet or "declassement" in objet):
        return "deliberation, domaine et patrimoine, classement_declassement", False
    elif nature == "4" and matiere_1 == "1" and ("appel d offre" in objet or "marche" in objet):
        return "convention, commande publique, appel d offre", True
    elif nature == "4" and matiere_1 == "1" and "affermage" in objet:
        return "convention, commande publique, affermage", True
    elif nature == "4" and matiere_1 == "1" and "concession" in objet:
        return "convention, commande publique, concession", True
    elif nature == "3" and (matiere_2 == "4.1" or matiere_2 == "4.2") and "licenciement" in objet:
        return "arrete individuel, personnel contractuel_titulaire, licenciement", True
    elif nature == "3" and matiere_2 == "4.1" and ("embauche" in objet or "recrutement" in objet):
        return "arrete individuel, personnel titulaire, embauche_recrutement", True
    elif (
        nature == "3"
        and matiere_2 == "2.2"
        and (
            "permis de construire" in objet
            or "permis de demolir" in objet
            or "permis d urbanisme" in objet
            or "declaration prealable" in objet
            or "permis d amenager" in objet
        )
    ):
        return "arrete individuel, acte relatif au droit des sols, permis", True
    elif nature == "4" and (matiere_2 == "1.2" or "delegation" in objet):
        return "convention, delegation de service publique_delegation", True
    # 21/10/2020
    elif (nature == "3" or nature == "1") and matiere_2 == "7.5":
        return "subvention", True
    elif nature == "1" and matiere_2 == "7.2":
        return "fiscalite", True
    elif nature == "1" and matiere_2 == "7.1":
        return "decision budgetaire", True
    elif nature == "1" and matiere_1 == "7":
        return "finances locales", True
    elif nature == "1" and matiere_2 == "7.6":
        return "contributions budgetaires", True
    elif nature == "1" and matiere_2 == "5.3":
        return "designation de representants", True
    elif nature == "1" and matiere_2 == "4.5":
        return "regime indemnitaire", True
    elif (
        nature == "1"
        and (matiere_2 == "5.4" or matiere_2 == "5.5")
        and "delegation" in objet
        and ("signature" in objet or "fonction" in objet)
    ):
        return "delegation de signature", True
    elif nature == "1" and matiere_2 == "2.3":
        return "droit de préemption urbain", True
    elif nature == "1" and (
        matiere_2 == "1.1" or matiere_2 == "1.2" or matiere_2 == "1.3" or matiere_2 == "1.5"
    ):
        return "marche public", True
    elif nature == "3" and (
        ("permis" in objet and "construire" in objet)
        or ("certificat" in objet and "ubranisme" in objet)
        or ("permis" in objet and "amenager" in objet)
        or ("permis" in objet and "demolir" in objet)
        or ("declaration" in objet and "prealable" in objet)
    ):
        return "permis de construire", True
    elif nature == "1" and (
        ("plan" in objet and "local" in objet and "urbanisme" in objet)
        or ("plan" in objet and "occupation" in objet and "sol" in objet)
        or ("carte" in objet and "communale" in objet)
    ):
        return "plan local d urbanisme", True
    elif (
        (nature == "2" or nature == "3")
        and (
            matiere_1 == "7"
            or matiere_2 == "5.4"
            or matiere_2 == "5.5"
            or matiere_1 == "1"
            or matiere_2 == "5.8"
            or matiere_2 == "3.1"
            or matiere_2 == "3.2"
            or matiere_2 == "3.3"
        )
        and "2122-22" in texte
    ):
        return "article L.2122-22", True
    # 23/10/2020
    elif (
        (nature == "2" or nature == "3")
        and matiere_2 == "6.1"
        and ("stationner" in texte or "stationnement" in texte)
    ):
        return "stationnement", False
    elif (
        nature == "2"
        and "circuler" in texte
        and ("interdiction" in texte or "interdit" in texte or "reglementation")
    ):
        return "interdiction de circuler", False
    elif (
        nature == "4"
        and matiere_1 == "7"
        and (
            ("garantie" in objet and "emprunt" in objet)
            or ("garantie" in texte and "emprunt" in texte)
        )
    ):
        return "garantie d emprunt", False
    elif (
        nature == "3"
        and matiere_2 == "4.1"
        and (
            "avancement" in objet
            or "detachement" in objet
            or "retraite" in objet
            or "revocation" in objet
        )
    ):
        return "avancement, detachement, retraite ou revocation", False
    else:
        return None, None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Transmissibilite rules")
    parser.add_argument(
        "-d",
        "--data",
        help="Pickle file containing all the data",
        type=str,
        required=True,
    )
    args = parser.parse_args()

    actes_df = pd.read_pickle(args.data)

    prediction_rows = []

    for i, row in actes_df.iterrows():
        regle, prediction = regles_transmissible(
            row["objetacte"],
            row["texte"],
            row["nature"],
            row["matiere_1"],
            row["matiere_2"],
        )

        prediction_rows.append(
            [
                row["filename"],
                row["texte"],
                row["objetacte"],
                row["nature_content"],
                row["matiere_1_nom"],
                row["matiere_2_nom"],
                row["isTransmissible"],
                regle,
                prediction,
            ]
        )

    df = pd.DataFrame(
        prediction_rows,
        columns=[
            "nom_fichier",
            "texte_ocr",
            "objet",
            "nature",
            "matiere_1",
            "matiere_2",
            "transmissible",
            "perimetre_regle",
            "transmissible_prediction",
        ],
    )

    actes_perimetre = df[df["transmissible_prediction"].notnull()]
    print(f"Nombre d'actes total : {len(actes_df)}")
    print(f"Actes dans périmètre : {len(actes_perimetre)}")
    print()

    confusion_matrix = pd.crosstab(
        df["transmissible"],
        df["transmissible_prediction"],
        rownames=["Actual"],
        colnames=["Predicted"],
    )
    print(confusion_matrix)
    writer = pd.ExcelWriter("retour_transmissibilité.xlsx", engine="openpyxl")
    df.to_excel(writer)
    writer.save()
