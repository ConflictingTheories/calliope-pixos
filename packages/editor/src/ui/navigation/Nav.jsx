/**
 * Nav Component
 */
import React, { createContext, useContext } from 'react';
import './Nav.css';

const NavContext = createContext(null);

export function Nav({ 
  children,
  activeKey,
  appearance = 'default',
  vertical = false,
  justified = false,
  className = '',
  onSelect,
  style,
  ...props 
}) {
  const classes = [
    'px-nav',
    `px-nav-${appearance}`,
    vertical && 'px-nav-vertical',
    justified && 'px-nav-justified',
    className
  ].filter(Boolean).join(' ');

  return (
    <NavContext.Provider value={{ activeKey, onSelect }}>
      <nav className={classes} style={style} {...props}>
        {children}
      </nav>
    </NavContext.Provider>
  );
}

Nav.Item = function NavItem({ 
  children, 
  eventKey,
  active,
  disabled = false,
  icon,
  className = '',
  href,
  ...props 
}) {
  const context = useContext(NavContext);
  const isActive = active ?? (context?.activeKey === eventKey);

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (!href) {
      e.preventDefault();
    }
    context?.onSelect?.(eventKey, e);
    props.onClick?.(e);
  };

  const classes = [
    'px-nav-item',
    isActive && 'px-nav-item-active',
    disabled && 'px-nav-item-disabled',
    className
  ].filter(Boolean).join(' ');

  const Component = href ? 'a' : 'button';
  const componentProps = href ? { href } : { type: 'button' };

  return (
    <Component 
      className={classes} 
      onClick={handleClick}
      {...componentProps}
      {...props}
    >
      {icon && <span className="px-nav-item-icon">{icon}</span>}
      {children}
    </Component>
  );
};
