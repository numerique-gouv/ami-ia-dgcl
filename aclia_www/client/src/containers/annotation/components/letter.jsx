/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/display-name */
/* eslint-disable import/namespace */
import React from 'react';
import { Icon, Result, Table } from 'antd';
import PropTypes from 'prop-types';
import {Scrollbars} from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import escapeStringRegexp from 'escape-string-regexp';
import _ from 'lodash';
import { hex2rgba } from './randomColor';
// Actions
import * as MeActions from '../../../core/redux/Me/actions.js';
import * as RecordSelector from '../../../core/redux/record/selector.js';
// Component
import QuitButton from './QuitButton.jsx';

function createMarkup(texte) {
    return {__html: texte};
}

const columns = [{
    title: 'Value',
    dataIndex: 'reponse',
    render: (text, row, index) => <div dangerouslySetInnerHTML={ createMarkup(text) } />,
}];

class Letter extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        letter: PropTypes.object,
        annotationList: PropTypes.object,
        step: PropTypes.number.isRequired,
    };
    /**
     * defaultProps - define default value props
     * @desc define not required props
     * @private
     * @version 1.0
     * @since 1.0
     */
    static defaultProps = {
        letter: null,
        annotationList: null,
    };


    constructor(props) {
        super(props);
        this.state = {
            letter: props.letter,
            annotationList: props.annotationList,
            step: props.step,
        };
        this.generateLetterHtml = this.generateLetterHtml.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'letter',
            'annotationList',
            'step',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    generateHtmlForAnnotation(text, annotatedTerms) {
        return annotatedTerms.reduce(
            (acc, term) => {
                const color = term && term.color ? hex2rgba(term.color, 0.5) : '#3fff3d';
                term = term.terms.replace(/\n/g, '<br>');
                term = escapeStringRegexp(term);
                const termRegex = new RegExp(`(${term})`, 'gi');
                return acc.replace(termRegex, `<b style='font-weight:normal;background-color:${color};filter: brightness(120%);'>$1</b>`);
            },
            text
        );
    }

    generateLetterHtml(letter, terms) {
        const generateEOL = letter.replace(/\n/g,'<br>');

        if (terms && terms.length > 0) {
            return [{
                reponse: this.generateHtmlForAnnotation(generateEOL, terms),
                id: 42,
            }];
        } else {
            return [{
                reponse: generateEOL ,
                id: 42,
            }];
        }
    }

    render() {
        const { letter, annotationList, step } = this.state;

        if (letter) {
            const mutableLetter = letter.toJS();
            const lettreName = `Acte ${mutableLetter.nom_lettre.substring(0, mutableLetter.nom_lettre.length - 4)}`;

            let terms = [];
            if (annotationList) {
                terms = annotationList.toJS().corps;
            }

            let htmlData;
            if (step === 4) {
                let termMeta = [];
                if (annotationList) {
                    termMeta = annotationList.toJS().metaObjet;
                }
                htmlData = this.generateLetterHtml(mutableLetter.objetacte, termMeta);
            } else {
                htmlData = this.generateLetterHtml(mutableLetter.lettre, terms);
            }

            return (
                <div style={ {backgroundColor: '#e6f5ff', minHeight:'calc(100vh - 64px)'} }>
                    <div style={ { position: 'relative', backgroundColor: '#F0F2F5', textAlign:'center' , padding:'10px', height: '42px'} }>
                        <QuitButton styles={ { position: 'absolute', left: '0'} } />
                        <Icon type="unordered-list" style={ { fontSize: '18px',paddingRight:'11px'} }  />
                        <b>
                            { lettreName }
                        </b>
                    </div>
                    <Scrollbars style={ { minHeight: 'calc(100vh - 106px)' } }>
                        { step === 4 &&
                            <b style={ {margin: '15px 0 5px 18px', userSelect: 'none', display: 'block', fontWeight: '900'} }>
                                {'Objet renseigné par la collectivité :'}
                            </b>
                        }
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
                        {
                            step === 4 &&
                            <>
                                <b style={ {marginLeft: '18px', marginTop: '20px', display: 'block', userSelect: 'none', fontWeight: '900'} }>
                                    {'Acte :'}
                                </b>
                                <Table
                                    columns={ columns }
                                    dataSource={ this.generateLetterHtml(mutableLetter.lettre, null) }
                                    rowKey={ record => record.id }
                                    bordered={ false }
                                    pagination={ false }
                                    showHeader={ false }
                                    style={ { backgroundColor: '#e6f5ff',fontSize: '0px'} }
                                />
                            </>

                        }
                    </Scrollbars>
                </div>);

        } else {
            return (
                <div style={ {backgroundColor: '#e6f5ff', minHeight:'calc(100vh - 64px)'} }>
                    <Result
                        title="Veuillez sélectionner un acte à gauche"
                    />
                </div>
            );

        }
    }
}

function mapStateToProps(state) {
    return {
        step: RecordSelector.getStep(state),
        annotationList: RecordSelector.getMainLetterAnnotations(state),
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
    return bindActionCreators({ ...MeActions }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Letter));
