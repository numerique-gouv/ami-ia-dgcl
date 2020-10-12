CREATE TABLE users (
  id bigint NOT NULL,
  "user" varchar(32) NOT NULL,
  pass varchar(128) NOT NULL,
  creation_date timestamp DEFAULT current_timestamp NOT NULL,
  userin varchar,
  PRIMARY KEY(id, "user")
);

INSERT INTO users VALUES (1, 'starclay', 'dgcl');
UPDATE users SET userin = 'U2FsdGVkX19onGhCMcL/dotaMsFrKvlkuGN6f8XcRXA=';

CREATE TABLE user_log_story (
  username varchar(20),
  date_connexion timestamp
);

CREATE TABLE actes (
  quoted_in_text_site         text            ,
  quoted_in_text_ville        text            ,
  quoted_in_text_exploitant   text            ,
  autre_site_dep              text            ,
  statut                      boolean         ,
  entite_copilotes            text            ,
  nom_lettre                  text            ,
  quoted_in_text_denomination text            ,
  accompagnateur              text            ,
  ville                       text            ,
  agent_charge                text            ,
  entite_pilote               text            ,
  part_irsn_effective_prepa   text            ,
  entite_resp                 text            ,
  quoted_in_text_acronyme     text            ,
  type_inspect                text            ,
  inspect_prog                text            ,
  regroupement                text            ,
  departement                 text            ,
  inspect_inop                text            ,
  date_env_let_suite          text            ,
  "date"                      text            ,
  lettre                      text            ,
  reference_event             text            ,
  date_fin_inspect            text            ,
  part_irsn_effective_inspec  text            ,
  theme_principal_corr        text            ,
  inspect_priorite            text            ,
  theme_principal             text            ,
  mois                        double precision,
  nb_pages                    double precision,
  domaine                     text            ,
  nb_demandes                 double precision,
  quoted_in_text_INB          text            ,
  agent_copilote              text            ,
  part_irsn_attendue_inspect  text            ,
  nb_jour                     text            ,
  id_lettre                   double precision,
  annee                       double precision,
  agent_charge_resp           text            ,
  scope                       text            ,
  id_scope                    bigint
);

