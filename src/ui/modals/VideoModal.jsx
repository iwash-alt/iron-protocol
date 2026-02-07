import React from 'react';
import { S } from '../styles';

export default function VideoModal({ exercise, onClose }) {
  if (!exercise) return null;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.videoBox} onClick={e => e.stopPropagation()}>
        <img src={`https://img.youtube.com/vi/${exercise.youtube}/mqdefault.jpg`} alt="" style={S.thumb} />
        <h3 style={S.videoTitle}>{exercise.name}</h3>
        <a href={`https://youtube.com/watch?v=${exercise.youtube}`} target="_blank" rel="noreferrer" style={S.ytBtn}>
          WATCH ON YOUTUBE
        </a>
      </div>
    </div>
  );
}
