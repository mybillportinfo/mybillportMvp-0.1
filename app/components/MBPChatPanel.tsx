import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase'; // Ensure to import Firebase configuration
import { auth } from '../firebase'; // Import the authentication module

const MBPChatPanel = () => {
  const [bills, setBills] = useState([]);
  
  const getBillsData = async () => {
    if (!auth.currentUser) {
      console.error("No user is logged in.");
      return;
    }

    const userUid = auth.currentUser.uid; // Get the logged-in user's UID
    const billsCollection = firestore.collection('bills'); // Reference to the bills collection

    try {
      const snapshot = await billsCollection.where('userId', '==', userUid).get();
      const billsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBills(billsData);
    } catch (error) {
      console.error("Error fetching bills: ", error);
    }
  };

  useEffect(() => {
    getBillsData();
  }, []);
  
  return (
    <div>
      {/* Render bills here */}
    </div>
  );
};

export default MBPChatPanel;