/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { notification, Modal } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
//Actions
import * as RecordActions from '../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../core/redux/record/selector.js';
// Components
import ActeConfirmation from './steps/ActeConfirmation.jsx';
import ActeTransmissible from './steps/ActeTransmissible.jsx';
import Corps from './steps/Corps.jsx';
import Matiere from './steps/Matiere.jsx';
import MetaObjet from './steps/MetaObjet.jsx';
import Nature from './steps/Nature.jsx';
import Pj from './steps/Pj.jsx';
// Mock
import { qcm as MockNatureMatiere } from '../../../mock/mock-nature-matiere.js';

const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
        message,
        description,
        duration: 3,
    });
};

class Qcm extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        currentLetter: PropTypes.object,
        step: PropTypes.number,
        mainLetterAnnotations: PropTypes.object,
        setAnnotationStep: PropTypes.func.isRequired,
        setMainLetter: PropTypes.func.isRequired,

        modalConfirm: PropTypes.shape({
            value: PropTypes.string,
            visibility: PropTypes.bool,
            message: PropTypes.string,
        }),
        endAnnotation: PropTypes.func.isRequired,
        setMainLetterAnnotations: PropTypes.func.isRequired,
        pJList: PropTypes.object,
        setStep: PropTypes.func.isRequired,
    };
    /**
     * defaultProps - define default value props
     * @desc define not required props
     * @private
     * @version 1.0
     * @since 1.0
     */
    static defaultProps = {
        currentLetter: null,
        step: null,
        pJList: null,
        mainLetterAnnotations: {},
        modalConfirm: {
            value: null,
            visibility: false,
            message: 'Confirmez-vous ce choix ?',
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            currentLetter: props.currentLetter,
            step: props.step,
            mainLetterAnnotations: props.mainLetterAnnotations,
            modalConfirm: props.modalConfirm,
            disable: props.currentLetter ? false : true,
            pJList: props.pJList,
        };
        this.setModalConfirm = this.setModalConfirm.bind(this);
        this.handleModalConfirm = this.handleModalConfirm.bind(this);
        this.handleStep = this.handleStep.bind(this);
        this.confirmFunc = this.confirmFunc.bind(this);
        this.handleMainLetterAnnotations = this.handleMainLetterAnnotations.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'toAnnot',
            'currentLetter',
            'step',
            'pJList',
            'mainLetterAnnotations',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    handleStep(nextStep) {
        this.props.setAnnotationStep(nextStep);
    }

    setModalConfirm(visibility = this.state.modalConfirm.visibility, value = this.state.modalConfirm.value, message = this.state.modalConfirm.message) {
        this.setState({ modalConfirm: {visibility, value, message} });
    }

    handleModalConfirm(result) {
        let nextStep;
        if (result === true) {
            switch (this.state.modalConfirm.value) {
            case 'OCR illisible':
                this.props.endAnnotation(-1);
                openNotificationWithIcon('info', 'Fin de l\'annotation.');
                break;
            case 'Acte Principal':
                this.props.setMainLetter();
                nextStep = 1;
                break;
            case 'Pas Acte Principal':
                if (this.props.pJList && this.props.pJList.size === 0) {
                    this.props.endAnnotation(-1);
                    openNotificationWithIcon('info', 'Fin de l\'annotation.', 'Il n\'y a pas de pièces jointes attachés à ce dossier.');
                    break;
                }
                this.props.setStep(0.1);
                break;
            case 'Nouvel Acte Principal':
                this.props.setMainLetter();
                nextStep = 1;
                break;
            case 'Aucun Acte Principal':
                this.props.endAnnotation(2);
                openNotificationWithIcon('info', 'Fin de l\'annotation.');
                break;
            case 'Transmissible':
                nextStep = 2;
                this.props.setMainLetterAnnotations({isTransmissible: true});
                break;
            case 'Non transmissible':
                nextStep = 2;
                this.props.setMainLetterAnnotations({isTransmissible: false});
                //                this.props.endAnnotation(5);
                //              openNotificationWithIcon('info', 'Fin de l\'annotation.');
                break;
            case 'Final Annotation':
                this.props.endAnnotation(1);
                openNotificationWithIcon('success', 'Fin de l\'annotation.', 'L\'annotation a été complétée avec succès');
                break;
            default:
                openNotificationWithIcon('error', 'Nous sommes désolé, votre demande n\'a pas pu aboutir.');
            }
            if (nextStep){
                this.handleStep(nextStep);
            }
        }
        this.setModalConfirm(false);
    }

    confirmFunc(value) {
        this.setModalConfirm(true, value[0]);
    }

    handleMainLetterAnnotations(value) {
        this.props.setMainLetterAnnotations(value);
    }

    render() {
        const { modalConfirm, step, currentLetter } = this.state;
        let nextStep = step;
        let stepName;
        let component;
        let question;

        switch (step) {
        case 0.1:
            question = 'Choisissez l’acte principal parmis la liste des pièces jointes à gauche, puis validez.';
            nextStep = 1;
            component = <ActeConfirmation question={ question } step={ step } nextStep={ nextStep } confirmFunc={ this.confirmFunc } />;
            break;
        case 1:
            question = 'Cet acte est-il transmissible ?';
            nextStep = 2;
            component = <ActeTransmissible question={ question } step={ step } nextStep={ nextStep } confirmFunc={ this.confirmFunc } />;
            break;
        case 2:
            stepName = 'nature';
            question = MockNatureMatiere[stepName].content;
            nextStep = 3;
            component = <Nature question={ question } feed={ MockNatureMatiere[stepName] } onNatureSelected={ this.handleMainLetterAnnotations } nextStep={ nextStep } />;
            break;
        case 3:
            stepName = 'matière';
            question = MockNatureMatiere[stepName].content;
            nextStep = 4;
            component = <Matiere question={ question } feed={ MockNatureMatiere[stepName] } nextStep={ nextStep } />;
            break;
        case 4:
            stepName = 'meta';
            question = MockNatureMatiere[stepName].content;
            nextStep = 5;
            component = <MetaObjet question={ question } feed={ MockNatureMatiere[stepName] } currentLetter={ currentLetter } nextStep={ nextStep } />;
            break;
        case 5:
            stepName = 'corps';
            question = 'Annotation des éléments dans le corps de l\'acte (éléments utiles au travail sur la cohérence de l\'objet de l\'acte et éléments utiles au contrôle de légalité)';
            nextStep = 6;
            component = <Corps question={ question } nextStep={ nextStep } />;
            break;
        case 6:
            stepName = 'pj';
            question = MockNatureMatiere[stepName].content;
            component = <Pj question={ question } feed={ MockNatureMatiere[stepName] } confirmFunc={ this.confirmFunc } />;
            break;
        default:
            question = "Ce document est-il l'acte ou est-ce une pièce jointe ?";
            nextStep = 1;
            component = <ActeConfirmation question={ question } step={ step } nextStep={ nextStep } confirmFunc={ this.confirmFunc } />;
        }

        return (
            <div style={ { minHeight:'calc(100vh - 109px)' } }>
                { component }
                {
                    <Modal
                        centered
                        visible={ modalConfirm.visibility }
                        okText="Je confirme"
                        cancelText="Annuler"
                        onOk={ _.partial(this.handleModalConfirm, true) }
                        onCancel={ _.partial(this.handleModalConfirm, false) }
                    >
                        <p style={ {textAlign: 'center', margin: '0', fontSize: '16px'} }>
                            { modalConfirm.message }
                        </p>
                    </Modal>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        step: RecordSelector.getStep(state),
        mainLetterAnnotations: RecordSelector.getMainLetterAnnotations(state),
    };
}
/**
 * @function mapDispatchToProps - redux method
 * @desc make action available in the props component.
 * @param {object} dispatch - redux-thunk dispatcher
 * @return {object} MeActions & AnonymousAddressActions
 * @version 1.0
 * @since 1.0
 * @private
 */
function mapDispatchToProps(dispatch) {
    return bindActionCreators({ ...RecordActions }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Qcm));
