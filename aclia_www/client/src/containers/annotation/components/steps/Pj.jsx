/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Radio, Icon, notification } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import {Scrollbars} from 'react-custom-scrollbars';
//Actions
import * as MeSelector from '../../../../core/redux/Me/selector.js';
import * as RecordActions from '../../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../../core/redux/record/selector.js';
// Composants
import Question from '../Question.jsx';
import NextButton from '../NextButton.jsx';

const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
        message,
        description,
        duration: 3,
    });
};
class Pj extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        question: PropTypes.string,
        confirmFunc: PropTypes.func.isRequired,
        mainLetterAnnotations: PropTypes.object.isRequired,
        feed: PropTypes.object.isRequired,
        postAnnotation: PropTypes.func.isRequired,
        mainLetter: PropTypes.object.isRequired,
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
            confirmFunc: props.confirmFunc,
            mainLetterAnnotations: props.mainLetterAnnotations,
            feed: props.feed,
            postAnnotation: props.postAnnotation,
            mainLetter: props.mainLetter,
            currentLetter: props.currentLetter,
            username: props.username,
            valueSelected: null,
        };
        this.handlePjSelected = this.handlePjSelected.bind(this);
        this.handlePjConfirm = this.handlePjConfirm.bind(this);
        this.handleAnnotationConfirm = this.handleAnnotationConfirm.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'valueSelected',
            'mainLetter',
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

    handlePjSelected(event) {
        this.setState({valueSelected: event.target.value});
    }

    handlePjConfirm() {
        const { valueSelected, currentLetter, username, mainLetterAnnotations } = this.state;
        const mainAnnotations = mainLetterAnnotations.toJS();
        const letter = currentLetter.toJS();
        const timestamp = Date.now();
        const newPj = {
            docId: letter.docId,
            filename: letter.filename,
            type: valueSelected,
            date: timestamp,
            username: username,
            code_supression : `${letter.docId}${valueSelected}${timestamp}`,
        };
        if (mainAnnotations && mainAnnotations.pj) {
            const pjAnnot = mainAnnotations.pj;
            pjAnnot.map(newAnnot => pjAnnot.find(annot => annot.filename === newAnnot.filename) || newAnnot);
            pjAnnot.push(newPj);
            this.props.setMainLetterAnnotations({pj: pjAnnot});
        } else {
            this.props.setMainLetterAnnotations({pj: [newPj]});
        }
        openNotificationWithIcon('success', `le type '${valueSelected}' a été sauvegardé pour la pièce jointe ${letter.filename}`);
        this.setState({valueSelected: null});
    }

    handleAnnotationConfirm(value) {
        this.state.confirmFunc(value);
    }

    render() {
        const { question, feed, mainLetterAnnotations, valueSelected, currentLetter, mainLetter } = this.state;
        const mainAnnotations = mainLetterAnnotations.toJS();
        const currLetter = currentLetter.toJS();
        const letter = mainLetter.toJS();

        return (
            <div style={ { minHeight: 'calc(100vh - 109px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }>
                <div style={ {display: 'flex', flexDirection: 'column'} }>
                    <Question question={ question } />
                    <p>
                        {'Sélectionnez une pièce jointe à gauche puis choisissez son type dans la listre déroulante suivante avant de valider. '}
                    </p>
                    <Scrollbars
                        autoHeight
                        autoHeightMax={ 450 }
                    >
                        <Radio.Group onChange={ _.partial(this.handlePjSelected) } buttonStyle="solid" style={ {display: 'flex', flexDirection: 'column', padding: '0 12px 0 5px', pointerEvents: (currLetter.filename === letter.filename) ? 'none' : 'auto', opacity: (currLetter.filename === letter.filename) ? '0.5' : '', background: (currLetter.filename === letter.filename) ? '#CCC' : ''} }>
                            {
                                feed[mainAnnotations.nature_label].map((response, index) => {
                                    return (
                                        <Radio.Button
                                            key={ response } value={ response }
                                            size={ 'small' }
                                            style={ { flex: '1', width: '100%',marginBottom:'12px',fontSize:'14px',textAlign:'center', whiteSpace: 'normal' } }
                                        >
                                            {response}
                                            { (response === valueSelected) &&
                                            <Icon type="check" theme="outlined" style={ {marginLeft: '15px', fontSize: '14px'} } />
                                            }
                                        </Radio.Button>
                                    );
                                })
                            }
                        </Radio.Group>
                    </Scrollbars>
                </div>
                <div style={ {display: 'flex', flexWrap: 'wrap'} }>
                    <NextButton
                        styles={ {flex: '1'} }
                        disable={ valueSelected ? true : false }
                        onHandleStep={ this.handlePjConfirm }
                        btnLabel={ 'Valider' }
                        isIcon={ false }
                    />
                    {
                        mainAnnotations && mainAnnotations.pj &&
                        <NextButton
                            styles={ {flex: '1'} }
                            onHandleStep={ _.partial(this.handleAnnotationConfirm, ['Final Annotation']) }
                            btnLabel={ 'Finaliser l\'annotation' }
                            isIcon={ false }
                        />
                    }
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        mainLetter: RecordSelector.getMainLetter(state),
        currentLetter: RecordSelector.getCurrentLetter(state),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Pj));
