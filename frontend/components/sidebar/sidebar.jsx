import { AccountCircle, BarChart, Close, Dashboard, Receipt, SportsSoccer, CurrencyExchange } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import React from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from "../../styles/Sidebar.module.css";

const Sidebar = ({ toggler, closeNav }) => {
  const router = useRouter();
 
  return (
      <div className={(toggler ? styles.sidebar.open : styles.sidebar )}>
      <div className={styles.top}>
        <IconButton aria-label='close' onClick={closeNav} className={styles.close} size='small'>
          <Close fontSize='inherit' />
        </IconButton>
        <span className={styles.logo}>
          <SportsSoccer className={styles.logoBall} />
          BET ON CHAIN<span className={styles.logoSpan}></span>
        </span>
      </div>
      <div className={styles.hr}>
        <hr />
      </div>

      <div className={styles.center}>
        <ul>
          <p className={styles.title}>
            Main
          </p>
          <div className={styles.listItems}>
            <Link href="/" className={router.pathname == "/" ? `${styles.active}` : undefined}>
                <li>
                  <Dashboard className={styles.icon} />
                  <span>
                    Dashboard
                  </span>
                </li>
            </Link>
            <Link href="/">
              <li>
                <BarChart className={styles.icon} />
                <span>
                  My Bets
                </span>
              </li>
            </Link>
            <Link href="/exchange" className={router.pathname == "/exchange" ? `${styles.active}` : undefined} >
              <li>
                <CurrencyExchange className={styles.icon} />
                <span>
                  BOC Token Exchange
                </span>
              </li>
            </Link>
          </div>
          <p className={styles.title}>
            Account
          </p>
          <div className={styles.listItems}>
            <Link href="/transactions" className={router.pathname == "/transactions" ? `${styles.active}` : undefined}> 
              <li>
                <Receipt className={styles.icon} />
                <span>
                  Transactions
                </span>
              </li>
            </Link>
            <Link href="/profile" className={router.pathname == "/profile" ? `${styles.active}` : undefined}>
              <li>
                <AccountCircle className={styles.icon} />
                <span>
                  Achievement NFTs
                </span>
              </li>
            </Link>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar