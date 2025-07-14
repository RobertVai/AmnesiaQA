import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/UserContext';
import styles from './logout.module.css';

export default function LogOut() {
  const [showConfirm, setShowConfirm] = useState(false);
  const { logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.logout} onClick={() => setShowConfirm(true)}>
        Log out
      </button>

      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p>Are you sure you want to log out?</p>
            <div className={styles.actions}>
              <button onClick={handleLogout} className={styles.yes}>Yes</button>
              <button onClick={() => setShowConfirm(false)} className={styles.no}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}