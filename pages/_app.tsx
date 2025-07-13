import "@/styles/globals.css";
import type { AppProps } from "next/app";
import UserBadge from "@/components/UserBadge/index"; 
import styles from "@/components/UserBadge/userbadge.module.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={styles.wrapper}>
      <UserBadge />
      <Component {...pageProps} />
    </div>
  );
}