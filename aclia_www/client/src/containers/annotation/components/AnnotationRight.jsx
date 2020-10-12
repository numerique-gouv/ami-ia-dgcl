/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Layout  } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
//Actions
import * as RecordActions from '../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../core/redux/record/selector.js';
import Qcm from './Qcm.jsx';

const { Content } = Layout;

class AnnotationRight extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        currentLetter: PropTypes.object,
        pJList: PropTypes.object,
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
        pJList: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            currentLetter: props.currentLetter,
            pJList: props.pJList,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'toAnnot',
            'currentLetter',
            'pJList',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    render() {
        const { currentLetter, pJList } = this.state;

        return (
            <div style={ { minHeight:'calc(100vh - 64px)' } }>
                <Content type="primary" style={ { minHeight:'calc(100vh - 64px)', maxHeight:'calc(100vh - 64px)', margin: '0', padding: '42px 12px 5px'} }>
                    { currentLetter &&
                        <Qcm currentLetter={ currentLetter } pJList={ pJList } />
                    }
                </Content>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentLetter: RecordSelector.getCurrentLetter(state),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnnotationRight));
