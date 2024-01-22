
import * as React from 'react';

const DevDataViewer = ({ data }) => {
    return (
        <div id='dev-data-viewer'>
            {JSON.stringify(data)}
        </div>
    );
};

export default DevDataViewer;
