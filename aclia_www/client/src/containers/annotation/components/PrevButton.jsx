/* eslint-disable react/jsx-no-bind */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
//Actions
import * as RecordActions from '../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../core/redux/record/selector.js';

class PrevButton extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        step: PropTypes.number.isRequired,
        setStep: PropTypes.func.isRequired,
        styles: PropTypes.object,
        clearLetter: PropTypes.func.isRequired,
    }

    static defaultProps = {
        styles: null,
    }

    constructor(props) {
        super(props);
        this.state = {
            step: props.step,
            styles: props.styles,
        };
        this.handleStep = this.handleStep.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'step',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    handleStep() {
        const { step } = this.state;
        if ( step === 0.1 ) {
            this.props.setStep(0);
        } else {
            this.props.setStep(step - 1);
        }
    }

    render() {
        const { styles } = this.state;
        return (
            <Button
                // type="primary"
                icon="left"
                style={ {fontSize: '18px', margin:'14px 0', ...styles} }
                onClick={ _.partial(this.handleStep) }
            >
                {'retour'}
            </Button>
        );
    }
}


/**
* @function mapStateToProps - redux method
* @desc transfert value state key into the props component
* @param {object} state - redux state
* @return {object} props
* @version 1.0
* @since 1.0
* @private
*/
function mapStateToProps(state) {
    return {
        step: RecordSelector.getStep(state),
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
    return {
        dispatch,
        ...bindActionCreators({ ...RecordActions}, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PrevButton));
