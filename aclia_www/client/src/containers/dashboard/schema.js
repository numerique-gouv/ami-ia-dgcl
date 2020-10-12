/* eslint-disable react/display-name */
const sorterString = (a,b) => {
    if (a > b) {
        return -1;
    }
    if (b > a) {
        return 1;
    }
    return 0;
};

const columns = [
    {
        title: 'Département',
        dataIndex: 'dept',
        key: 'dept',
        width: '34%',
        sorter: (a, b) => sorterString(a.dept, b.dept),
    },
    {
        title: 'Nb requêtes annotées',
        dataIndex: 'nb_requetes_annotees',
        key: 'nb_requetes_annotees',
        width: '33%',
        sorter: (a, b) => sorterString(a.nb_requetes_annotees, b.nb_requetes_annotees),
    },
    {
        title: 'Total',
        dataIndex: 'nb_requetes_total',
        key: 'nb_requetes_total',
        width: '33%',
        sorter: (a, b) => sorterString(a.nb_requetes_total, b.nb_requetes_total),
    },
];


export { columns};
