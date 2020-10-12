import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Icon, Spin, Col, notification } from 'antd';
//Selector
import * as RecordSelector from '../../core/redux/record/selector.js';
import * as RecordActions from '../../core/redux/record/actions.js';
import Letter from './components/letter.jsx';
import MainListAnnot from './components/mainListAnnot.jsx';
import AnnotationLeft from './components/AnnotationLeft.jsx';
import AnnotationRight from './components/AnnotationRight.jsx';

const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
        message,
        description,
        duration: 3,
    });
};

const { Content } = Layout;
const antIcon = <Icon type="loading" style={ { fontSize: 24 } } spin />;

class MainAnnotation extends React.Component {
    static propTypes = {
        isPending: PropTypes.bool.isRequired,
        error: PropTypes.object,
        getRecordList: PropTypes.func.isRequired,
        recordList: PropTypes.object,
        currentLetter: PropTypes.object,
        letter: PropTypes.object,
        annotationList: PropTypes.object,
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
        recordList: null,
        error: null,
        currentLetter: null,
        letter: null,
        annotationList: null,
        pJList: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            error: props.error,
            isPending: props.isPending,
            recordList: props.recordList,
            currentLetter: props.currentLetter,
            letter: props.letter,
            annotationList: props.annotationList,
            pJList: props.pJList,
        };
        props.getRecordList(false);
    }


    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.error) {
            openNotificationWithIcon('error', 'Erreure interne, veuillez notifier l\'administrateur du site');
        }
        return true;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'isPending',
            'error',
            'recordList',
            'currentLetter',
            'letter',
            'annotationList',
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
        const { isPending, recordList, currentLetter, letter, annotationList, pJList } = this.state;
        let listLetter =  [];
        if (recordList) {
            listLetter = recordList.toJS();
        }
        return (
            <Layout>
                <Content style={ { marginTop: '64px', minHeight:'calc(100vh - 64px)', overflowX: 'hidden'} }>
                    <Spin spinning={ isPending } indicator={ antIcon }>
                        <Col span={ 6 }>
                            {
                                currentLetter ?
                                    <AnnotationLeft currentLetter={ currentLetter } annotationList={ annotationList } pJList={ pJList } />
                                    :
                                    <MainListAnnot listLetter={ listLetter } />
                            }
                        </Col>
                        <Col span={ 13 }>
                            <Letter letter={ letter } annotationList={ annotationList } />
                        </Col>
                        <Col span={ 5 }>
                            <AnnotationRight />
                        </Col>
                    </Spin>
                </Content>
            </Layout>
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
        recordList: RecordSelector.getRecordList(state),
        isPending: RecordSelector.getIsPending(state),
        error: RecordSelector.getError(state),
        currentLetter: RecordSelector.getCurrentLetter(state),
        letter: RecordSelector.getLetter(state),
        annotationList: RecordSelector.getAnnotationList(state),
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
    return {
        dispatch,
        ...bindActionCreators({ ...RecordActions}, dispatch),
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MainAnnotation));
