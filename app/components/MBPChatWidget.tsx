import React from 'react';
import { Auth } from 'firebase/auth'; // Make sure to import your Firebase Auth correctly

interface MBPChatWidgetProps {
    // other props...
    userName: string; // Adding userName prop
}

const MBPChatWidget: React.FC<MBPChatWidgetProps> = ({ userName }) => {
    // Use the userName in your component logic or pass to child components
    return (
        <div>
            <p>Logged in as: {userName}</p>
            {/* Pass userName to your child components here */}
        </div>
    );
};

export default MBPChatWidget;
