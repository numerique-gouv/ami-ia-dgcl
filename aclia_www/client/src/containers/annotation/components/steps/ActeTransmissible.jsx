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
// import AnnotationResume from '../AnnotationResume.jsx';

class ActeTransmissible extends React.Component {
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
            nextStep: props.nextStep,
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
        const { question, confirmFunc } = this.state;

        return (
            <div style={ { minHeight: 'calc(100vh - 109px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }>
                <div style={ {display: 'flex', flexDirection: 'column'} }>
                    <Question question={ question } />
                    <Button
                        size="small" style={ { flex: '1', padding: '15px 5px' ,color: '#fff', backgroundColor: '#198ffc', marginBottom:'5px', fontSize:'14px', borderRadius: '2px' } }
                        onClick={ _.partial(confirmFunc, ['Transmissible']) }
                    >
                        { 'Oui' }
                    </Button>
                    <Button
                        size="small" style={ { flex: '1', padding: '15px 5px' ,color: '#fff', backgroundColor: '#828c9e', marginBottom:'5px', fontSize:'14px', whiteSpace: 'normal', borderRadius: '2px' } }
                        onClick={ _.partial(confirmFunc, ['Non transmissible']) }
                    >
                        { 'Non' }
                    </Button>
                </div>
                {/* <div style={ {display: 'flex', flexWrap: 'wrap'} }>
                    <AnnotationResume />
                </div> */}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ActeTransmissible));
