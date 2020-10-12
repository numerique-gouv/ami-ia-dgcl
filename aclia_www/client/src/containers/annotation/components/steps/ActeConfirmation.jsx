/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
//Actions
import * as RecordActions from '../../../../core/redux/record/actions.js';
// import * as RecordSelector from '../../../../core/redux/record/selector.js';
// Composants
import Question from '../Question.jsx';

class ActeConfirmation extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        question: PropTypes.string,
        step: PropTypes.number.isRequired,
        confirmFunc: PropTypes.func.isRequired,
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
            question: props.question || '',
            step: props.step,
            confirmFunc: props.confirmFunc,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'step',
            'question',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    render() {
        const { question, step, confirmFunc } = this.state;

        return (
            <div style={ {display: 'flex', flexDirection: 'column'} }>
                <Question question={ question } />
                { step === 0.1 &&
                <>
                    <Button
                        size="small" style={ { flex: '1', padding: '15px 5px' ,color: '#fff', backgroundColor: '#198ffc', marginBottom:'5px', fontSize:'14px', borderRadius: '2px' } }
                        onClick={ _.partial(confirmFunc, ['Nouvel Acte Principal']) }
                    >
                        { 'Valider' }
                    </Button>
                    <Button
                        size="small" style={ { flex: '1', padding: '15px 5px' ,color: '#fff', backgroundColor: '#828c9e', marginBottom:'5px', fontSize:'14px', whiteSpace: 'normal', borderRadius: '2px' } }
                        onClick={ _.partial(confirmFunc, ['Aucun Acte Principal']) }
                    >
                        { 'Aucune de ces pièces jointes n\'est un acte' }
                    </Button>
                </>
                }
                { step === 0 &&
                    <>
                        <Button
                            key="acte"
                            size="small" style={ { flex: '1', padding: '15px 5px' ,color: '#fff', backgroundColor: '#198ffc', marginBottom:'5px', fontSize:'14px', borderRadius: '2px' } }
                            onClick={ _.partial(confirmFunc, ['Acte Principal']) }
                        >
                            { 'Oui c\'est l\'acte' }
                        </Button>
                        <Button
                            key="pj"
                            size="small" style={ { flex: '1', padding: '15px 5px' ,color: '#fff', backgroundColor: '#828c9e', marginBottom:'5px', fontSize:'14px', borderRadius: '2px' } }
                            onClick={ _.partial(confirmFunc, ['Pas Acte Principal']) }
                        >
                            { 'Non, c\'est une pièce jointe' }
                        </Button>
                    </>
                }
                <Button
                    size="small" style={ { flex: '1', padding: '15px 5px' ,color: '#E66D26', fontSize:'14px', whiteSpace: 'normal', borderRadius: '2px' } }
                    onClick={ _.partial(confirmFunc, ['OCR illisible']) }
                >
                    { 'Ce document est illisible' }
                </Button>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ActeConfirmation));
