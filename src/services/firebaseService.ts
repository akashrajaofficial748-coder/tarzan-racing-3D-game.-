import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  const errorJson = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorJson);
  throw new Error(errorJson);
}

export const syncUserProfile = async (user: User, score: number, distance: number) => {
  const path = `users/${user.uid}`;
  try {
    const userDoc = await getDoc(doc(db, path));
    const existing = userDoc.data();
    
    const newHighScore = Math.max(score, existing?.highScore || 0);
    const newTotalDistance = (existing?.totalDistance || 0) + distance;

    await setDoc(doc(db, path), {
      userId: user.uid,
      displayName: user.displayName || 'Anonymous Racer',
      highScore: newHighScore,
      totalDistance: newTotalDistance,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Update leaderboard if new high score
    if (score >= (existing?.highScore || 0)) {
      await setDoc(doc(db, `leaderboard/${user.uid}`), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous Racer',
        score: score,
        distance: distance,
        achievedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserSubscription = async (userId: string) => {
  const path = `users/${userId}`;
  try {
    const userDoc = await getDoc(doc(db, path));
    return userDoc.data()?.subscription || null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateSubscription = async (userId: string, subscription: any) => {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, path), {
      subscription,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getLeaderboard = (callback: (data: any[]) => void) => {
  const path = 'leaderboard';
  const q = query(collection(db, path), orderBy('score', 'desc'), limit(10));
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data());
    callback(data);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const testFirestoreConnection = async () => {
    try {
        await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
        }
    }
};
testFirestoreConnection();
