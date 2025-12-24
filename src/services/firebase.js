import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const saveInterviewSession = async (sessionData) => {
  try {
    // Add serverTimestamp for accurate sorting later
    const docRef = await addDoc(collection(db, 'interviews'), {
      ...sessionData,
      createdAt: serverTimestamp(),
      localDate: new Date().toISOString()
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving interview:', error);
    // We throw the error so App.jsx knows something went wrong, 
    // BUT we will handle it gracefully there so the spinner stops.
    throw error;
  }
};

// ... keep getInterviewSessions and uploadVideoRecording as they were
export const getInterviewSessions = async () => {
  const querySnapshot = await getDocs(collection(db, 'interviews'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const uploadVideoRecording = async (blob, sessionId) => {
  const storageRef = ref(storage, `interviews/${sessionId}/recording.webm`);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
};