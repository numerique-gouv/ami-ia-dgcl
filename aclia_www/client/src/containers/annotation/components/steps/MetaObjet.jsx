/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Button, notification, Checkbox } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
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

class MetaObjet extends React.Component {
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
        feed: PropTypes.object.isRequired,
        postAnnotation: PropTypes.func.isRequired,
        currentLetter: PropTypes.object.isRequired,
        setMainLetterAnnotations: PropTypes.func.isRequired,
        username: PropTypes.string.isRequired,
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
            feed: props.feed,
            postAnnotation: props.postAnnotation,
            currentLetter: props.currentLetter,
            username: props.username,
            colorArray: randomArrayColor(props.feed[props.mainLetterAnnotations.toJS().nature_label].length),
            checked: false,
        };
        this.annotation = this.annotation.bind(this);
        this.trimmedTerm = this.trimmedTerm.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'currentLetter',
            'mainLetterAnnotations',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    annotation(value) {
        const { mainLetterAnnotations, currentLetter, username } = this.state;
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
                    const letter = currentLetter.toJS();
                    const timestamp = Date.now();
                    const newAnnotation = {
                        terms: selectedTerm,
                        startpos: startpos,
                        endpos: endpos,
                        categorie: value,
                        date: timestamp,
                        username: username,
                        code_supression : `${letter.docId}${selectedTerm}${value}${timestamp}`,
                    };
                    if (mainAnnotations && mainAnnotations.metaObjet) {
                        const meta = mainAnnotations.metaObjet;
                        meta.push(newAnnotation);
                        this.props.setMainLetterAnnotations({metaObjet: meta});
                    } else {
                        this.props.setMainLetterAnnotations({metaObjet: [newAnnotation]});
                    }
                    openNotificationWithIcon('success', `l'expression '${this.trimmedTerm(selectedTerm)}' a été sauvegardé`);

                } else {
                    openNotificationWithIcon('error', 'Veuillez sélectionner un terme');
                    return;
                }
            } else {
                openNotificationWithIcon('error', 'Veuillez sélectionner dans l\'objet');
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

    handleCheck(event){
        this.setState({checked: event.target.checked});
        if (event.target.checked){
            this.props.setMainLetterAnnotations({metaObjet: null});
        }
    }

    render() {
        const { question, nextStep, feed, mainLetterAnnotations, colorArray, checked } = this.state;
        const mainAnnotations = mainLetterAnnotations.toJS();

        return (
            <div style={ { minHeight: 'calc(100vh - 109px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }>
                <div style={ {display: 'flex', flexDirection: 'column'} }>
                    <Question question={ question } />
                    <p>
                        {'Surlignez votre texte dans l\'objet mentionné par la collectivité avec votre souris puis associez ce texte en cliquant sur une catégorie suivante :'}
                    </p>
                    {
                        <div style={ {display: 'flex', flexDirection: 'column', pointerEvents: checked ? 'none' : 'auto', opacity: checked ? '0.5' : '', background: checked ? '#CCC' : ''} }>
                            {
                                feed[mainAnnotations.nature_label].map((response, index) => {
                                    return (
                                        <Button
                                            key={ response }
                                            onClick={ _.partial(this.annotation, response) }
                                            style={ { flex: '1', padding: '15px 5px' ,color: '#fff', backgroundColor: colorArray[index], marginBottom:'5px', fontSize:'14px', textAlign: 'center', fontWeight: '900', borderRadius: '2px' } }
                                        >
                                            {response}
                                        </Button>
                                    );
                                })
                            }
                        </div>
                    }
                </div>
                <div style={ {display: 'flex', flexWrap: 'wrap'} }>
                    <Checkbox
                        style={ {marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '15px'} }
                        onChange={ this.handleCheck }
                    >
                        {'L\'objet mentionné ne correspond pas au contenu de l\'acte'}
                    </Checkbox>
                    <AnnotationResume />
                    <NextButton disable={ (mainAnnotations && mainAnnotations.metaObjet && mainAnnotations.metaObjet.length !== 0) || checked ? true : false } nextStep={ nextStep } styles={ {flex: '1'} } />
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        mainLetterAnnotations: RecordSelector.getMainLetterAnnotations(state),
        username: MeSelector.getName(state),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MetaObjet));
