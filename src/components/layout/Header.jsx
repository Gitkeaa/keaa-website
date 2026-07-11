import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, ChevronDown, FileText } from 'lucide-react';
import TopBar from './TopBar';
import Logo from './Logo';
import Button from '../ui/Button';
import { mainNav } from '../../data/navigation';
import { productCategories } from '../../data/products';

export default function Header({ onOpenMegaMenu, onOpenDrawer }) {
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 w-full bg-white transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <TopBar />
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
        <Link to="/" aria-label="KEAA International home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {mainNav.map((item) =>
            item.label === 'Products' ? (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1 text-sm font-medium transition-colors ${
                      isActive ? 'text-navy-800' : 'text-ink/70 hover:text-navy-800'
                    }`
                  }
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </NavLink>
                {productsOpen && (
                  <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3">
                    <div className="rounded-xl border border-navy-100 bg-white p-2 shadow-cardHover">
                      {productCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/products#${cat.slug}`}
                          className="block rounded-lg px-3.5 py-2.5 text-sm text-ink/80 hover:bg-navy-50 hover:text-navy-800"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-primary-dark after:transition-all ${
                    isActive
                      ? 'text-navy-800 after:w-full'
                      : 'text-ink/70 after:w-0 hover:text-navy-800 hover:after:w-full'
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <Button to="/rfq" variant="primary" size="sm" icon={FileText} className="hidden sm:inline-flex">
            Request a Quote
          </Button>
          <button
            onClick={onOpenMegaMenu}
            className="hidden h-10 w-10 items-center justify-center rounded-md border border-navy-100 text-navy-700 transition-colors hover:bg-navy-50 lg:flex"
            aria-label="Open explore menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={onOpenDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-navy-100 text-navy-700 hover:bg-navy-50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
