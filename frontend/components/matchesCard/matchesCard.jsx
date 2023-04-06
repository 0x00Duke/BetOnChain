import React, { useEffect, useRef } from 'react';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import moment from 'moment';
import styles from "../../styles/MatchesCard.module.css";
import data from '../../database/data';
// import Logo from '../Logo/Logo'
import { useDispatch, useSelector } from 'react-redux';
import { setMatchId, next, prev } from '../../store/slices/matchSlice';

const MatchesCard = ({ activeMatchId, nextButton, backButton, clickMatch }) => {
  // Declare a dispatch function using the useDispatch hook
  const dispatch = useDispatch();
  // Declare variables to hold the match id and current index using the useSelector hook
  const matchId = useSelector(state => state.matchId.matchId);
  // Create a function to handle the next button click
  const handleNextClick = () => {
    // Dispatch the next action
    dispatch(next());
  }
  // Create a function to handle the previous button click
  const handlePrevClick = () => {
    dispatch(prev());
  };
  const matches = data;
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const activeItem = card.querySelector(`.${ styles.matchesCardItem } .${ styles.active }`);
    const cardRect = card.getBoundingClientRect();
    if (activeItem) {
      const activeRect = activeItem.getBoundingClientRect();
      if (activeRect.top < cardRect.top || activeRect.bottom > cardRect.bottom) {
        activeItem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [matchId]);

  return (
    <div className={styles.matchesCard}>
      <div className={styles.matchesCardTitle}>
        Upcoming Matches
        <span className={styles.icons}>
          <KeyboardArrowLeft onClick={handlePrevClick} className={styles.icon} />
          <KeyboardArrowRight onClick={handleNextClick} className={styles.icon} />
        </span>
      </div>
      <div className={styles.matchesCardBody} ref={cardRef}>
        {
          matches.map((match) => (
            <div className={matchId === match?.id ? `${styles.matchesCardItem} ${styles.active}` : `${styles.matchesCardItem}`} key={match?.id} onClick={() => dispatch(setMatchId(match?.id))}>
              <div className={styles.status}>
                {moment(match?.startTimestamp).format('ddd, hA')}
              </div>
              <div className={styles.teamCard}>
                <div className={styles.team}>
                  {/* <span className="teamLogo"> // only if we have the team logo
                    <Logo id={match?.homeTeam?.id} className="logo" />
                  </span> */}
                  <span className={styles.teamName}>
                    {match?.homeTeam?.name}
                  </span>
                  <span>
                    {match?.homeScore?.display}
                  </span>
                </div>
                <div className={styles.team}>
                  {/* <span className='teamLogo'> // only if we have the team logo
                    <Logo id={match?.awayTeam?.id} className="logo" />
                  </span> */}
                  <span className={styles.teamName}>
                    {match?.awayTeam?.name}
                  </span>
                  <span>
                    {match?.awayScore?.display}
                  </span>
                </div>
              </div>
              {/* {
                match?.homeScore?.penalties && (
                  <div className={styles.chart}>
                    <div className={styles.nm}>
                      pen.
                    </div>
                    <div className={styles.aggregate}>
                      <div className={styles.teamOne}>({match?.homeScore?.penalties})</div>
                      <div className={styles.teamTwo}>({match?.awayScore?.penalties})</div>
                    </div>
                  </div>
                )
              } */}
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default MatchesCard