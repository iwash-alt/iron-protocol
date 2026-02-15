import { colors } from '@/shared/theme/tokens';

export function LoadingSpinner() {
  return (
    <div style={styles.wrap}>
      <div style={styles.dot} />
      <style>{`@keyframes ironPulse{0%,100%{transform:scale(0.8);opacity:.5}50%{transform:scale(1.1);opacity:1}}`}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '35vh',
    display: 'grid',
    placeItems: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: colors.primary,
    boxShadow: `0 0 20px ${colors.primary}`,
    animation: 'ironPulse 1s ease-in-out infinite',
  },
};
