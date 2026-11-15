"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ExternalLink, LayoutDashboard, Lock, LogOut } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import type { JwtUser } from "@/lib/server-auth";
import { useLogoutFromDbMutation } from "@/redux/fetchers/auth/authApi";
import { logout } from "@/redux/fetchers/auth/authSlice";
import { useAppDispatch } from "@/redux/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  lang: string;
  t: Dict;
  user: JwtUser;
}

export default function DashboardHeader({ lang, t, user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [logoutFromDb] = useLogoutFromDbMutation();

  async function handleLogout() {
    await logoutFromDb()
      .unwrap()
      .catch(() => {});
    dispatch(logout());
    router.push(`/${lang}/login`);
    router.refresh();
  }

  const name = user.name ?? user.email;
  const role = user.role === "ADMIN" ? "Admin" : "Sales";
  const roleKey = user.role === "ADMIN" ? "admin" : "sales";

  const base = `/${lang}/dashboard/${roleKey}`;
  const segment =
    pathname === base ? "" : pathname.slice(base.length).replace(/^\//, "").split("/")[0];
  const title = segment
    ? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : user.role === "ADMIN"
      ? t.dash.overview
      : t.dash.myDashboard;

  return (
    <header className="dash-header">
      <div className="dash-header__title">
        <p className="dash-header__crumb">
          {user.role === "ADMIN" ? t.dash.adminPanel : t.dash.userPanel}
        </p>
        <h1>{title}</h1>
      </div>
      <Link href={`/${lang}`} target="_blank" className="dash-header__site">
        <ExternalLink size={14} aria-hidden="true" />
        <span>{t.dash.publicSite}</span>
      </Link>
      <div className="dash-header__menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="dash-header__trigger" aria-label="Open profile menu">
              <Avatar className="dash-header__avatar">
                <AvatarFallback className="dash-header__avatar-fallback">
                  {name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="dash-header__who">
                <span className="dash-header__name">{name}</span>
                <span className="dash-header__role">{role}</span>
              </span>
              <ChevronDown size={15} className="dash-header__chevron" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="dmenu-profile">
              <Avatar className="dmenu-profile__avatar">
                <AvatarFallback className="dash-header__avatar-fallback">
                  {name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="dmenu-head-text">
                <p className="dmenu-name">{name}</p>
                <p className="dmenu-email">{user.email}</p>
              </div>
            </div>
            <DropdownMenuLabel>{t.dash.myAccount}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={base}>
                <span className="dmenu-icon">
                  <LayoutDashboard size={15} aria-hidden="true" />
                </span>
                <span>{user.role === "ADMIN" ? t.dash.overview : t.dash.myDashboard}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${base}/change-password`}>
                <span className="dmenu-icon">
                  <Lock size={15} aria-hidden="true" />
                </span>
                <span>{t.dash.changePassword}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${lang}`} target="_blank">
                <span className="dmenu-icon">
                  <ExternalLink size={15} aria-hidden="true" />
                </span>
                <span>{t.dash.publicSite}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="danger" onClick={handleLogout}>
              <span className="dmenu-icon">
                <LogOut size={15} aria-hidden="true" />
              </span>
              <span>{t.dash.logout}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
