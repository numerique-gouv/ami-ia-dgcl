/* eslint-disable react/jsx-handler-names */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-max-depth */
import React, { Component } from 'react';
import { Layout, Row, Spin, Icon, Col, Table } from 'antd';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
//Selector
import * as ValidSelector from '../../core/redux/validation/selector.js';
import * as ValidActions from '../../core/redux/validation/actions.js';
import getSchema from './schema.jsx';
import Acte from './component/acte.jsx';

const { Content } = Layout;
const antIcon = <Icon type="loading" style={ { fontSize: 24 } } spin />;

class Validation extends Component {
    static propTypes = {
        isPending: PropTypes.bool.isRequired,
        error: PropTypes.object,
        validationList: PropTypes.object,
        getValidationList: PropTypes.func.isRequired,
    };
    /**
     * defaultProps - define default value props
     * @desc define not required props
     * @private
     * @version 1.0
     * @since 1.0
     */
    static defaultProps = {
        error: null,
        validationList: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            error: props.error,
            isPending: props.isPending,
            goActe: null,
            validationList: props.validationList,
            searchText: '',
            tableSchema: getSchema(this),
        };
        this.handleGoActe = this.handleGoActe.bind(this);
    }

    handleSearch = (selectedKeys, confirm) => () => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    }

      handleReset = clearFilters => () => {
          clearFilters();
          this.setState({ searchText: '' });
      }

      componentDidMount() {
          this.props.getValidationList();
      }

      static getDerivedStateFromProps(nextProps, prevState) {
          const keys = [
              'isPending',
              'error',
              'validationList',
          ];

          const mutableProps = _.pick(nextProps, keys);
          const stateToCompare = _.pick(prevState, keys);

          if (!_.isEqual(mutableProps, stateToCompare)) {
              return mutableProps;
          }

          return null;
      }

      handleGoActe(row) {
          if (row === null) {
              this.props.getValidationList();
          }
          this.setState({
              goActe: row,
          });
      }

      render() {
          const { isPending, goActe, validationList, tableSchema } = this.state;

          let mutableList = [];
          if (goActe) {
              return <Acte data={ goActe } handleGoActe={ this.handleGoActe } />;
          }

          if (validationList) {
              mutableList = validationList.toJS();
          }

          return (
              <Content style={ { marginTop: '94px'} }>
                  <Spin spinning={ isPending } indicator={ antIcon }>
                      <Row>
                          <Col span={ 18 } offset={ 2 }>
                              <Table
                                  bordered
                                  rowKey={ record => record.noacte }
                                  columns={ tableSchema } dataSource={ mutableList }
                                  onRow={ (record, rowIndex) => {
                                      return {
                                          onClick: _.partial(this.handleGoActe, record),
                                      };
                                  } }
                              />
                          </Col>
                      </Row>
                  </Spin>
              </Content>
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
        validationList: ValidSelector.getValidationList(state),
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


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Validation));
