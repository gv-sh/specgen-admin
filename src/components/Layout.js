import React from 'react';

function Layout({ children }) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {children}
    </div>
  );
}

export default Layout;