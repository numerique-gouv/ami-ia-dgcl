/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/display-name */
/* eslint-disable react/jsx-no-bind */
import React, { Component } from 'react';
import { Layout, Row, Col, Button, Icon, Table, Result, Spin } from 'antd';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {Scrollbars} from 'react-custom-scrollbars';
//Selector
import * as ValidSelector from '../../../core/redux/validation/selector.js';
import * as ValidActions from '../../../core/redux/validation/actions.js';
import { Nature } from './nature.jsx';

const { Content } = Layout;
const antIcon = <Icon type="loading" style={ { fontSize: 24 } } spin />;

function createMarkup(texte) {
    return {__html: texte};
}

const columns = [{
    title: 'Value',
    dataIndex: 'reponse',
    render: (text, row, index) => <div dangerouslySetInnerHTML={ createMarkup(text) } />,
}];

class Acte extends Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
        isPending: PropTypes.bool.isRequired,
        error: PropTypes.object,
        acte: PropTypes.object,
        getActe: PropTypes.func.isRequired,
        handleGoActe: PropTypes.func.isRequired,
    };

    static defaultProps = {
        error: null,
        acte: null,
    }

    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            isPending: props.isPending,
            error: props.error,
            acte: props.error,
        };
    }

    componentDidMount() {
        const { data } = this.state;
        if (data.noacte) {
            this.props.getActe(data.noacte);
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'data',
            'error',
            'isPending',
            'acte',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    render() {
        const { acte, isPending } = this.state;
        if (acte) {
            const mutableActe = acte.toJS();
            const htmlData = [{
                reponse: mutableActe.texte.replace(/\n/g, '<br />') ,
                id: 42,
            }];
            return (
                <Content style={ { marginTop: '64px', minHeight:'calc(100vh - 64px)', overflowX: 'hidden'} }>
                    <Spin spinning={ isPending } indicator={ antIcon }>

                        <Col span={ 12 } style={ { paddingTop:'1%', height: 'calc(100vh - 64px)'} }>
                            <div style={ {backgroundColor: '#e6f5ff'} }>
                                <div style={ { backgroundColor: '#F0F2F5', overflow: 'auto'} }>
                                    <div style={ {float: 'left'} }>
                                        <Button onClick={ _.partial(this.props.handleGoActe, null) }>
                                            {'Retour'}
                                        </Button>
                                    </div>
                                    <div style={ { textAlign: 'center'} }>
                                        <Icon type="unordered-list" style={ { fontSize: '18px', paddingRight:'11px'} }  />
                                        <b>
                                            { mutableActe.noacte }
                                        </b>
                                    </div>
                                </div>
                                <Scrollbars style={ { height: 'calc(94vh - 62px)' } }>
                                    <Table
                                        id="annotation"
                                        columns={ columns }
                                        dataSource={ htmlData }
                                        rowKey={ record => record.id }
                                        bordered
                                        pagination={ false }
                                        showHeader={ false }
                                        size="small"
                                        style={ { backgroundColor: '#e6f5ff',fontSize: '0px'} }
                                    />
                                </Scrollbars>
                            </div>
                        </Col>
                        <Col span={ 12 }>
                            <Row style={ {height:'calc(100vh - 64px)', backgroundColor: '#e6f5ff'} }>
                                <Nature acte={ mutableActe } />
                            </Row>
                        </Col>
                    </Spin>
                </Content>
            );
        } else {
            return (
                <div style={ {backgroundColor: '#e6f5ff', minHeight: '80vh'} }>
                    <Result
                        title="Veuillez patientier"
                    />
                </div>
            );
        }
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
        acte: ValidSelector.getActe(state),
        isPending: ValidSelector.getIsPending(state),
        error: ValidSelector.getError(state),
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
        ...bindActionCreators({ ...ValidActions}, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Acte));
