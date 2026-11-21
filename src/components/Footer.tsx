import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import Logo from "./Logo";

const LINKS = [
  ["home", ""],
  ["about", "/about"],
  ["team", "/team"],
  ["products", "/shop"],
  ["solutions", "/solutions"],
  ["projects", "/projects"],
  ["news", "/news"],
  ["careers", "/careers"],
  ["contact", "/contact"],
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
                <Link href={`/${lang}${href}`}>{t.nav[key]}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="footer__h">{t.footer.contact}</h2>
          <p className="footer__about">
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
