/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Button, Menu, Dropdown, Icon, notification } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { randomColor } from '../randomColor.js';
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
class Matiere extends React.Component {
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
        setMainLetterAnnotations: PropTypes.func.isRequired,
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
            level1: null,
            level2: null,
            matiereCode: null,
        };
        this.handleMatiereConfirmation = this.handleMatiereConfirmation.bind(this);
        this.handleLevels = this.handleLevels.bind(this);
        this.menuLevel2 = this.menuLevel2.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    handleMatiereConfirmation() {
        const { matiereCode, level1, level2 } = this.state;
        const annotation = {
            matiere_code: matiereCode,
            matiere_1: level1,
            matiere_2: level2,
        };
        this.props.setMainLetterAnnotations(annotation);
        if (this.state.matiereCode === 0) {
            this.props.endAnnotation(4);
            openNotificationWithIcon('info', 'Fin de l\'annotation.');
        }
    }

    handleLevels(value) {
        if (value.length > 1) {
            this.setState({
                level1: value[0].content,
                level2: value[1].content,
                matiereCode: value[1].code,
            });
        } else {
            this.setState({
                level1: value[0].content,
                level2: value[0].content,
                matiereCode: 0,
            });

        }
    }
    menuLevel2(response, value, color) {
        return (
            <Menu>
                { value &&
                    value.map((itemLevel2) => (
                        <Menu.Item key={ `${itemLevel2.content}${itemLevel2.code}` }>
                            <Button
                                size="small"
                                style={ { width: '100%' ,color: color, marginBottom:'1px',fontSize:'11px', borderRadius: '2px' } }
                                onClick={ _.partial(this.handleLevels, [response, itemLevel2]) }
                            >
                                { itemLevel2.content }
                            </Button>
                        </Menu.Item>
                    ))
                }
            </Menu>
        );
    }

    render() {
        const { question, nextStep, feed, level1, level2, matiereCode } = this.state;
        return (
            <div style={ { minHeight: 'calc(100vh - 109px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }>
                <div style={ {display: 'flex', flexDirection: 'column'} }>
                    <Question question={ question } />
                    {
                        feed.response.map((response, index) => {
                            const color = randomColor();
                            return (
                                <React.Fragment key={ `${response.content}${response.code}` }>
                                    { response.children ?
                                        <Dropdown overlay={ this.menuLevel2(response, response.children, color) }>
                                            <Button size={ 'small' } style={ { flex: '1', marginBottom:'12px',fontSize:'14px', textAlign:'left', display: 'flex', alignItems: 'center'} }>
                                                <Icon type="down-square" theme="filled" style={ {fontSize:'14px', color: color, marginRight: '5px'} } />
                                                <span style={ {whiteSpace: 'normal'} }>
                                                    { response.content }
                                                </span>
                                            </Button>
                                        </Dropdown>
                                        :
                                        <Button
                                            size={ 'small' } style={ { width: '100%',marginBottom:'12px',fontSize:'14px',textAlign:'center', whiteSpace: 'normal' } }
                                            onClick={ _.partial(this.handleLevels, [response]) }
                                        >
                                            { response.content }
                                        </Button>
                                    }
                                </React.Fragment>
                            );
                        })
                    }
                </div>
                <div style={ {display: 'flex', flexDirection: 'column'} }>
                    <div style={ {fontWeight: '900'} }>
                        <span style={ {float: 'left', width: '100%'} }>
                            {`Niveau 1: ${level1 ? level1 : '-'}`}
                        </span>
                        <span style={ {float: 'left', width: '100%'} }>
                            {`Niveau 2: ${level2 ? level2 : '-'}`}
                        </span>
                    </div>
                    <NextButton nextStep={ matiereCode === 0 ? 0 : nextStep } disable={ ( matiereCode !== null || matiereCode === 0) ? true : false } onHandleStep={ this.handleMatiereConfirmation } />
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Matiere));
