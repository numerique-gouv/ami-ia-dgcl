UPDATE test_annotations
SET
    "pj_acte_principal" = null,
    "statut" = $3
where filename = $1
AND iddocument= $2
