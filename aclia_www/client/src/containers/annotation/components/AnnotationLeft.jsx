/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Icon, Table, Layout, Card, Tooltip, notification  } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import {Scrollbars} from 'react-custom-scrollbars';
import { hex2rgba } from './randomColor';
//Actions
import * as RecordActions from '../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../core/redux/record/selector.js';
// Component
import PrevButton from './PrevButton.jsx';

const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
        message,
        description,
        duration: 3,
    });
};


const { Content } = Layout;

class AnnotationLeft extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        setToAnnot: PropTypes.func.isRequired,
        getRecordList: PropTypes.func.isRequired,
        deleteAnnotation: PropTypes.func.isRequired,
        toAnnot: PropTypes.bool.isRequired,
        currentLetter: PropTypes.object,
        annotationList: PropTypes.object,
        mainLetterAnnotations: PropTypes.object,
        pJList: PropTypes.object,
        setCurrentLetter: PropTypes.func.isRequired,
        getLetter: PropTypes.func.isRequired,
        step: PropTypes.number,
        setMainLetterAnnotations: PropTypes.func.isRequired,
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
        annotationList: null,
        step: null,
        pJList: null,
        mainLetterAnnotations: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            toAnnot: props.toAnnot,
            currentLetter: props.currentLetter,
            annotationList: props.annotationList,
            mainLetterAnnotations: props.mainLetterAnnotations,
            pJList: props.pJList,
            step: props.step,
        };
        this.deleteAnnotation = this.deleteAnnotation.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'toAnnot',
            'currentLetter',
            'annotationList',
            'mainLetterAnnotations',
            'pJList',
            'step',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    deleteAnnotation(text, item) {
        const { currentLetter, mainLetterAnnotations } = this.state;

        if (currentLetter) {
            const mainAnnotations = mainLetterAnnotations.toJS();
            const annotationsFiltered = mainAnnotations[item].filter( obj => obj.code_supression !== text.code_supression);
            this.props.setMainLetterAnnotations({[item]: annotationsFiltered});
            openNotificationWithIcon('success', 'Annotation supprimée');
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
        this.props.setCurrentLetter(letter);
        this.props.getLetter();
    }

    render() {
        const columnsMeta = [
            {
                title:
    <Tooltip title="Expression selectionné" placement="bottom">
        <Icon type="highlight" theme="twoTone" style={ { fontSize: '21px'} } />
    </Tooltip>
                ,
                dataIndex:'terms',
                key:'terms',
                width: 'calc(50% - 15px)',
                ellipsis: true,
                render:(text, row, index) =>{
                    return  (
                        <Tooltip title={ text } placement="bottom">
                            {text}
                        </Tooltip>
                    );},

            },
            {
                title:
    <Tooltip title="Catégorie" placement="bottom">
        <Icon type="tag" theme="twoTone" style={ { fontSize: '18px'} } />
    </Tooltip>
                ,
                dataIndex: 'categorie',
                key: 'categorie',
                width: 'calc(50% - 15px)',
                render:(text, row, index) =>{
                    return  (
                        <Tooltip title={ text } placement="bottom">
                            {text}
                        </Tooltip>
                    );},
            },
            {
                title:
    <Tooltip title="Supprimer l'expression" placement="bottom">
        <Icon type="delete" theme="twoTone" style={ { fontSize: '19px'} } align="center" />
    </Tooltip>,
                dataIndex: 'code_supression',
                key: 'code_supression',
                width: '30px',
                render:(text, row, index) => {
                    return {
                        props: {
                            style: { cursor: 'pointer' },
                        },
                        children: <Icon type="close" style={ { padding: '0',fontSize: '19px',color:'#ff1001'} } onClick={ _.partial(this.deleteAnnotation, row, 'metaObjet') } />,
                    };
                },
            },

        ];

        const columnsCorps = [
            {
                dataIndex: 'color',
                key: 'color',
                width: '15px',
                render:(text, row, index) => {
                    const color = hex2rgba(text, 0.6);
                    return {
                        props: {
                            style: { padding: '0' },
                        },
                        children:
    <span style={ { display: 'block', margin: 'auto', width:'14px', height:'14px', borderRadius: '50%', backgroundColor: `${color}`, filter: 'brightness(120%)'} } />,
                    };
                },
            },
            {
                title:
    <Tooltip title="Expression selectionné" placement="bottom">
        <Icon type="highlight" theme="twoTone" style={ { fontSize: '21px'} } />
    </Tooltip>
                ,
                dataIndex:'terms',
                key:'terms',
                width: 'calc(33% - 15px)',
                ellipsis: true,
                render:(text, row, index) =>{
                    return  (
                        <span>
                            {text}
                        </span>
                    );},

            },
            {
                title:
    <Tooltip title="Catégorie" placement="bottom">
        <Icon type="tag" theme="twoTone" style={ { fontSize: '18px'} } />
    </Tooltip>
                ,
                dataIndex: 'concept',
                key: 'concept',
                width: 'calc(33% - 15px)',
                ellipsis: true,
                render:(text, row, index) =>{
                    return  (
                        <span>
                            {text}
                        </span>
                    );},
            },
            {
                title:
    <Tooltip title="Sous catégorie" placement="bottom">
        <Icon type="tags" theme="twoTone" style={ { fontSize: '19px'} } align="center" />
    </Tooltip>,
                dataIndex: 'underConcept',
                key: 'underConcept',
                width: 'calc(33% - 15px)',
                ellipsis: true,
                render:(text, row, index) =>{
                    return  (
                        <span>
                            {text}
                        </span>
                    );},
            },
            {
                title:
    <Tooltip title="Supprimer l'expression" placement="bottom">
        <Icon type="delete" theme="twoTone" style={ { fontSize: '19px'} } align="center" />
    </Tooltip>,
                dataIndex: 'code_supression',
                key: 'code_supression',
                width: '35px',
                ellipsis: true,
                render:(text, row, index) =>{
                    return {
                        props: {
                            style: { cursor: 'pointer' },
                        },
                        children: <Icon type="close" style={ { padding: '0',fontSize: '19px',color:'#ff1001'} } onClick={ _.partial(this.deleteAnnotation, row, 'corps') } />,
                    };
                },
            },

        ];

        const columnsPJ = [
            {
                title: 'N°',
                dataIndex: 'nom_lettre',
                key: 'nom_lettre',
                width: '70%',
                ellipsis: true,
                render: text => {
                    return text;
                },
            },
            {
                title: 'Dép.',
                dataIndex: 'departement',
                key: 'departement',
                width: '30%',
                render: text => {
                    return text;
                },
            },
        ];


        const { pJList, step, mainLetterAnnotations } = this.state;

        const mainAnnotationList = mainLetterAnnotations && mainLetterAnnotations.toJS();
        const metaObject = mainAnnotationList && mainAnnotationList.metaObjet ? mainAnnotationList.metaObjet : [];
        const corpsAnnotations = mainAnnotationList && mainAnnotationList.corps ? mainAnnotationList.corps : [];

        return (
            <div style={ { minHeight:'calc(100vh - 64px)' } }>
                <Content style={ { minHeight:'calc(100vh - 64px)', maxHeight:'calc(100vh - 64px)', margin: '0', padding:'0px 12px 5px'} }>
                    { step > 0 && <PrevButton />}
                    <Scrollbars
                        autoHeight autoHeightMin="100%" autoHeightMax="100%"
                    >
                        { (step === 4 || step === 5) &&
                            <Card
                                headStyle={ { textAlign: 'center' } }
                                bodyStyle={ {  margin: '0px', padding: '0px'} }
                            >
                                <div style={ {textAlign:'center' ,padding:'10px'} }>
                                    {' '}
                                    <Icon type="edit" style={ { fontSize: '18px', paddingRight:'11px'} }  />
                                    <b>
                                        {'Annotations'}
                                    </b>
                                </div>
                                {
                                    <Table
                                        rowKey={ record => record.code_supression }
                                        dataSource={ step === 4 ? metaObject : corpsAnnotations }
                                        columns={ step === 4 ? columnsMeta : columnsCorps }
                                        pagination={ false }
                                        size={ 'small' }
                                    />
                                }
                            </Card>
                        }

                        { (step === 0.1 || step === 6 ) &&
                            <Card
                                style={ { marginTop: '10px' } }
                                headStyle={ { textAlign: 'center', margin: '0px' } }
                                bodyStyle={ {  margin: '0px', padding: '0px'} }
                            >
                                <div style={ {textAlign:'center' ,padding:'10px'} }>
                                    {' '}
                                    <Icon type="snippets" style={ { fontSize: '18px',paddingRight:'11px'} }  />
                                    <b>
                                        {'Pièces Jointes'}
                                    </b>
                                </div>
                                <Table
                                    size="small"
                                    rowKey={ record => record.filename }
                                    dataSource={ pJList ? pJList.toJS() : [] }
                                    columns={ columnsPJ }
                                    pagination={ {pageSize: 10 } }
                                    onRow={ (record, rowIndex) => {
                                        return {
                                            onClick: _.partial(this.handleRowClick, record),
                                        };
                                    } }
                                />
                            </Card>
                        }
                    </Scrollbars>
                </Content>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        toAnnot: RecordSelector.getToAnnot(state),
        pJList: RecordSelector.getPJList(state),
        step: RecordSelector.getStep(state),
        mainLetterAnnotations: RecordSelector.getMainLetterAnnotations(state),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnnotationLeft));
