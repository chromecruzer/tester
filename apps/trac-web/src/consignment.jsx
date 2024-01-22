
import React from 'react';
import { daysUntil } from './utils';
import {MdBlock, MdCheckCircle, MdWarning} from "react-icons/md";

export const expirySortComparator = (aValue, bValue, aObj, bObj) => {
    const a = aObj.row.expiry_epoch, b = bObj.row.expiry_epoch;
    return a > b ? 1 : (a < b) ? -1 : 0;
};
// Variables
export const standardFamily = {
    MX60: 'Envista',
    MX60E: 'Envista',
    MXUE: 'Envista',
    MXUPL: 'Envista',
    MI60L: 'Akreos MICS',
    AO60: 'Akreos AO',
    LI61AO: 'Sofport',
    LI61SE: 'Sofport',
    '8T': 'PMMA IolConsignments-Other', // Monofocal Other (lvl4)
    '8U': 'PMMA IolConsignments-B&L', // Monofocal Other (lvl4)
    'FC': 'Hoya', // FC60AD 3-pc Clear IolConsignments (lvl5)
    'FY': 'Hoya', // FC60AD 3-pc Clear IolConsignments (lvl5)
    '2500': 'Hoya ISERT', // ISERT 250 1-pc Clear (lvl5)
    '2510': 'Hoya ISERT', // ISERT 250 1-pc Yellow (lvl5)
    '23': 'Hoya ISERT' // ISERT 250 1-pc Yellow (lvl5)
};

export const premiumFamily = {
    BL1UT: 'Trulign',
    AT50AO: 'Crystalens',
    AT52AO: 'Crystalens AO',
    '852AO': 'Crystalens',
    AO1UV: 'Crystalens AO',
    AO2UV: 'Crystalens AO',
    MX60T: 'Envista Toric',
    MXUT: 'Envista Toric',
    MXUPT: 'Envista Toric',
    MX60UP: 'Envista Toric Preloaded'
};

const families = { ...standardFamily, ...premiumFamily };

export const findFamily = item => {
    return Object.keys(families).find(f => new RegExp('^' + f).test(item));
};
/*
EnVista   $ 19.50

envista toric    $ 20.22

Trulign   $ 39.22

Crystalens   $ 40.26
*/
// Based on lvl3_id + derivied family
export const COGs = {
    PREM_IOLS_TOT: {
        Envista: 20.22,
        Trulign: 39.22,
        Crystalens: 40.26
    },
    STAND_IOLS_TOT: 19.50
};
/*
enVista - $100
enVista toric - $450
Crystalens/Trulign - $850
*/
export const marketValue = {
    PREM_IOLS_TOT: {
        Envista: 450,
        Trulign: 850,
        Crystalens: 850
    },
    STAND_IOLS_TOT: 100
}

export const getCostAndValue = (lvl3_id, family, total) => {
    if (total === 0) return ['N/A', 'N/A'];
    if (lvl3_id === 'PREM_IOLS_TOT') {
        return [
            (COGs.PREM_IOLS_TOT[family.split(/\s/).shift()] * total).toLocaleString('us-EN', { style: 'currency', currency: 'USD' }),
            (marketValue.PREM_IOLS_TOT[family.split(/\s/).shift()] * total).toLocaleString('us-EN', { style: 'currency', currency: 'USD' })
        ];
    }
    // All standard are represented by one price.
    return [
        (COGs.STAND_IOLS_TOT * total).toLocaleString('us-EN', { style: 'currency', currency: 'USD' }),
        (marketValue.STAND_IOLS_TOT * total).toLocaleString('us-EN', { style: 'currency', currency: 'USD' })
    ];
};


export const getCostAndValueInt = (lvl3_id, family, total) => {
    if (total === 0) return [0, 0];
    if (lvl3_id === 'PREM_IOLS_TOT') {
        return [
            (COGs.PREM_IOLS_TOT[family.split(/\s/).shift()] * total),
            (marketValue.PREM_IOLS_TOT[family.split(/\s/).shift()] * total)
        ];
    }
    // All standard are represented by one price.
    return [
        (COGs.STAND_IOLS_TOT * total),
        (marketValue.STAND_IOLS_TOT * total)
    ];
};

