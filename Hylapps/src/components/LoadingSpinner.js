import { TailSpin } from 'react-loader-spinner';

const LoadingSpinner = () => (
  <div style={styles.container}>
    <TailSpin height={80} width={80} color="#007bff" />
  </div>
);

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'transparent', // semi-transparent white, or use rgba(0, 0, 0, 0.5) for darker
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // ensures it stays on top
  },
};

export default LoadingSpinner;
