/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-return-assign */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React from 'react';
import { Icon, Input, Button, Tooltip } from 'antd';

export default (params) => [

    {
        title: 'N°',
        dataIndex: 'nom_lettre',
        key: 'nom_lettre',
        width: '70%',
        ellipsis: true,
        filterDropdown: ({
            setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
            <div className="custom-filter-dropdown">
                <Input
                    ref={ ele => params.searchInput = ele }
                    placeholder="Numéro acte"
                    value={ selectedKeys[0] }
                    onChange={ e => setSelectedKeys(e.target.value ? [e.target.value] : []) }
                    onPressEnter={ params.handleSearch(selectedKeys, confirm) }
                />
                <Button type="primary" onClick={ params.handleSearch(selectedKeys, confirm) }>
                    {'Search'}
                </Button>
                <Button onClick={ params.handleReset(clearFilters) }>
                    {'Reset'}
                </Button>
            </div>
        ),
        filterIcon: filtered => <Icon type="search" style={ { color: filtered ? '#108ee9' : '#aaa' } } />,
        onFilter: (value, record) => {
            if (record && record.nom_lettre) {
                return record.nom_lettre.toLowerCase().includes(value.toLowerCase());
            }
        },
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => {
                    params.searchInput.focus();
                });
            }
        },
        render: text => {
            return text.substring(0, text.length - 4 );
        },
    },

    {
        title: 'Dép.',
        dataIndex: 'departement',
        key: 'departement',
        width: '30%',
        ellipsis: true,
        filterDropdown: ({
            setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
            <div className="custom-filter-dropdown">
                <Input
                    ref={ ele => params.searchInput = ele }
                    placeholder="Département acte"
                    value={ selectedKeys[0] }
                    onChange={ e => setSelectedKeys(e.target.value ? [e.target.value] : []) }
                    onPressEnter={ params.handleSearch(selectedKeys, confirm) }
                />
                <Button type="primary" onClick={ params.handleSearch(selectedKeys, confirm) }>
                    {'Search'}
                </Button>
                <Button onClick={ params.handleReset(clearFilters) }>
                    {'Reset'}
                </Button>
            </div>
        ),
        filterIcon: filtered => <Icon type="search" style={ { color: filtered ? '#108ee9' : '#aaa' } } />,
        onFilter: (value, record) => record.departement.toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => {
                    params.searchInput.focus();
                });
            }
        },
        render: text => {
            return cutTheme(text);
        },
    },
];

const cutTheme = (text) => {
    if (!text) {
        return 'Inconnu';
    }
    else if (text.length <= 17) {
        return text;
    } else {
        return (
            <Tooltip placement="right" title={ text }>
                {`${text.substring(0, 17)}...`}
            </Tooltip>
        );
    }
};