CREATE TABLE dw_dossiers_med (
    fichier_source text,
    patient_nom_prenom text,
    patient_age bigint,
    patient_date_naissance text,
    patient_sexe text,
    no_finess_chu bigint,
    no_nip bigint,
    no_examen text,
    date_reception text,
    date_prelevement text,
    medecin_destinataire text,
    date_signature text,
    medecin_signataire text,
    statut integer,
    dossier text
);
INSERT INTO dw_dossiers_med (fichier_source, patient_nom_prenom, patient_age, patient_date_naissance, patient_sexe, no_finess_chu, no_nip, no_examen, date_reception, date_prelevement, medecin_destinataire, date_signature, medecin_signataire, statut, dossier) VALUES ('cas4', 'DOE Jane', 30, '30/01/1989', 'F', 31002533, 201901011, '19T012345', '01/01/2019', '01/01/2019', 'GREY Meredith', '01/01/2019', 'GREY Meredith', 1, 'DEPARTEMENT ANATOMIE ET CYTOLOGIE PATHOLOGIQUES######TUMORECTOMIE SEIN DROIT (QSI) + GANGLIONS SENTINELLES AXILLAIRES######CCI-NST de grade I, RE+, RP+, HER2- + adenofibrome.######EXAMEN MACROSCOPIQUE######- Tumorectomie droite adressee orientee et avec un fil harpon, mesurant 5.5 x 5 x 1.5 cm, encree (noir en lateral, bleu en superficie et vert en profondeur). La piece a ete adressee partiellement ouverte. A la coupe, on met en evidence dans la partie inferieure de la piece une lesion mal visible, induree et tres mal limitee de 0.8 cm (blocs tumoraux representatifs : 3 et 5).######- Ganglions sentinelles axillaires : un ganglion bleu de 0.9 cm et un ganglion non bleu de 0.7 cm ont ete adresses (16, 17).###Ils sont accompagnes d''un ganglion non sentinelle de 0.5 cm (18).######EXAMEN MICROSCOPIQUE######- Tumorectomie droite :###La tumeur correspond a un carcinome infiltrant bien differencie de type non specifique, de grade I de Elston et Ellis (2 + 2 + 1, dont 1 pour les mitoses (0.8 mitose / mm2)). La stroma reaction est fibreuse, peu inflammatoire.###Pas de contingent carcinomateux in situ.######Emboles carcinomateux peri-tumoraux non vus.######La tumeur est situee au plus pres a 0.4 cm de la limite d''exerese inferieure et a plus de 1 cm des limites superieure, externe et interne.######Le parenchyme mammaire adjacent est le siege de foyers de mastose avec adenose sclerosante et microcalcifications benignes. Presence d''un adenofibrome de 0.4 cm dans la partie superieure de la piece. A noter egalement des remaniements cicatriciels et inflammatoires post-biopsiques.######Suite de l''examen 19T012345######Evaluation immunohistochimique (fixation formol)######recepteurs hormonaux (gefpics)###- recepteurs des oestrogenes (clone EP1 - Dako) :###carcinome infiltrant : 100 % de cellules marquees, intensite ++ ; glandes non tumorales : ++###- recepteurs de la progesterone (clone PgR 636 - Dako) :###carcinome infiltrant : heterogene avec 50 % de cellules marquees, intensite + a ++ ; glandes non tumorales : ++######HER2 (clone 4B5 - Ventana) : aucune expression de HER2 (glandes normales negatives, temoin externe conforme).######- Les deux ganglions sentinelles axillaires ont ete examines en coloration standard sur 3 niveaux de coupe : ils sont non envahis.###Le ganglion non sentinelle est egalement indemne.######CONCLUSION######Tumorectomie droite :###- Carcinome infiltrant de type non specifique (OMS 2012) du QSI droit de 0.8 cm, de grade I de Elston et Ellis, RE+, RP+ et sans surexpression de HER2.###Pas de contingent carcinomateux in situ notable.###Emboles carcinomateux peri-tumoraux non vus.###Berges utiles saines avec marge suffisante dans toutes les directions (marge minimale inferieure de 0.4 cm).######- Deux ganglions sentinelles et un ganglion non sentinelle axillaires non envahis.######Classification TNM UICC 2017 : pT1b pN0(sn)######');

