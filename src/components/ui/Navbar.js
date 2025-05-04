import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from './navigation-menu';
import { Badge } from './badge';

function Navbar({ serverStatus }) {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">
            Admin Dashboard
          </Link>
          <div className="ml-4">
            <Badge 
              variant={serverStatus === 'online' 
                ? 'default' 
                : serverStatus === 'error' 
                ? 'secondary' 
                : 'destructive'
              }
            >
              Server: {serverStatus}
              {serverStatus !== 'online' && <span className="ml-1 text-xs">(Configure in Settings)</span>}
            </Badge>
          </div>
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/categories" className="block">
                <NavigationMenuLink active={location.pathname === '/categories'}>
                  Categories
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/parameters" className="block">
                <NavigationMenuLink active={location.pathname === '/parameters'}>
                  Parameters
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/content" className="block">
                <NavigationMenuLink active={location.pathname === '/content'}>
                  Content
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/generate" className="block">
                <NavigationMenuLink active={location.pathname === '/generate'}>
                  Generate
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/settings" className="block">
                <NavigationMenuLink active={location.pathname === '/settings'}>
                  Settings
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/database" className="block">
                <NavigationMenuLink active={location.pathname === '/database'}>
                  Database
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}

export default Navbar;