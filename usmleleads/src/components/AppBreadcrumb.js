import React from 'react';
import { useLocation } from 'react-router-dom';
import routes from '../routes';
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react';

const AppBreadcrumb = ({ isUserLoggedIn ,ActualUser}) => {
  const currentLocation = useLocation().pathname;
  const getRouteName = (pathname, routes) => {
  let rou=routes.public
  if(ActualUser)
  {
    rou=routes[ActualUser.role]
  }
    const currentRoute = rou.find((route) => route.path === pathname);
    return currentRoute ? currentRoute.name : false;
  };

  const getBreadcrumbs = (location) => {
    const breadcrumbs = [];
    location.split('/').reduce((prev, curr, index, array) => {
      let currentPathname = `${prev}/${curr}`;
      currentPathname=currentPathname.replace("//", "/");
      const routeName = getRouteName(currentPathname, routes);
      if (routeName) {
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length,
        });
      }
      return currentPathname;
    }, '');
    return breadcrumbs;
  };

  // Filter routes based on user's login status
  const filteredRoutes = isUserLoggedIn ? routes.restricted : routes.public;

  const breadcrumbs = getBreadcrumbs(currentLocation);

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => (
        <CBreadcrumbItem
          {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
          key={index}
        >
          {breadcrumb.name}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  );
};

export default React.memo(AppBreadcrumb);
