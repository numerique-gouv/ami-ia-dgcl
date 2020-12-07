import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Divider, Select, Statistic } from 'antd';

const { Option } = Select;

function onChange(value) {
    console.log(`selected ${value}`);
}

class Nature extends React.Component {
    static propTypes = {
        acte: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            acte: props.acte,
        };
    }

    render() {
        const { acte } = this.state;

        return (
            <>
                <h2 style={ {textAlign: 'center'} }>
                    {'Nature de l\'acte'}
                </h2>
                <Col span={ 12 }>
                    <Divider type="horizontal" orientation="left">

                        {'Actes individuels: '}
                    </Divider>
                    <Row>
                        <Col span={ 4 } offset={ 1 }>
                            <Statistic
                                value={ acte.nature['Actes individuels'] }
                                precision={ 1 }
                                valueStyle={ { color: acte.nature['Actes individuels'] > 5 ? '#3f8600' : 'red'} }
                                suffix="%"
                            />
                        </Col>
                        <Col span={ 19 }>
                            <Select
                                style={ { width: 115 } }
                                placeholder="Vrai / Faux"
                                onChange={ onChange }
                            >
                                <Option value="true">
                                    {'Vrai'}
                                </Option>
                                <Option value="false">
                                    {'Faux'}
                                </Option>
                            </Select>
                        </Col>
                    </Row>
                    <Divider type="horizontal" orientation="left">
                        {'Actes réglementaires: '}
                    </Divider>
                    <Row>
                        <Col span={ 4 } offset={ 1 }>
                            <Statistic
                                value={ acte.nature['Actes réglementaires'] }
                                precision={ 1 }
                                valueStyle={ { color: acte.nature['Actes réglementaires'] > 5 ? '#3f8600' : 'red'} }
                                suffix="%"
                            />
                        </Col>
                        <Col span={ 19 }>
                            <Select
                                style={ { width: 115 } }
                                placeholder="Vrai / Faux"
                                onChange={ onChange }
                            >
                                <Option value="true">
                                    {'Vrai'}
                                </Option>
                                <Option value="false">
                                    {'Faux'}
                                </Option>
                            </Select>
                        </Col>
                    </Row>
                </Col>
                <Col span={ 12 }>
                    <Divider type="horizontal" orientation="left">
                        {'Délibérations: '}
                    </Divider>
                    <Row>
                        <Col span={ 4 } offset={ 1 }>
                            <Statistic
                                value={ acte.nature['Délibérations'] }
                                precision={ 1 }
                                valueStyle={ { color: acte.nature['Délibérations'] > 5 ? '#3f8600' : 'red'} }
                                suffix="%"
                            />
                        </Col>
                        <Col span={ 19 }>
                            <Select
                                style={ { width: 115 } }
                                placeholder="Vrai / Faux"
                                onChange={ onChange }
                            >
                                <Option value="true">
                                    {'Vrai'}
                                </Option>
                                <Option value="false">
                                    {'Faux'}
                                </Option>
                            </Select>
                        </Col>
                    </Row>
                    <Divider type="horizontal" orientation="left">
                        {'Contrats, conventions et avenants: '}
                    </Divider>
                    <Row>
                        <Col span={ 4 } offset={ 1 }>
                            <Statistic
                                value={ acte.nature['Contrats, conventions et avenants'] }
                                precision={ 1 }
                                valueStyle={ { color: acte.nature['Contrats, conventions et avenants'] > 5 ? '#3f8600' : 'red'} }
                                suffix="%"
                            />
                        </Col>
                        <Col span={ 19 }>
                            <Select
                                style={ { width: 115 } }
                                placeholder="Vrai / Faux"
                                onChange={ onChange }
                            >
                                <Option value="true">
                                    {'Vrai'}
                                </Option>
                                <Option value="false">
                                    {'Faux'}
                                </Option>
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </>
        );
    }
}

export { Nature };
