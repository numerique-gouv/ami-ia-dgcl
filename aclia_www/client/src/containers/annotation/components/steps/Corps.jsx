/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Button, Menu, Dropdown, Icon, notification } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { getQuizz } from '../getQuizz.js';
import { randomArrayColor } from '../randomColor.js';
import { handleSelectionPosition } from '../../../../core/utils/selectedText';
//Actions
import * as MeSelector from '../../../../core/redux/Me/selector.js';
import * as RecordActions from '../../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../../core/redux/record/selector.js';
// Composants
import Question from '../Question.jsx';
import NextButton from '../NextButton.jsx';
import AnnotationResume from '../AnnotationResume.jsx';

const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
        message,
        description,
        duration: 3,
    });
};
class Corps extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        question: PropTypes.string,
        nextStep: PropTypes.number.isRequired,
        mainLetterAnnotations: PropTypes.object.isRequired,
        mainLetter: PropTypes.object.isRequired,
        setMainLetterAnnotations: PropTypes.func.isRequired,
        username: PropTypes.string.isRequired,
        pJList: PropTypes.object.isRequired,
        endAnnotation: PropTypes.func.isRequired,
        setAnnotationStep: PropTypes.func.isRequired,
    };
    /**
     * defaultProps - define default value props
     * @desc define not required props
     * @private
     * @version 1.0
     * @since 1.0
     */
    static defaultProps = {
        question: '',
    };

    constructor(props) {
        super(props);
        this.state = {
            question: props.question,
            nextStep: props.nextStep,
            mainLetterAnnotations: props.mainLetterAnnotations,
            mainLetter: props.mainLetter,
            username: props.username,
            pJList: props.pJList,
        };
        this.subConcept = this.subConcept.bind(this);
        this.annotation = this.annotation.bind(this);
        this.trimmedTerm = this.trimmedTerm.bind(this);
        this.handleNextStep = this.handleNextStep.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'mainLetter',
            'mainLetterAnnotations',
            'pJList',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    annotation(value, color) {
        const { mainLetterAnnotations, mainLetter, username } = this.state;
        const mainAnnotations = mainLetterAnnotations.toJS();
        let termPosition = null;
        const selectedTerm = window.getSelection().toString();

        if (selectedTerm !== '') {
            const selection = window.getSelection();
            let node = selection.anchorNode;
            while ( node && node.id !== 'annotation' && node.nodeName !== 'BODY'){
                node = node.parentNode;
            }
            if (node && node.id === 'annotation') {
                if ((termPosition = handleSelectionPosition(selectedTerm))) {
                    const startpos = termPosition.start;
                    const endpos = termPosition.end;
                    const letter = mainLetter.toJS();
                    const timestamp = Date.now();
                    const newAnnotation = {
                        terms: selectedTerm,
                        startpos: startpos,
                        endpos: endpos,
                        concept: value[0],
                        underConcept: value[1] ? value[1] : null,
                        date: timestamp,
                        username: username,
                        code_supression : `${letter.docId}${selectedTerm}${value}${timestamp}`,
                        color: color ? color : null,
                    };
                    if (mainAnnotations && mainAnnotations.corps) {
                        const meta = mainAnnotations.corps;
                        meta.push(newAnnotation);
                        this.props.setMainLetterAnnotations({corps: meta});
                    } else {
                        this.props.setMainLetterAnnotations({corps: [newAnnotation]});
                    }
                    openNotificationWithIcon('success', `l'expression '${this.trimmedTerm(selectedTerm)}' a été sauvegardé`);

                } else {
                    openNotificationWithIcon('error', 'Veuillez sélectionner un terme');
                    return;
                }
            } else {
                openNotificationWithIcon('error', 'Veuillez sélectionner dans l\'acte');
                return;
            }
        } else {
            openNotificationWithIcon('error', 'Veuillez sélectionner un terme');
            return;
        }

    }

    trimmedTerm(str) {
        if (str.length > 300) {
            const trimmedString = str.substr(0, 300);
            return trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(' '))) + '...';
        }
        else {
            return str;
        }
    }

    subConcept(response, value, color) {
        return (
            <Menu>
                { value &&
                    value.map((subResponse) => (
                        <Menu.Item key={ `${subResponse}` }>
                            <Button
                                size="small"
                                style={ { width: '100%' ,color: color, marginBottom:'1px',fontSize:'11px', borderRadius: '2px' } }
                                onClick={ _.partial(this.annotation, [response.concept, subResponse], color) }
                            >
                                { subResponse }
                            </Button>
                        </Menu.Item>
                    ))
                }
            </Menu>
        );
    }

    handleNextStep() {
        const { nextStep, pJList } = this.state;
        if (pJList && pJList.length > 0) {
            this.props.setAnnotationStep(nextStep);
        } else {
            this.props.endAnnotation(1);
            openNotificationWithIcon('info', 'Fin de l\'annotation');
        }
    }

    render() {
        const { question, mainLetterAnnotations, mainLetter } = this.state;
        let mainAnnotations = null;
        let letter = null;
        let quizz = null;
        let colorArray = null;
        if (mainLetterAnnotations) {
            mainAnnotations = mainLetterAnnotations.toJS();
        }
        if (mainLetter) {
            letter = mainLetter.toJS();
        }
        if (mainAnnotations && letter) {
            quizz = getQuizz(mainAnnotations.nature_label, mainAnnotations.matiere_code, letter.isAvenant, letter.isRecrutement);
            colorArray = randomArrayColor(quizz.length);
        }

        if (!quizz && colorArray) {
            return (
                <div>
                    <h1>
                        {'Loading'}
                    </h1>
                </div>
            );
        }

        return (
            <div style={ { minHeight: 'calc(100vh - 109px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }>
                <div style={ {display: 'flex', flexDirection: 'column'} }>
                    <Question question={ question } />
                    <p>
                        {'Surlignez votre texte avec votre souris puis associez ce texte en cliquant sur une des catégories suivantes :'}
                    </p>
                    {
                        quizz.map((response, index) => {
                            return (
                                <React.Fragment key={ `${response.concept}` }>
                                    { response['under-concept'] ?
                                        <Dropdown overlay={ this.subConcept(response, response['under-concept'], colorArray[index]) }>
                                            <Button size={ 'small' } style={ { flex: '1', marginBottom:'12px',fontSize:'14px', textAlign:'left', display: 'flex', alignItems: 'center'} }>
                                                <Icon type="down-square" theme="filled" style={ {fontSize:'14px', color: colorArray[index], marginRight: '5px'} } />
                                                <span style={ {whiteSpace: 'normal'} }>
                                                    { response.concept }
                                                </span>
                                            </Button>
                                        </Dropdown>
                                        :
                                        <Button
                                            size={ 'small' }
                                            style={ { flex: '1', width: '100%',marginBottom:'12px',fontSize:'14px',textAlign:'center', whiteSpace: 'normal' } }
                                            onClick={ _.partial(this.annotation, [response.concept], colorArray[index]) }
                                        >
                                            { response.concept }
                                        </Button>
                                    }
                                </React.Fragment>
                            );
                        })
                    }
                </div>
                <div style={ {display: 'flex', flexWrap: 'wrap'} }>
                    <AnnotationResume />
                    <NextButton disable={ mainAnnotations && mainAnnotations.corps && mainAnnotations.corps.length !== 0 ? true : false } onHandleStep={ this.handleNextStep } styles={ {flex: '1'} } />
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        mainLetterAnnotations: RecordSelector.getMainLetterAnnotations(state),
        mainLetter: RecordSelector.getMainLetter(state),
        username: MeSelector.getName(state),
        pJList: RecordSelector.getPJList(state),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Corps));
