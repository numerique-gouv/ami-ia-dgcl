import _ from 'lodash';
import { corpsActe } from '../../../mock/mock-corps-acte.js';

const getQuizz = (nature, matiere, isAvenant, isRecrutement) => {
    const quizz = corpsActe.quizz[nature];
    const defaultAnswer = quizz[0].reponse;
    let answers = null;

    const filteredQuizz = _.filter(quizz, qcm => {
        return qcm.matiere === matiere;
    });

    const isMatiere = filteredQuizz.length > 0;

    const filterQuizz = (arr, filter) => {
        return arr[0].reponse;
        /*        const subFilterQuizz = _.filter(arr, qcm => {
            console.log(qcm[filter[0] === filter[1]]);
            return qcm[filter[0]] === filter[1];
        });
        console.log(subFilterQuizz);
        if (subFilterQuizz.length > 0) {
            return subFilterQuizz[0].reponse;
        } else {
            return defaultAnswer;
        }*/
    };

    switch (nature) {
    case 'DE':
    case 'AR':
        if (isMatiere) {
            answers = filteredQuizz[0].reponse;
        } else {
            answers = defaultAnswer;
        }
        break;
    case 'AI':
        if (isMatiere) {
            if (matiere === 4.1 || matiere === 7.5) {
                answers = filteredQuizz[0].reponse;
            } else if (matiere === 4.2) {
                answers = filterQuizz(filteredQuizz, ['is_recrutement', 'isRecrutement']);

            } else {
                answers = defaultAnswer;
            }
        } else {
            answers = defaultAnswer;
        }
        break;
    case 'CC':
        if (isMatiere) {
            if (matiere === 4.1 || matiere === 7.5) {
                answers = filteredQuizz[0].reponse;
            } else if (matiere === 4.2){
                answers = filterQuizz(filteredQuizz, ['is_recrutement', 'isRecrutement']);

            } else if (matiere === 1.1 || matiere === 1.2){
                answers = filterQuizz(filteredQuizz, ['is_avenant', false]);

            } else {
                answers = defaultAnswer;
            }
        } else {
            answers = defaultAnswer;
        }
        break;
    default:
        answers = defaultAnswer;
    }
    return answers;
};

export { getQuizz };
