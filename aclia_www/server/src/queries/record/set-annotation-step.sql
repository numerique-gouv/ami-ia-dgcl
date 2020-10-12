UPDATE test_annotations
SET
    "step" = $1
where filename = $2
AND iddocument= $3
