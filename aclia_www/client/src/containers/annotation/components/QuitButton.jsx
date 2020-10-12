/* eslint-disable react/jsx-no-bind */
import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Icon } from 'antd';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
//Actions
import * as RecordActions from '../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../core/redux/record/selector.js';

class QuitButton extends React.Component {
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
        toAnnot: PropTypes.bool.isRequired,
        getRecordList: PropTypes.func.isRequired,
    }

    static defaultProps = {
        styles: null,
    }

    constructor(props) {
        super(props);
        this.state = {
            step: props.step,
            styles: props.styles,
            toAnnot: props.toAnnot,
        };
        this.handleQuit = this.handleQuit.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'step',
            'toAnnot',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    handleQuit() {
        const {toAnnot} = this.state;
        this.props.getRecordList(!toAnnot);
        this.props.clearLetter();
    }

    render() {
        const { styles } = this.state;
        return (
            <Tooltip title="Quitter l'annotation" placement="bottom">
                <Icon
                    type="close-square"
                    theme="outlined"
                    style={ { fontSize: '21px', cursor: 'pointer', ...styles} }
                    onClick={ _.partial(this.handleQuit) }
                />
            </Tooltip>
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
        toAnnot: RecordSelector.getToAnnot(state),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QuitButton));
