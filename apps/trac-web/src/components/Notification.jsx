
import React, { useContext, useEffect, useState } from 'react';
import {TracContext} from "../TracContext";

export const Notification = props => {
    const appState = useContext(TracContext);
    const { notification } = appState;
    const [notifierOpen, setNotifierOpen] = useState(false);

    const handleNotifierClose = () => {
        if (notifierOpen) setNotifierOpen(false);
    };

    useEffect(() => {
        if (notification && notification.message) setNotifierOpen(true);
    }, [notification]);

    return (
        <div
            // anchorOrigin={{
            //     vertical: 'bottom',
            //     horizontal: 'right'
            // }}
            open={notifierOpen}
            onClose={handleNotifierClose}
            key='app-notification'
            // autoHideDuration={3000} // allow usser-specific setting with fallback default.
        >
            <dialog severity={(notification && notification.level) || 'warning'} variant='filled'>
                {notification && notification.message}
            </dialog>
        </div>
    );
};
