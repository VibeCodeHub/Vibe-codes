import React from 'react';

function App(): React.ReactElement {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', background: '#0b0e11', color: '#e6e9ee' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 12px' }}>R3F Glass Tetris</h1>
        <p style={{ opacity: 0.8, margin: 0 }}>Scaffold running. Scene and gameplay coming next.</p>
      </div>
    </div>
  );
}

export default App;

