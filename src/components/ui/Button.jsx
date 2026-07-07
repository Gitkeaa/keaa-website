import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const variants = {
  primary:
    'bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-card hover:shadow-cardHover',
  navy: 'bg-navy-700 text-white hover:bg-navy-600 shadow-card hover:shadow-cardHover',
  outline: 'border border-white/40 text-white hover:bg-white/10',
  outlineNavy: 'border border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white',
  ghost: 'text-navy-700 hover:bg-navy-50',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  className = '',
  type = 'button',
  ...rest
}) {
  const navigate = useNavigate();
  const classes = `group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md font-display font-semibold tracking-wide transition-colors duration-200 ${variants[variant]} ${sizes[size]} ${className}`;

  const iconMotion = {
    initial: { x: 0 },
    whileHover: { x: iconPosition === 'right' ? 3 : -3 },
  };

  const content = (
    <>
      {Icon && iconPosition === 'left' && (
        <motion.span initial="initial" whileHover="whileHover" className="flex">
          <motion.span variants={iconMotion}>
            <Icon className="h-4 w-4" />
          </motion.span>
        </motion.span>
      )}
      <span className="relative z-10">{children}</span>
      {Icon && iconPosition === 'right' && (
        <motion.span initial="initial" whileHover="whileHover" className="flex">
          <motion.span variants={iconMotion}>
            <Icon className="h-4 w-4" />
          </motion.span>
        </motion.span>
      )}
    </>
  );

  // If it's a link with `to` prop, render as Link element
  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={classes}
        {...rest}
      >
        <motion.div
          whileTap={{ scale: 0.96 }}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.15 }}
          className="flex w-full items-center justify-center gap-2"
        >
          {content}
        </motion.div>
      </Link>
    );
  }

  // If it's an external link
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={classes}
        {...rest}
      >
        <motion.div
          whileTap={{ scale: 0.96 }}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.15 }}
          className="flex w-full items-center justify-center gap-2"
        >
          {content}
        </motion.div>
      </a>
    );
  }

  // Regular button
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={classes}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      {...rest}
    >
      {content}
    </motion.button>
  );
}
