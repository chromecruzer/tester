export const rowHeight = 26;

export const SECONDS_IN_DAY = 24 * 60 * 60 * 1000;

export const daysUntil = (date, now = Date.now()) => {
    const daysUntil = Math.ceil((new Date(date).getTime() - now) / (SECONDS_IN_DAY));
    return (daysUntil > 60) ? 'greaterThanSixty' : (daysUntil > 30) ? 'thirtyOneToSixty' : (daysUntil > 0) ? 'zeroToThirty' : 'pastExpiration';
};

export const getGridHeight = (rows, maxGridHeight = 200) => {
    const height = rowHeight * rows + 100;
    return height < maxGridHeight ? height : maxGridHeight;
};

// a11yProps: Supports screen reader attributes.
export const a11yProps = (index, panelGroupName) => {
    return {
        id: `${panelGroupName}-tab-${index}`,
        'aria-controls': `${panelGroupName}-tabpanel-${index}`,
    };
};