CREATE TABLE dw_lettres (
    quoted_in_text_site text,
    quoted_in_text_ville text,
    quoted_in_text_exploitant text,
    autre_site_dep text,
    statut boolean,
    entite_copilotes text,
    nom_lettre text,
    quoted_in_text_denomination text,
    accompagnateur text,
    ville text,
    agent_charge text,
    entite_pilote text,
    part_irsn_effective_prepa text,
    entite_resp text,
    quoted_in_text_acronyme text,
    type_inspect text,
    inspect_prog text,
    regroupement text,
    departement text,
    inspect_inop text,
    date_env_let_suite text,
    date text,
    lettre text,
    reference_event text,
    date_fin_inspect text,
    part_irsn_effective_inspec text,
    theme_principal_corr text,
    inspect_priorite text,
    theme_principal text,
    mois double precision,
    nb_pages double precision,
    domaine text,
    nb_demandes double precision,
    "quoted_in_text_INB" text,
    agent_copilote text,
    part_irsn_attendue_inspect text,
    nb_jour text,
    id_lettre double precision,
    annee double precision,
    agent_charge_resp text,
    scope text,
    id_scope bigint
);
INSERT INTO dw_lettres (quoted_in_text_site, quoted_in_text_ville, quoted_in_text_exploitant, autre_site_dep, statut, entite_copilotes, nom_lettre, quoted_in_text_denomination, accompagnateur, ville, agent_charge, entite_pilote, part_irsn_effective_prepa, entite_resp, quoted_in_text_acronyme, type_inspect, inspect_prog, regroupement, departement, inspect_inop, date_env_let_suite, date, lettre, reference_event, date_fin_inspect, part_irsn_effective_inspec, theme_principal_corr, inspect_priorite, theme_principal, mois, nb_pages, domaine, nb_demandes, "quoted_in_text_INB", agent_copilote, part_irsn_attendue_inspect, nb_jour, id_lettre, annee, agent_charge_resp, scope, id_scope) VALUES (NULL, '[''Gravelines'']', '[''EDF'']', NULL, false, NULL, 'INS-2009-EDFGRA-0010.txt', NULL, NULL, NULL, 'COLONNA Francois', 'Douai', NULL, 'Douai', NULL, 'C : courante', 'Oui', 'Matériels, systèmes', NULL, 'Non', '26/10/2009', '2009-11-17T14:00:49Z', 'Objet : Contrôle des installations nucléaires de base###CNPE de Gravelines – INB n° 96 – 97 – 122###Inspection annoncée INS-2009-EDFGRA-0010 effectuée le 7 octobre 2009###Thème : "Suivi en service: examen de la conformité du supportage des tuyauteries sous pression nucléaires".######Réf. : Loi n° 2006-686 du 13 juin 2006 relative à la transparence et à la sécurité en matière nucléaire, notamment ses articles 4 et 40.######Monsieur le Directeur,######Dans le cadre de ses attributions, l’Autorité de sûreté nucléaire a procédé à une inspection le 07 octobre 2009 sur le site de Gravelines sur le thème de l’examen de la conformité du supportage des tuyauteries sous pression nucléaires.######Suite aux constatations faites à cette occasion par les inspecteurs, j’ai l’honneur de vous communiquer ci-dessous la synthèse de l’inspection ainsi que les principales demandes qui en résultent.######Synthèse de l’inspection######Cette inspection fait suite à la découverte sur le parc en exploitation d’EDF de plusieurs écarts de conformité concernant les supportages d’équipements sous pression nucléaires. Les inspecteurs ont examiné par sondage, sur la base de quatre dossiers de tuyauteries, d’une part la conformité des plans isométriques des tuyauteries sous pression aux dossiers d’analyse du comportement mécanique et d’autre part la conformité des installations à ces plans. L’examen conduit sur la ligne de contournement à l’atmosphère (ligne GCT a) a mis en évidence deux écarts de conformité de l’installation aux dossiers de conception et d’installation.######L’exploitant devra évaluer l’impact de ces écarts sur la démonstration de la tenue mécanique de la tuyauterie GCTa et mettre en œuvre les actions correctives afin de les corriger.######A – Demandes d’actions correctives######Les inspecteurs ont constaté que l’installation de la tuyauterie référencée 1GCT 0002TY n’est pas conforme à son dossier d’analyse du comportement mécanique. L’installation, comme le plan isométrique associé, comporte un support vertical (référence K633-9) qui n’est pas pris en compte dans le dossier d’analyse du comportement mécanique de la tuyauterie.######Je vous demande de justifier le fait que le support vertical référencé K633-9 de la tuyauterie 1GCT 002TY ne soit pas pris en compte dans son dossier d’analyse du comportement mécanique.######Vous avez indiqué aux inspecteurs que l’extrémité de la tuyauterie 1GCT 002 TY comportait un point fixe par l’intermédiaire d’une liaison soudée entre l’extrémité de la tuyauterie et le silencieux mis en place au niveau de l’échappement. Cette liaison, sous réserve de confirmer qu’il s’agit bien d’un point fixe, permet d’assurer la cohérence de l’installation avec le dossier d’analyse du comportement. Toutefois, le plan isométrique ne mentionne pas l’existence d’un tel supportage à l’extrémité de la tuyauterie. De ce fait la cohérence de l’installation au plan isométrique n’est pas assurée.######Je vous demande de justifier votre position consistant à considérer que la liaison soudée entre l’extrémité de la tuyauterie 1 GCT 002 TY et le silencieux constitue un point fixe. Je vous demande de corriger le plan isométrique de cette tuyauterie en conséquence.######Compte tenu du faible nombre de dossiers examinés et de l’écart de conformité constaté entre le plan isométrique et l’installation sur l’un de ces dossiers, il est nécessaire d’étendre l’examen de conformité des tuyauteries sous pression installations aux plans isométriques.######Je vous demande de présenter un plan d’action de vérification de la conformité des tuyauteries sous pression aux plans isométriques.######Les inspecteurs ont constaté que les plans isométriques et les plans élémentaires des supportages des tuyauteries examinés ne sont pas de qualité suffisante pour en permettre une lecture et un examen convenable et sont de ce fait susceptible d’engendrer des appréciations erronées.######Je vous demande de présenter un plan d’action visant à établir des plans isométriques des tuyauteries et des plans élémentaires de supportage d’une qualité permettant une consultation aisée conformément aux dispositions de l’arrêté du 10/08/84.######B – Demandes de compléments######Les inspecteurs ont constaté lors de la visite des installations que le support R 120/6 de la tuyauterie 1 RIS 028 TY constitue un patin libre. Cette caractéristique est reprise dans le dossier d’analyse mécanique de la tuyauterie. Toutefois, le plan élémentaire de ce supportage indique qu’il s’agit d’un support fixe.######Je vous demande de clarifier votre position sur la définition du support R 120/6 établie dans le plan élémentaire de supportage.######Vous voudrez bien me faire part de vos observations et réponses concernant ces points dans un délai qui n''excèdera pas deux mois. Pour les engagements que vous seriez amené à prendre, je vous demande de bien vouloir les identifier clairement et d''en préciser, pour chacun, l''échéance de réalisation.', NULL, '11/06/2009', NULL, 'Contrôle de mise en service et requalification des équipements', NULL, 'E 1.3 - Contrôle de mise en service et requalification des équipements', 11, 3, 'ESP', 7, '[96]', '[''BUSCOT Xavier'']', NULL, NULL, 203204, 2009, 'COLONNA Francois', 'NPX', 0);


