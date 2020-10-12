select
iddocument as "docId",
filename as "filename",
noacte as "nom_lettre",
nature as "natureId",
matiere as "matiereId",
objetacte as "object",
dept as "departement",
statut as "status",
step as "step",
is_recrutement as "isRecrutement",
is_avenant as "isAvenant"
from test_annotations
where statut = $1
AND pj_acte_principal is null
