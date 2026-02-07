import React from 'react';
import { S } from '../styles';
import Icon from '../components/Icon';
import { getTimeGreeting } from '../../analytics/stats';

export default function Header({ profile, streak }) {
  return (
    <header style={S.header}>
      <div style={S.headerLeft}>
        <div style={S.logo}><Icon name="dumbbell" size={22} /></div>
        <div>
          <h1 style={S.title}>IRON PROTOCOL</h1>
          <p style={S.welcome}>Good {getTimeGreeting()}, {profile.name?.split(' ')[0]} &#x1F4AA;</p>
        </div>
      </div>
      <div style={S.streak}><Icon name="flame" size={16} /> {streak}</div>
    </header>
  );
}