export const groupForOverview = (lvl3_id, data, now) => {
    // Group by family and do date math
    // family, total, 30D, 60D, > 60D, COGS, Mkt Value.
    const byProductFamily = {};
    data.forEach((x, i) => {
        if (!byProductFamily[x.family]) byProductFamily[x.family] = { id: i, family: x.family, total: 0, zeroToThirty: 0, thirtyOneToSixty: 0, greaterThanSixty: 0, pastExpiration: 0, cogs: '$0.00', marketValue: '$X.XX' };
        byProductFamily[x.family].total += 1;
        byProductFamily[x.family][daysUntil(x.expiry_date, now)] += 1;
    });
    Object.keys(byProductFamily).forEach(bpf => {
        const [cogs, marketValue] = getCostAndValue(lvl3_id, bpf, byProductFamily[bpf].total);
        byProductFamily[bpf].cogs = cogs;
        byProductFamily[bpf].marketValue = marketValue;
    });
    return Object.values(byProductFamily);
};

export const parseConsignmentToOverview = (consignmentData) => {
    const now = Date.now();
    const data = consignmentData.map(x => {
        const family = findFamily(x.item);
        x.family = families[family];
        // Leave this for now as we seem to not have all the old family data mapped.
        if (!x.family) console.log('!!! Data issues !!! Missing family mapping for: ', x.item);
        return x;
    });
    const standardIOL = data.filter(x => x.lvl3_id === 'STAND_IOLS_TOT');
    const premiumIOL = data.filter(x => x.lvl3_id === 'PREM_IOLS_TOT');
    const standardFamilyGrouped = groupForOverview('STAND_IOLS_TOT', standardIOL, now);
    const premiumFamilyGrouped = groupForOverview('PREM_IOLS_TOT', premiumIOL, now);
    console.log('p/s lengths and total: ', premiumIOL.length, standardIOL.length, premiumIOL.length + standardIOL.length);
    // Now, group by family and add the 0-30, > 30, > 60 logic and values.
    return [standardIOL, premiumIOL, standardFamilyGrouped, premiumFamilyGrouped];
};

export const parseToExpirationView = (consignmentData) => {
    const now = Date.now();
    const data = consignmentData.map(x => {
        const family = findFamily(x.item);
        x.family = families[family];
        // Leave this for now as we seem to not have all the old family data mapped.
        if (!x.family) console.log('!!! Data issues !!! Missing family mapping for: ', x.item);
        x.time_bucket = daysUntil(x.expiry_date, now);
        x.expiry_epoch = new Date(x.expiry_date).getTime();
        return x;
    });
    return data;
};

// TODO: Solidify account columns, what they mean, and controls.
export const customerAccountsColumns = [
    { accessor: 'customer_id', Header: 'Customer ID', width: 150 },
    { accessor: 'customer_name', Header: 'Customer Name', width: 280 },
    { accessor: 'scan_period', Header: 'Period', width: 100 },
    {
        accessor: 'progress', Header: 'Progress', width: 120, valueFormatter: (params) => {
            const { am_count, fm_count, nm_count, scan_id, scan_status } = params.row;
            return (scan_id && scan_status === 'ACCEPTED' && am_count + fm_count > 0) ? ((am_count + fm_count) / (am_count + fm_count + nm_count) * 100).toFixed(2).toString() + '%' : '0%';
        },
        cellClassName: (params) => {
            const { am_count, fm_count, nm_count } = params.row;
            const pComplete = (am_count + fm_count + nm_count > 0) ? ((am_count + fm_count) / (am_count + fm_count + nm_count) * 100).toFixed(2) : 0;
            return `progress-${pComplete < 90 ? 'red-color' : pComplete > 97 ? 'green-color' : 'yellow-color'}`;
        }
    },
    {
        accessor: 'total_scan', Header: 'Total Scan', width: 120, align: 'center', renderCell: (params) => {
            const { am_count, fm_count, nm_count } = params.row;
            return <span style={{ fontWeight: 'bold' }}>{am_count + fm_count + nm_count}</span>;
        }
    },
    { accessor: 'am_count', Header: 'AM', width: 90 },
    { accessor: 'fm_count', Header: 'FM', width: 90 },
    { accessor: 'nm_count', Header: 'NM', width: 90 },
    {
        accessor: 'scan_status', Header: 'Scan Status', width: 140, renderCell: (params) => {
            const scan_status = params.row.scan_status;
            return (<div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center' }}>{scan_status ? <span className={scan_status === 'ACCEPTED' ? 'progress-green-color' : 'progress-yellow-color'}>{scan_status === 'ACCEPTED' ? scan_status : 'REJECTED'}</span>
                : <MdBlock className='audit-code-status-icon-NM' />}</div>);
        }
    },
    { accessor: 'date_received', Header: 'Scan Received', width: 150 }
];

