import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { UserProvider } from "@/contexts/UserContext"
import UserBadge from "@/components/UserBadge"
import styles from "@/components/UserBadge/userbadge.module.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <div className={styles.wrapper}>
        <UserBadge />
        <Component {...pageProps} />
      </div>
    </UserProvider>
  )
}