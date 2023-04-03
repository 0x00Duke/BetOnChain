import styles from "../../styles/BetslipCard.module.css";

const BetslipCard = ({ title, children, className }) => {
  return (
    <div className={`${styles.betslipCard} ${className}`}>
      {
        title && (
          <div className={styles.betslipCardTitle}>
            {title}
          </div>
        )
      }
      <div className={styles.betslipCardBody}>
        {children}
      </div>
    </div>
  )
}

export default BetslipCard