export const reconciliationColumns = [
    { accessor: 'family', Header: 'Product Family', width: 180 },
    { accessor: 'serial', Header: 'Serial', width: 150 },
    { accessor: 'item', Header: 'Item', width: 150 },
    { accessor: 'description', Header: 'Description', width: 270 },
    {
        accessor: 'expiry_date', Header: 'Expires', width: 150,
        renderCell: (params) => {
            const timeBucket = params.row.time_bucket;
            return (<div
                className={timeBucket}
            >
                {params.value}
            </div>);
        },
        sortComparator: expirySortComparator
    },
    // status, audit_code, audit_code_hint
    {
        accessor: 'status', Header: 'Status', width: 130, renderCell: (params) => {
            const status = params.getValue('status');
            return (<div style={{ display: 'flex', flexGrow: '1', justifyContent: 'center' }}>{status === 'AM' ? <MdCheckCircle className='audit-code-status-icon-AM' />
                : status === 'FM' ? <MdCheckCircle className='audit-code-status-icon-FM' />
                    : <MdWarning className='audit-code-status-icon-NM' />}</div>);
        }
    },
    {
        accessor: 'audit_code', Header: 'Audit Code', width: 130, renderCell: (params) => {
            const code = params.getValue('audit_code');
            const label = code ? code.split('_')[0] : null;
            return label ? <div className='center-cell'><div className={`audit-code-${label === '00' ? 'AM' : 'FM'}`}>{label}</div></div> : '';
        }
    },
    {
        accessor: 'audit_code_hint', Header: 'Hint', width: 130, renderCell: (params) => {
            const code = params.getValue('audit_code_hint');
            const label = code ? code.split('_')[0] : null;
            return label ? <span className='audit-code-hint' arrow placement='top' title={<React.Fragment>{label === '01' ? 'Customer ID: ' : label === '02' ? 'STM: ' : ''}{params.row.customer_id}<br /></React.Fragment>}><div className='center-cell'><div className={'audit-code-FM'}>{label}</div></div></span> : '';
        }
    }
];

export const parseToReconciliationView = (reconData) => {
    // We have: customer_id, status, audit_code, audit_code_hint, action, serial, item, description, expiry_date, -- FIXME: audit_result we have, but I think this became status along the way.
    const now = Date.now();
    const data = reconData.map(x => {
        if (x.item) {
            // We should be able to map family if there is item.
            const family = findFamily(x.item);
            x.family = families[family];
            // Leave this for now as we seem to not have all the old family data mapped.
            if (!x.family) console.log('!!! Data issues !!! Missing family mapping for: ', x.item);
        } else {
            x.family = '_'
            x.item = 'Unknown';
            x.description = 'Not found';
            x.expriy_date = '01/01/1976'
        }
        x.time_bucket = daysUntil(x.expiry_date, now);
        x.expiry_epoch = new Date(x.expiry_date).getTime();
        // console.log('parseToReconciliationView: ', x.time_bucket);
        return x;
    });
    return data;
};


const formatSalesTotalMoney = int => (int && int > 0) ? int.toLocaleString('us-EN', { style: 'currency', currency: 'USD' }) : 'N/A';

