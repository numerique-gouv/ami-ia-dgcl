SELECT dept,
	count(*) as nb_requetes_total,
	sum(case when statut >=1 then 1 else 0 end) as nb_requetes_annotees
FROM test_annotations
WHERE pj_acte_principal is null
GROUP BY dept;
