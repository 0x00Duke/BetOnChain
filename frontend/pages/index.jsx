import BetSlip from "../components/betslip/betslip";
import Card from "../components/card/card";
import MatchesCard from "../components/matchesCard/matchesCard";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.home}>
      <div className={styles.todayLiveMatches}>
        <MatchesCard />
        <Card />
        <BetSlip />
        {/* <LineupCard /> */}
      </div>
    </div>
  );
}
