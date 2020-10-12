/* eslint-disable react/jsx-no-bind */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'antd';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
//Actions
import * as RecordActions from '../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../core/redux/record/selector.js';

class NextButton extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        nextStep: PropTypes.number,
        setAnnotationStep: PropTypes.func.isRequired,
        onHandleStep: PropTypes.func,
        btnLabel: PropTypes.string,
        disable: PropTypes.bool,
        isIcon: PropTypes.bool,
        styles: PropTypes.object,
        PJlist: PropTypes.object,
        currentLetter: PropTypes.object,
    }

    static defaultProps = {
        nextStep: null,
        btnLabel: 'Suivant',
        disable: this.currentLetter ? false : true,
        isIcon: true,
        styles: null,
        currentLetter: null,
        PJlist: null,
        onHandleStep: () => {},
    }

    constructor(props) {
        super(props);
        this.state = {
            nextStep: props.nextStep,
            btnLabel: props.btnLabel,
            disable: props.disable,
            isIcon: props.isIcon,
            styles: props.styles,
            currentLetter: props.currentLetter,
            onHandleStep: props.onHandleStep,
        };
        this.handleStep = this.handleStep.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'currentLetter',
            'disable',
            'isIcon',
            'nextStep',
            'styles',
            'PJlist',
            'step',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    handleStep(nextStep, clbk) {
        if (clbk) {
            clbk();
        }
        if (nextStep) {
            this.props.setAnnotationStep(nextStep);
        }
    }

    render() {
        const { disable, onHandleStep, nextStep, isIcon, styles, PJlist } = this.state;
        let { btnLabel } = this.state;
        if (PJlist && PJlist.length === 0 && nextStep === null) {
            btnLabel = 'Finaliser l\'annotation';
        }
        return (
            <Button
                type="primary"
                style={ {margin: '5px', ...styles} }
                onClick={ _.partial(this.handleStep, nextStep, onHandleStep) }
                disabled={  disable ? false : true }
            >
                {btnLabel}
                {
                    isIcon &&
                    <Icon type="right" />
                }
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
        PJlist: RecordSelector.getPJList(state),
        currentLetter: RecordSelector.getCurrentLetter(state),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NextButton));
