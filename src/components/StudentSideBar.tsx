import React, { useMemo } from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

const SidebarWrap = styled.aside`
  width: 260px;
  background: #fff;
  border-radius: 18px;
  margin: 24px;
  padding: 28px;
  box-shadow: 0 8px 30px rgba(25, 37, 51, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;

  @media (max-width: 980px) {
    width: 220px;
    margin: 16px;
    padding: 20px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.div`
  text-align: center;
  img {
    height: 150px;
    margin-bottom: 8px;
    max-width: 100%;
  }
  p {
    color: #999;
    font-size: 12px;
    margin-top: 6px;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 20px 0 0;
  margin: 0;
  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 10px;
    color: #5b5b5b;
    cursor: pointer;
    margin-bottom: 8px;
    font-weight: 500;
    transition: background 0.2s ease;
    &:hover {
      background: rgba(213, 91, 0, 0.06);
      color: #d55b00;
    }
    &.active {
      color: #d55b00;
      background: rgba(213, 91, 0, 0.08);
    }
    a {
      text-decoration: none;
      color: inherit;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;

const SidebarFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  overflow: hidden;
`;

export default function StudentSidebar({ menuItems = [], active, onSelect, onLogout }) {
  const location = useLocation();

  const email = useMemo(() => localStorage.getItem("user_email") || "student@grasp.app", []);
  const role = useMemo(() => localStorage.getItem("user_role") || "student", []);
  const userName = useMemo(() => localStorage.getItem("user_name") || "", []);

  // prefer name, else fallback to email
  const displayName = userName.trim() || email;

  // initials based on name or email
  const initials = useMemo(() => {
    const base = userName.trim() || email.split("@")[0];
    return (base.slice(0, 2) || "U").toUpperCase();
  }, [userName, email]);

  const activeLabel =
    active || menuItems.find((m) => m.url === location.pathname)?.label || "";

  return (
    <SidebarWrap>
      <div>
        <Logo>
          <img src="/GRASPLogo1.png" alt="grasp" />
          <p>Student Portal</p>
        </Logo>

        <NavList>
          {menuItems.map((item) => {
            const isLogout = item.url === "/logout";
            return (
              <li
                key={item.label}
                className={activeLabel === item.label ? "active" : ""}
              >
                {isLogout ? (
                  <button
                    onClick={() => onLogout?.()}
                    style={{
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      margin: 0,
                      cursor: "pointer",
                      color: "inherit",
                      width: "100%",
                      textAlign: "left",
                      font: "inherit",
                    }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    to={item.url}
                    onClick={() => onSelect?.(item.label)}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </NavList>
      </div>

      {/* footer */}
      <SidebarFooter>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(180deg,#fff,#ffeae0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d55b00",
              fontWeight: 800,
              flex: "0 0 auto",
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                color: "#d55b00",
                fontWeight: 700,
                fontSize: 14,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 160,
              }}
            >
              {displayName}
            </p>
            <small
              style={{
                display: "block",
                color: "#aaa",
                textTransform: "capitalize",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {role}
            </small>
          </div>
        </div>
      </SidebarFooter>
    </SidebarWrap>
  );
}
