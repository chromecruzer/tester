const formatPost = (body = {}) => {
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body && JSON.stringify(body)
    };
};
// getTerritoriesAndRoles
export const getTerritoriesAndRoles = async () => {
    const response = await fetch('/territories_and_roles');
    const result = await response.json();
    return result;
};
// getDownloadPort
export const getDownloadPort = async () => {
    const response = await fetch('/get_port');
    console.log('raw res: ', response);
    const result = await response.json();
    return result.port;
};
// getConsignmentAuditsByTerritory
export const getConsignmentAuditsByTerritory = async (territory_id, type) => {
    const body = {
        territory_id,
        type
    };
    const consignment = await fetch('/consignment-customers-by-stm', formatPost(body));
    const result = await consignment.json();
    return result;
};
//get_audit_status_for_all_stms
export const getAllConsignmentAudits = async () => {
    // const body = {
    //     type
    // };
    const consignments = await fetch('/all-customers-consignments-by-stm', formatPost());
    const result = await consignments.json();
    return result;
};
//
export const getConsignmentsByCustomerId = async (customer_id, type, expires) => {
    const body = {
        customer_id,
        type,
        expires
    };
    const consignment = await fetch('/consignment', formatPost(body));
    const result = await consignment.json();
    return result;
};

export const getConsignmentBySerial = async (serial, type) => {
    const body = {
        type,
        serial
    };
    const consignment = await fetch('/consignment/serial', formatPost(body));
    const result = await consignment.json();
    return result;
};

export const getConsignmentByFamily = async (like, type, family) => {
    const body = {
        type,
        like,
        family
    };
    const consignment = await fetch('/consignment/item/like', formatPost(body));
    const result = await consignment.json();
    return result;
};

export const customerSearch = async (query, type) => {
    const body = {
        user: 'future-session-user',
        query,
        type
    };
    const customers = await fetch('/query/customers', formatPost(body));
    const result = await customers.json();
    return result;
};

export const getCustomerContacts = async (customer_id) => {
    const body = {
        user: 'future-sess-user',
        customer_id
    };
    const customerContacts = await fetch('/customer-contacts', formatPost(body));
    const result = await customerContacts.json();
    return result;
};
//                 const { rows } = await getScanFileRecord(customer.customer_id, 2020);
export const getScanFileRecord = async (customer_id, period) => {
    const body = {
        user: 'future-sess-user',
        customer_id,
        period
    };
    const scanFileRecord = await fetch('/customer-audit-scan', formatPost(body));
    if (scanFileRecord && scanFileRecord.status === 204) {
        return null;
    }
    if (scanFileRecord) {
        const result = await scanFileRecord.json();
        return result;
    } else {
        return null;
    }
};
// consignment-audits
export const getReconciliationRows = async (customer_id, period) => {
    const body = {
        user: 'future-sess-user',
        customer_id,
        period
    };
    const conAuditsResult = await fetch('/consignment-audits', formatPost(body));
    if (conAuditsResult && conAuditsResult.status === 204) {
        return { rows: [], complete: null };
    }
    if (conAuditsResult) {
        const { rows, complete } = await conAuditsResult.json();
        return { rows: rows, complete };
    } else {
        return { rows: [], complete: null };
    }
};
// body includes type and user
export const updateAuditRows = async (body) => {
    const updateAuditsResult = await fetch('/consignment-audits-update', formatPost(body));
    return updateAuditsResult;
};
//
export const setCustomerContacts = async (customer_id, contacts, type, user) => {
    const body = {
        type,
        user,
        contacts,
        customer_id
    };
    const customerContacts = await fetch('/customer-contacts/set', formatPost(body));
    const result = await customerContacts.json();
    return result;
};

export const getConsignmentsView = async (customer_id, contacts) => {
    const body = {
        user: 'future-sess-user'
    };
    const consignmentView = await fetch('/consignment-view', formatPost(body));
    const result = await consignmentView.json();
    return result;
};


export const uploadAuditScan = async (formData) => {
    const uploadResult = await fetch('/scan-upload', { method: 'POST', body: formData });
    // const result = await consignmentView.json();
    const result = await uploadResult.json();
    return result;
};

export const acceptCustomerAuditScan = async (scanId, type, user) => {
    const body = {
        scanId,
        type,
        user
    };
    const result = await fetch('/customer-audit-scan-accept', formatPost(body));
    return result.ok ? 'Scan file accepted.' : 'Problem with marking scan file as accepted.';
};

export const rejectCustomerAuditScan = async (scanId, type) => {
    const body = {
        user: 'big-sess-yo',
        scanId,
        type
    };
    const rejectResult = await fetch('/customer-audit-scan-reject', formatPost(body));
    return rejectResult.ok ? 'Rejection successful.' : 'Problem with rejecting scan file.';
};

/* export const deleteCustomerAuditScan = async (scanId, type) => {
    const body = {
        user: 'big-sess-yo',
        scanId,
        type
    };
    const deleteResult = await fetch('/customer-audit-scan-delete', formatPost(body));
    return deleteResult.ok ? 'Delete successful.' : 'Problem with deleting scan file.';
};
 */
export const getReconciliationStatus = async (scanId) => {
    const reconStatusResult = await fetch('/customer-audit-totals', formatPost({ scanId }));
    const reconStatus = await reconStatusResult.json();
    return reconStatus;
}

// closeAudit
export const closeAudit = async (scan_id, comments, type, user) => {
    const body = {
        scan_id,
        comments,
        type,
        user
    };
    const result = await fetch('/customer-audit-close', formatPost(body));
    return result.ok ? 'Audit closed.' : 'Close audits failed.';
};