export const parseToSalesByRoleView = (stm_customer_consignments, territoriesAndRoles) => {
    // backwards map to get to totals
    const STM_TOTALS = {};
    // Make STM ShipTo keyed objects, grouping these TOTALS: PREM vs. STAND COGs and Market Value.
    let id = 0, total_cogs = 0, total_value = 0;
    stm_customer_consignments.forEach((row) => {
        const { customer_id, item, lvl3_id, stm_territory } = row;
        const family = families[findFamily(item)];
        if (!STM_TOTALS[stm_territory]) STM_TOTALS[stm_territory] = {
            id,
            territory_id: stm_territory,
            customers: {},
            accounts_total: 0,
            PREM_IOLS_TOT: {},
            STAND_IOLS_TOT: {},
            premium_iols_total: 0,
            premium_iols_cogs: 0,
            premium_iols_value: 0,
            standard_iols_total: 0,
            standard_iols_cogs: 0,
            standard_iols_value: 0

        };
        if (!STM_TOTALS[stm_territory].customers[customer_id]) {
            STM_TOTALS[stm_territory].customers[customer_id] = true;
            STM_TOTALS[stm_territory].accounts_total++;
        }
        // Here, family will be more dynamic and unpredictable than the original object can be setup for in STM_TOTALS[stm_territory] instantiation.
        if (!STM_TOTALS[stm_territory][lvl3_id][family]) {
            STM_TOTALS[stm_territory][lvl3_id][family] = 1;
        } else {
            STM_TOTALS[stm_territory][lvl3_id][family]++;
        }
        id++;
    });
    // Here, add name (rep_name), reports_to, from context, and then get prem and stand total cogs and marketValue.
    for (const stm_territory in STM_TOTALS) {
        const { rep_name, reports_to } = territoriesAndRoles.find(x => x.territory_id === stm_territory);
        STM_TOTALS[stm_territory].rep_name = rep_name;
        STM_TOTALS[stm_territory].reports_to = reports_to;
        // TODO: Get all totals COGs and Market Value!
        for (const lensFamily in STM_TOTALS[stm_territory].PREM_IOLS_TOT) {
            const lensCount = STM_TOTALS[stm_territory].PREM_IOLS_TOT[lensFamily];
            const [cogs, marketValue] = getCostAndValueInt('PREM_IOLS_TOT', lensFamily, lensCount);
            STM_TOTALS[stm_territory].premium_iols_total += lensCount;
            STM_TOTALS[stm_territory].premium_iols_cogs += cogs;
            STM_TOTALS[stm_territory].premium_iols_value += marketValue;
        }
        for (const lensFamily in STM_TOTALS[stm_territory].STAND_IOLS_TOT) {
            const lensCount = STM_TOTALS[stm_territory].STAND_IOLS_TOT[lensFamily];
            const [cogs, marketValue] = getCostAndValueInt('STAND_IOLS_TOT', lensFamily, lensCount);
            STM_TOTALS[stm_territory].standard_iols_total += lensCount;
            STM_TOTALS[stm_territory].standard_iols_cogs += cogs;
            STM_TOTALS[stm_territory].standard_iols_value += marketValue;
        }
        // Clean up data we only needed to establish totals.
        // console.log('prem cogs mv: ', STM_TOTALS[stm_territory].premium_iols_cogs, formatSalesTotalMoney(STM_TOTALS[stm_territory].premium_iols_cogs));
        const cogs = STM_TOTALS[stm_territory].premium_iols_cogs + STM_TOTALS[stm_territory].standard_iols_cogs;
        const value = STM_TOTALS[stm_territory].premium_iols_value + STM_TOTALS[stm_territory].standard_iols_value;
        total_cogs += cogs;
        total_value += value;
        STM_TOTALS[stm_territory].cogs = formatSalesTotalMoney(cogs);
        STM_TOTALS[stm_territory].value = formatSalesTotalMoney(value);
        STM_TOTALS[stm_territory].premium_iols_cogs_display = formatSalesTotalMoney(STM_TOTALS[stm_territory].premium_iols_cogs);
        STM_TOTALS[stm_territory].premium_iols_value_display = formatSalesTotalMoney(STM_TOTALS[stm_territory].premium_iols_value);
        STM_TOTALS[stm_territory].standard_iols_cogs_display = formatSalesTotalMoney(STM_TOTALS[stm_territory].standard_iols_cogs);
        STM_TOTALS[stm_territory].standard_iols_value_display = formatSalesTotalMoney(STM_TOTALS[stm_territory].standard_iols_value);
        STM_TOTALS[stm_territory].PREM_IOLS_TOT = null;
        STM_TOTALS[stm_territory].STAND_IOLS_TOT = null;
        STM_TOTALS[stm_territory].customers = null;
    }
    const STM_DATA = Object.values(STM_TOTALS);
    //
    const RBD_LOOKUP = {};
    id = 0;
    STM_DATA.forEach((STM) => {
        if (!RBD_LOOKUP[STM.reports_to]) {
            const { rep_name, reports_to, territory_id, territories } = territoriesAndRoles.find(x => x.territory_id === STM.reports_to);
            RBD_LOOKUP[territory_id] = {
                id,
                rep_name,
                territory_id,
                reports_to,
                stm_total: territories.filter(x => x.role === 'STM').length,
                standard_iols_total: 0,
                standard_iols_cogs: 0,
                standard_iols_value: 0,
                premium_iols_total: 0,
                premium_iols_cogs: 0,
                premium_iols_value: 0,
                accounts_total: 0
            };
        }
        RBD_LOOKUP[STM.reports_to].standard_iols_total += STM.standard_iols_total;
        RBD_LOOKUP[STM.reports_to].standard_iols_cogs += STM.standard_iols_cogs;
        RBD_LOOKUP[STM.reports_to].standard_iols_value += STM.standard_iols_value;
        RBD_LOOKUP[STM.reports_to].premium_iols_total += STM.premium_iols_total;
        RBD_LOOKUP[STM.reports_to].premium_iols_cogs += STM.premium_iols_cogs;
        RBD_LOOKUP[STM.reports_to].premium_iols_value += STM.premium_iols_value;
        RBD_LOOKUP[STM.reports_to].accounts_total += STM.accounts_total;
        id++;
    });
    for (const rbd_territory in RBD_LOOKUP) {
        RBD_LOOKUP[rbd_territory].cogs = formatSalesTotalMoney(RBD_LOOKUP[rbd_territory].standard_iols_cogs + RBD_LOOKUP[rbd_territory].premium_iols_cogs);
        RBD_LOOKUP[rbd_territory].value = formatSalesTotalMoney(RBD_LOOKUP[rbd_territory].standard_iols_value + RBD_LOOKUP[rbd_territory].premium_iols_value);
        RBD_LOOKUP[rbd_territory].standard_iols_cogs_display = formatSalesTotalMoney(RBD_LOOKUP[rbd_territory].standard_iols_cogs);
        RBD_LOOKUP[rbd_territory].standard_iols_value_display = formatSalesTotalMoney(RBD_LOOKUP[rbd_territory].standard_iols_value);
        RBD_LOOKUP[rbd_territory].premium_iols_cogs_display = formatSalesTotalMoney(RBD_LOOKUP[rbd_territory].premium_iols_cogs);
        RBD_LOOKUP[rbd_territory].premium_iols_value_display = formatSalesTotalMoney(RBD_LOOKUP[rbd_territory].premium_iols_value);
    }
    const RBD_DATA = Object.values(RBD_LOOKUP);
    //
    const ASD_LOOKUP = {};
    id = 0;
    RBD_DATA.forEach(RBD => {
        if (!ASD_LOOKUP[RBD.reports_to]) {
            console.log('Find ASD by RBD.reports_to: ', RBD.reports_to)
            const { rep_name, territory_id, regions } = territoriesAndRoles.find(x => x.territory_id === RBD.reports_to);
            ASD_LOOKUP[territory_id] = {
                id,
                rep_name,
                territory_id,
                rbd_total: regions.length,
                standard_iols_total: 0,
                standard_iols_cogs: 0,
                standard_iols_value: 0,
                premium_iols_total: 0,
                premium_iols_cogs: 0,
                premium_iols_value: 0,
                accounts_total: 0
            };
        }
        ASD_LOOKUP[RBD.reports_to].standard_iols_total += RBD.standard_iols_total;
        ASD_LOOKUP[RBD.reports_to].standard_iols_cogs += RBD.standard_iols_cogs;
        ASD_LOOKUP[RBD.reports_to].standard_iols_value += RBD.standard_iols_value;
        ASD_LOOKUP[RBD.reports_to].premium_iols_total += RBD.premium_iols_total;
        ASD_LOOKUP[RBD.reports_to].premium_iols_cogs += RBD.premium_iols_cogs;
        ASD_LOOKUP[RBD.reports_to].premium_iols_value += RBD.premium_iols_value;
        ASD_LOOKUP[RBD.reports_to].accounts_total += RBD.accounts_total;
        id++;
    });
    for (const asd_territory in ASD_LOOKUP) {
        ASD_LOOKUP[asd_territory].cogs = formatSalesTotalMoney(ASD_LOOKUP[asd_territory].standard_iols_cogs + ASD_LOOKUP[asd_territory].premium_iols_cogs);
        ASD_LOOKUP[asd_territory].value = formatSalesTotalMoney(ASD_LOOKUP[asd_territory].standard_iols_value + ASD_LOOKUP[asd_territory].premium_iols_value);
        ASD_LOOKUP[asd_territory].standard_iols_cogs_display = formatSalesTotalMoney(ASD_LOOKUP[asd_territory].standard_iols_cogs);
        ASD_LOOKUP[asd_territory].standard_iols_value_display = formatSalesTotalMoney(ASD_LOOKUP[asd_territory].standard_iols_value);
        ASD_LOOKUP[asd_territory].premium_iols_cogs_display = formatSalesTotalMoney(ASD_LOOKUP[asd_territory].premium_iols_cogs);
        ASD_LOOKUP[asd_territory].premium_iols_value_display = formatSalesTotalMoney(ASD_LOOKUP[asd_territory].premium_iols_value);
    }
    const ASD_DATA = Object.values(ASD_LOOKUP);
    //
    return [STM_DATA, RBD_DATA, ASD_DATA, formatSalesTotalMoney(total_cogs), formatSalesTotalMoney(total_value)];
};

