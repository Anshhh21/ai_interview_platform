import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// 1. Cleaned up Config (No duplicate declaration)
const firebaseConfig = {
  apiKey: "AIzaSyDRjXAmnJIfXdK_-UrDcBuJkHvjaM_oK7U",
  authDomain: "learn-fb-96849.firebaseapp.com",
  projectId: "learn-fb-96849",
  storageBucket: "learn-fb-96849.firebasestorage.app",
  messagingSenderId: "513020093922",
  appId: "1:513020093922:web:3cf2484865df6b3d9785bb",
  measurementId: "G-HDSWMZPTN9"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// 3. Save interview session
export const saveInterviewSession = async (sessionData) => {
  try {
    const docRef = await addDoc(collection(db, 'interviews'), {
      ...sessionData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving interview:', error);
    throw error;
  }
};

// 4. Get all interview sessions
export const getInterviewSessions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'interviews'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching interviews:', error);
    throw error;
  }
};

// 5. Upload video recording
export const uploadVideoRecording = async (blob, sessionId) => {
  try {
    const storageRef = ref(storage, `interviews/${sessionId}/recording.webm`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

// 6. Export the services so App.jsx can use them
export { db, storage, auth };