import React from 'react';
import { S, css } from '../styles';

export default function QuickWorkoutReady({ template, countdown, onCancel }) {
  return (
    <div style={S.container}>
      <div style={S.readyScreen}>
        <h2 style={S.readyTitle}>{template.name}</h2>
        <div style={S.readyCircle}>
          <div style={S.readyCount}>{countdown}</div>
        </div>
        <p style={S.readyText}>GET READY!</p>
        <button onClick={onCancel} style={S.readyCancel}>CANCEL</button>
      </div>
      <style>{css}</style>
    </div>
  );
}
