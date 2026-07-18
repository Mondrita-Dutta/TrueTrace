import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import clsx from 'clsx';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // If we are at the root of manufacturer dashboard
  if (pathnames.length === 1 && pathnames[0] === 'manufacturer') {
    return (
      <nav className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <FiHome className="w-4 h-4" />
        <span>Dashboard</span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-6 overflow-x-auto whitespace-nowrap pb-2">
      <Link to="/manufacturer" className="hover:text-primary dark:hover:text-blue-400 transition-colors flex items-center">
        <FiHome className="w-4 h-4 mr-1" />
        Dashboard
      </Link>
      
      {pathnames.slice(1).map((value, index) => {
        const to = `/${pathnames.slice(0, index + 2).join('/')}`;
        const isLast = index === pathnames.length - 2;
        const title = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');

        return (
          <React.Fragment key={to}>
            <FiChevronRight className="w-4 h-4 shrink-0" />
            {isLast ? (
              <span className="font-medium text-slate-800 dark:text-slate-200">{title}</span>
            ) : (
              <Link to={to} className="hover:text-primary dark:hover:text-blue-400 transition-colors">
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
