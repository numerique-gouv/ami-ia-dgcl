select
noacte as "nom_lettre",
filename as "filename",
pj_acte_principal as "acte_principal",
iddocument as "docId",
dept as "departement",
statut as "status",
step as "step"
from test_annotations
where pj_acte_principal = $1
AND iddocument = $2
