import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import Logo from "./Logo";

// About Us and Contact Us lead the list; the address block sits right under it.
const LINKS = [
  ["about", "/about"],
  ["contact", "/contact"],
  ["home", ""],
  ["team", "/team"],
  ["products", "/shop"],
  ["solutions", "/solutions"],
  ["projects", "/projects"],
  ["news", "/news"],
  ["careers", "/careers"],
] as const;

export default function Footer({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo light />
          <p className="footer__about">{t.footer.about}</p>
        </div>
        <div>
          <h2 className="footer__h">{t.footer.quick}</h2>
          <ul className="footer__list">
            {LINKS.map(([key, href]) => (
              <li key={key}>
                <Link href={`/${lang}${href}`}>
                  {key === "about" ? t.footer.aboutUs : key === "contact" ? t.footer.contactUs : t.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
          <p className="footer__about footer__addr">
            Cyberspace.az
            <br />
            {t.footer.address}
          </p>
        </div>
      </div>
      <div className="container footer__legal">
        © {new Date().getFullYear()} Cyberspace.az. {t.footer.rights}
      </div>
    </footer>
  );
}