CREATE TABLE dw_annotation (
    id_lettre bigint,
    nom_lettre text,
    terms text,
    categorie text,
    sous_categorie text,
    start_terms bigint,
    end_terms bigint,
    username text,
    date_annotation timestamp without time zone,
    scope text
);

CREATE TABLE dw_actes (
    noacte text,
    path text,
    extracted_text text,
    datereception text,
    tierslese text,
    objetacte text,
    dateemissioncollectivite text,
    datepolecompetence text,
    datecertificatnonrecours text,
    datelimiterecours text,
    soumistransmission text,
    zonetextelibre1 text,
    zonetextelibre2 text,
    dateclassement text,
    t_emissionobservation_idlo text,
    t_emetteur_codeemetteur text,
    t_etat_codeetat text,
    t_matiere_codematiere text,
    t_natureacte_codenature text,
    t_planannuelcontrole_codeplan text,
    t_planannuelcontrole_anneeplan text,
    t_site_nodepartement text,
    t_planannuelcontrole_nodep text,
    t_site_noarrondissement text,
    t_planannuelcontrole_noarr text,
    t_matiere_sitedep text,
    t_matiere_sitearr text,
    t_serviceattributaire_code text,
    nocollectivitelocale text,
    idautreacte text,
    acte_sensible text,
    teletransmis text,
    annule text,
    acte_lu text,
    acte_stocke text,
    acte_indestructible text,
    acte_previsualise text,
    type_priorite text,
    base_calcul_delais_recours text,
    t_precontrole_legalite_id text,
    multicanal text,
    date_reception_complete text,
    date_controle text,
    date_rejet_implicite text,
    iddocument text,
    typedoc text,
    lienfichier text,
    objet text,
    refdocument text,
    tailledoc text,
    checksum text,
    dernieremodif text,
    nomextension text,
    pj_principale_normee text,
    t_type_piece_jointe_id text
);

