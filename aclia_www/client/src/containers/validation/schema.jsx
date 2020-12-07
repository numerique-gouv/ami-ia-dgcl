/* eslint-disable no-return-assign */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import React from 'react';
import { Icon, Input, Button, Divider } from 'antd';

export default (params) => [
    {
        title: 'Numéro acte',
        dataIndex: 'noacte',
        key: 'noacte',
        width: '34%',
        filterDropdown: ({
            setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
            <div className="custom-filter-dropdown">
                <Input
                    ref={ ele => params.searchInput = ele }
                    placeholder="Numéro acte"
                    value={ selectedKeys[0] }
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={ e => setSelectedKeys(e.target.value ? [e.target.value] : []) }
                    onPressEnter={ params.handleSearch(selectedKeys, confirm) }
                />
                <Button type="primary" onClick={ params.handleSearch(selectedKeys, confirm) } style={ {marginTop: '1%', marginBottom: '1%', marginLeft: '1%'} }>
                    {'Rechercher'}
                </Button>
                <Divider type="vertical" style={ {backgroundColor: 'black'} } />
                <Button onClick={ params.handleReset(clearFilters) }>
                    {'Reset'}
                </Button>
            </div>
        ),
        filterIcon: filtered => <Icon type="search" style={ { color: filtered ? '#108ee9' : '#aaa' } } />,
        onFilter: (value, record) => {
            if (record && record.noacte) {
                return record.noacte.toLowerCase().includes(value.toLowerCase());
            }
        },
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => {
                    params.searchInput.focus();
                });
            }
        },

    },
];

/*
    {
        title: 'Département',
        dataIndex: 'dept',
        key: 'dept',
        width: '33%',
        sorter: (a, b) => sorterString(a.nb_requetes_annotees, b.nb_requetes_annotees),
    },

    */
