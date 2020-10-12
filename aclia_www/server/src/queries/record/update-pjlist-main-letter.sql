UPDATE test_annotations
SET
    "pj_acte_principal" = $1
WHERE "pj_acte_principal" = $2 ;