INSERT INTO dw_actes (noacte, path, extracted_text, datereception, tierslese, objetacte, dateemissioncollectivite, datepolecompetence, datecertificatnonrecours, datelimiterecours, soumistransmission, zonetextelibre1, zonetextelibre2, dateclassement, t_emissionobservation_idlo, t_emetteur_codeemetteur, t_etat_codeetat, t_matiere_codematiere, t_natureacte_codenature, t_planannuelcontrole_codeplan, t_planannuelcontrole_anneeplan, t_site_nodepartement, t_planannuelcontrole_nodep, t_site_noarrondissement, t_planannuelcontrole_noarr, t_matiere_sitedep, t_matiere_sitearr, t_serviceattributaire_code, nocollectivitelocale, idautreacte, acte_sensible, teletransmis, annule, acte_lu, acte_stocke, acte_indestructible, acte_previsualise, type_priorite, base_calcul_delais_recours, t_precontrole_legalite_id, multicanal, date_reception_complete, date_controle, date_rejet_implicite, iddocument, typedoc, lienfichier, objet, refdocument, tailledoc, checksum, dernieremodif, nomextension, pj_principale_normee, t_type_piece_jointe_id) VALUES ('030-200066918-20180109-2018_0004-AU', 'documents-AR-actes_DPT30_20180109_20180113\2018\01\09\030-200066918-20180109-2018_0004-AU\21082785_99_AU-030-200066918-20180109-2018_0004-AU-1-1_1.pdf', 'Agglomeration REPUBLIQUE FRANGAISE######w2018/0004
###
###
###
EXTRAIT DU REGISTRE DES DECISIONS###D’ALES AGGLOMERATION###
###
###
###
###
Mairie de Saint Christol lez Alés -###
Service : Education###
Tél : 04.66.60.74.04###
###
Ref : NG/NG 01/2018###
###
###
###
###
Objet_: Signature d’une convention relative a l''organisation d''un séjour dans le cadre
des classes de découverte pour I’école élémentaire Marignac de la Communauté Alés
Agglomération sur la Commune de Saint Christol lez Alés###
###
###
Le Président d’Alés Agglomération,###
###
Vu le Code Général des Collectivités Territoriales,###
###
Vu la Loi n°2001-1168 du 11 décembre 2001 portant Mesures Urgentes de Réformes a
Caractére Economique et Financier (publiée au J.O. du 12 décembre, p 19703),###
###
Vu l''Ordonnance n°2015-899 en date du 23 juillet 2015 et le Décret n°2016-360 du 25 mars
2016 relatifs aux marchés publics modifiés par la Loi n°2016-1691 du 9 décembre 2016
relatif a la transparence, a la lutte contre la corruption et a la modernisation de la vie
économique dite «Loi Sapin Il»,###
###
Vu la Délibération C2017_02_12 du Conseil de Communauté en date du 5 janvier 2017
donnant délégations au Président en vertu de l''article L5211-10 du Code Général des
Collectivités Territoriales,###
###
Considérant qu’il est nécessaire de faire appel a l''Union Départementale Scolaire d''Intérét
Social (UDSIS) afin d’organiser un séjour «classe de voile» dans le cadre d’une classe de
découverte pour les classes de CM2 de l’école élémentaire Marignac de la Communauté
Alés Agglomération sur la Commune de Saint Christol lez Alés du lundi 4 juin 2018 en
matinée au vendredi 8 juin 2018 aprés le repas de midi,###
###
Considérant qu''il est nécessaire de faire appel a I''Union Départementale Scolaire d''Intérét
Social (UDSIS) afin d’héberger en pension complete les enfants des 2 classes ainsi que les
accompagnateurs,###
###
Considérant que cette prestation reléve de la famille 22 3 03 : actions en temps scolaires et
qu''elle constitue conformément a l’article 21 | 2° du Décret du 25 Mars 2016 relatif aux
marchés publics, un ensemble homogéne de prestation en raison de son unité fonctionnelle
propre,###
###
Considérant la nature de cette prestation, que cette derniére peut étre assurée par |''Union
Départementale Scolaire d''Intérét Social (UDSIS) agréé par le Ministére de I''Education
Nationale et par Jeunesse et Sports pour un montant TTC de 7.040€ (sept mille quarante
euros toutes taxes comprises) montant basé sur 28 participants,###
###
Considérant que la proposition de l''Union Départementale Scolaire d''Intérét Social (UDSIS)
est une offre économique avantageuse pour assurer la dite prestation,###
###
DECIDE###
###
ARTICLE 1:###
###
L''Union Départementale Scolaire d''tntérét Social représentée par son Président, M. Jean
ROQUE - Quai Jules Verne - 66755 Saint Cyprien Cedex est retenue au titre de la
prestation « organisation et accueil d’un séjour du lundi 4 juin 2018 en matinée au vendredi 8
juin 2018 aprés le repas de midi » pour un monitant TTC de 7.040€ (sept mille quarante
euros) calcul basé sur 28 participants.###
###
ARTICLE 2:###
Une convention fixant les modalités liées a ce séjour sera signée avec |''Union###
###
Départementale Scolaire d''Intérét Social.###
Une facture sera présentée par et au nom de |''Union Départementale Scolaire d''Intérét###
###
Social - Quai Jules Verne - 66755 Saint Cyprien Cedex.###
ARTICLE 3:###
Monsieur le Directeur Général de la Communauté Alés Agglomération et Monsieur le###
###
Receveur Communautaire, sont chargés, chacun en ce qui le concerne, de I’exécution de la
présente décision.###
Alés,le O09 JAN, 2018###
###
ay###
###
###
La présente décision, a supposer que celle-ci fasse grief, peut faire l''objet, dans un délai de 2 mois a compter de sa notification
ou de sa publication, d‘un recours contentieux auprés du Tribunal Administratif de Nimes ou d''un recours gracieux auprés de la
Communauté Alés Agglomération, étant précisé que celle-ci dispose alors d''un délai de 2 mois pour répondre. Un silence de 2
mois vaut alors décision implicite de rejet. La décision ainsi prise, qu''elle soit expresse ou implicite, pourra elle-méme 6tre
déférée au Tribunal Administratif dans un délai de 2 mois. Conformément aux termes de l''article R.421-7 du Code de Justice
Administrative, les personnes résident outre-mer et a {''étranger disposent d''un délai supplémeniaire de distance de
respectivement de 7 et 2 mois pour saisir le Tribunal.', '2018-01-09 00:00:00+01', '0', 'Signature convention relative à l''organisation d''un séjour de classes de découverte pour l''Ecole Elémentaire Marignac de la Cté Alès Agglo sur la Cne de St Ch. les Alès', '2018-01-09 00:00:00+01', NULL, NULL, '2018-03-12 00:00:00+01', '1', NULL, NULL, '2018-03-13 03:01:29.678447+01', NULL, '116068', '99', '8.1', '6', NULL, NULL, '30', NULL, '2', NULL, '0', '0', 'AG epl cg', '2018_0004', NULL, '0', '1', '0', '0', '0', '0', '0', NULL, '2018-01-09 09:57:42.237+01', NULL, 'f', NULL, NULL, NULL, '21082785', 'acte', '99_AU-030-200066918-20180109-2018_0004-AU-1-1_1.pdf', 'Document acte', '030-200066918-20180109-2018_0004-AU', '145334', 'A95C6F476E35A57D48B800CABBC59050C971C95F', '2018-01-09 09:57:42+01', 'pdf', 't', '55');


CREATE TABLE test_ext_test (
    noacte text,
    path text,
    filename text,
    extracted_text text,
    pdf_type text,
    producer text,
    creation_date text,
    num_pages double precision,
    num_files double precision,
    pj_acte_principal text,
    datereception text,
    tierslese text,
    objetacte text,
    dateemissioncollectivite text,
    datepolecompetence text,
    datecertificatnonrecours text,
    datelimiterecours text,
    soumistransmission text,
    zonetextelibre1 text,
    zonetextelibre2 text,
    dateclassement text,
    t_emissionobservation_idlo text,
    t_emetteur_codeemetteur text,
    t_etat_codeetat text,
    t_matiere_codematiere text,
    t_natureacte_codenature text,
    t_planannuelcontrole_codeplan text,
    t_planannuelcontrole_anneeplan text,
    t_site_nodepartement text,
    t_planannuelcontrole_nodep text,
    t_site_noarrondissement text,
    t_planannuelcontrole_noarr text,
    t_matiere_sitedep text,
    t_matiere_sitearr text,
    t_serviceattributaire_code text,
    nocollectivitelocale text,
    idautreacte text,
    acte_sensible text,
    teletransmis text,
    annule text,
    acte_lu text,
    acte_stocke text,
    acte_indestructible text,
    acte_previsualise text,
    type_priorite text,
    base_calcul_delais_recours text,
    t_precontrole_legalite_id text,
    multicanal text,
    date_reception_complete text,
    date_controle text,
    date_rejet_implicite text,
    iddocument text,
    typedoc text,
    lienfichier text,
    objet text,
    refdocument text,
    tailledoc text,
    checksum text,
    dernieremodif text,
    nomextension text,
    pj_principale_normee text,
    t_type_piece_jointe_id text
);
