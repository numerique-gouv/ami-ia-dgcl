/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/display-name */
/* eslint-disable import/namespace */
import React from 'react';
import { Table, Radio, Divider } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import getSchema from './table-schema.jsx';
import _ from 'lodash';
// Actions
import * as MeActions from '../../../core/redux/Me/actions.js';
import * as RecordActions from '../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../core/redux/record/selector.js';

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

class MainListAnnot extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        listLetter: PropTypes.array.isRequired,
        setToAnnot: PropTypes.func.isRequired,
        getRecordList: PropTypes.func.isRequired,
        toAnnot: PropTypes.bool.isRequired,
        setCurrentLetter: PropTypes.func.isRequired,
        setIsMainLetter: PropTypes.func.isRequired,
        getLetter: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            listLetter: props.listLetter,
            toAnnot: props.toAnnot,
            searchText: '',
            tableSchema: getSchema(this),
        };
        this.handleChangeAnnotState = this.handleChangeAnnotState.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'listLetter',
            'toAnnot',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    handleSearch = (selectedKeys, confirm) => () => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    }

      handleReset = clearFilters => () => {
          clearFilters();
          this.setState({ searchText: '' });
      }

      handleChangeAnnotState(e) {
          if (e.target.value === 'Annot') {
              this.props.setToAnnot();
              this.props.getRecordList(true);
          }
          else {
              this.props.setToAnnot();
              this.props.getRecordList(false);
          }
      }


      handleRowClick(record) {
          const letter = {
              docId: record.docId,
              filename: record.filename,
              step: record.step,
              status: record.status,
              isRecrutement: record.isRecrutement,
              isAvenant: record.isAvenant,
          };

          const setLetter = async () => {
              await this.props.setCurrentLetter(letter);
              this.props.setIsMainLetter();
              this.props.getLetter();
          };

          setLetter();
      }

      render() {
          const { listLetter, toAnnot, tableSchema } = this.state;
          return (
              <div style={ { textAlign: 'center' } }>
                  <Radio.Group
                      style={ { margin: '14px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: '0 10px'} }
                      onChange={ this.handleChangeAnnotState }
                      value={ toAnnot === true ? 'toAnnot' : 'Annot' }
                      buttonStyle="solid"
                  >
                      <Radio.Button value="toAnnot" style={ {flex: '1', minWidth: '120px', maxWidth: '150px'} }>
                          {'Pas annoté'}
                      </Radio.Button>
                      <Divider type="vertical" style={ { backgroundColor: 'black' } } />
                      <Radio.Button value="Annot" style={ {flex: '1', minWidth: '120px', maxWidth: '150px'} }>
                          {'Déja annoté'}
                      </Radio.Button>
                  </Radio.Group>
                  <Table
                      size="small"
                      // eslint-disable-next-line react/jsx-no-bind
                      rowKey={ record => record.filename }
                      style={ { backgroundColor: '#FFFFFF' } }
                      pagination={ {pageSize: 18 } }
                      dataSource={ shuffle(listLetter) }
                      columns={ tableSchema }
                      onRow={ (record, rowIndex) => {
                          return {
                              onClick: _.partial(this.handleRowClick, record),
                          };
                      } }
                  />
              </div>
          );
      }
}

function mapStateToProps(state) {
    return {
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
    return bindActionCreators({ ...MeActions, ...RecordActions }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MainListAnnot));
