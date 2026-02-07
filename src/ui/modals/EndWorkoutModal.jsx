import React from 'react';
import { S } from '../styles';
import Icon from '../components/Icon';

export default function EndWorkoutModal({ progress, onKeepGoing, onEnd }) {
  return (
    <div style={S.overlay}>
      <div style={S.confirmBox}>
        <Icon name="alert" size={32} />
        <h3 style={S.confirmTitle}>End Workout Early?</h3>
        <p style={S.confirmText}>
          You've done {progress}% - incomplete exercises will have weight reduced next time.
        </p>
        <div style={S.confirmBtns}>
          <button onClick={onKeepGoing} style={S.keepBtn}>KEEP GOING</button>
          <button onClick={onEnd} style={S.endBtn}>END IT</button>
        </div>
      </div>
    </div>
  );
}