export const detailColumns = [
    { accessor: 'family', Header: 'Product Family', width: 180 },
    { accessor: 'item', Header: 'Item', width: 150 },
    { accessor: 'description', Header: 'Description', width: 300 },
    { accessor: 'lot', Header: 'Serial', width: 150 },
    { accessor: 'qty', Header: 'Quantity', width: 80 },
    { accessor: 'expiry_date', Header: 'Expires', width: 150 }
];
// family, total, 30D, 60D, > 60D, COGS, Mkt Value.
export const familyColumns = [
    { accessor: 'family', Header: 'Product Family', width: 300 },
    { accessor: 'total', Header: 'Total', width: 200 },
    { accessor: 'pastExpiration', Header: 'Expired', width: 120 },
    { accessor: 'zeroToThirty', Header: '0-30', width: 100 },
    { accessor: 'thirtyOneToSixty', Header: '31-60', width: 100 },
    { accessor: 'greaterThanSixty', Header: '> 60', width: 100 },
    { accessor: 'cogs', Header: 'COGS', width: 200 },
    { accessor: 'marketValue', Header: 'Market Value', width: 200 }
];

export const expirationColumns = [
    { accessor: 'family', Header: 'Product Family', width: 180 },
    { accessor: 'item', Header: 'Item', width: 150 },
    { accessor: 'description', Header: 'Description', width: 300 },
    { accessor: 'lot', Header: 'Serial', width: 150 },
    {
        accessor: 'expiry_date', Header: 'Expires', width: 150,
        renderCell: (params) => (
            <div
                className={params.row.time_bucket}
            >
                {params.value}
            </div>
        ),
        sortComparator: expirySortComparator
    }
];

export const expirySortModel = [
    {
        accessor: 'expiry_date',
        sort: 'asc'
    },
];

export const sortModel = [
    {
        accessor: 'family',
        sort: 'asc'
    },
];
