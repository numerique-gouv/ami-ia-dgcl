/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Icon, Radio, notification } from 'antd';
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
import NextButton from '../NextButton.jsx';

const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
        message,
        description,
        duration: 3,
    });
};
class Nature extends React.Component {
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
        feed: PropTypes.object.isRequired,
        onNatureSelected: PropTypes.func.isRequired,
        endAnnotation: PropTypes.func.isRequired,
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
            feed: props.feed,
            onNatureSelected: props.onNatureSelected,
            valueSelected: {
                label: null,
                content: null,
            },
        };
        this.handleNatureSelected = this.handleNatureSelected.bind(this);
        this.handleNatureConfirmation = this.handleNatureConfirmation.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'valueSelected',
            'nextStep',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    handleNatureSelected(event) {
        const value = event.target.value;
        this.setState({valueSelected: {label : value.label, content : value.content}});
    }

    handleNatureConfirmation() {
        const { valueSelected } = this.state;
        this.props.onNatureSelected({nature_label: valueSelected.label, nature_content: valueSelected.content});
        if (this.state.valueSelected.label === 'A') {
            this.props.endAnnotation(3);
            openNotificationWithIcon('info', 'Fin de l\'annotation.');
        }
    }

    render() {
        const { question, nextStep, feed, valueSelected } = this.state;
        return (
            <div style={ { minHeight: 'calc(100vh - 109px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }>
                <div style={ {display: 'flex', flexDirection: 'column'} }>
                    <Question question={ question } />
                    <Radio.Group onChange={ _.partial(this.handleNatureSelected) } buttonStyle="solid" style={ {display: 'flex', flexDirection: 'column'} }>
                        {
                            feed.response.map((response, index) => {
                                return (
                                    <Radio.Button key={ response.label } value={ response } style={ { flex: '1', padding: '15px 5px' ,color: '#fff', backgroundColor: ((response.label === valueSelected.label) ? '#198ffc' : response.color), border: ((response.label === valueSelected.label) ? '3px solid #fff' : 'none'), marginBottom:'5px', fontSize:'14px', textAlign: 'center', fontWeight: '900', borderRadius: '2px' } }>
                                        {response.content}
                                        { (response.label === valueSelected.label) &&
                                        <Icon type="check" theme="outlined" style={ {marginLeft: '15px', fontSize: '14px'} } />
                                        }
                                    </Radio.Button>
                                );
                            })
                        }
                    </Radio.Group>
                </div>
                <div style={ {display: 'flex', flexDirection: 'column'} }>
                    <div style={ {fontWeight: '900'} }>
                        <span style={ {float: 'left', width: '100%'} }>
                            {`Nature: ${valueSelected.content ? valueSelected.content : '-'}`}
                        </span>
                    </div>
                    <NextButton nextStep={ valueSelected.label === 'A' ? 0 : nextStep } disable={ valueSelected ? true : false } onHandleStep={ this.handleNatureConfirmation } />
                </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Nature));
