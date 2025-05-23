import React from 'react';

function Footer() {
  return (
    <footer className="border-t py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} SpecGen Admin - Fiction & Image Generation Admin Panel
        </p>
      </div>
    </footer>
  );
}

export default Footer;