import { NavLink, Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100 app-bg">
      <nav
        className="navbar navbar-expand-sm navbar-light bg-body-tertiary border-bottom border-1 shadow-sm sticky-top"
        style={{ "--bs-border-color": "#80bdbb" }}
        aria-label="주 메뉴"
      >
        <div className="container flex-nowrap gap-2">
          <Link className="navbar-brand fw-bold text-nowrap me-0" to="/">
            <span className="d-none d-md-inline">
              📖 AI 표지 생성 도서 관리 시스템
            </span>
            <span className="d-md-none">📖 도서관리 시스템</span>
          </Link>

          <div className="navbar-nav flex-row flex-nowrap align-items-center gap-2 gap-sm-3 text-nowrap">
            <NavLink className="nav-link nav-pill" to="/" end>
              🏠 홈
            </NavLink>

            <NavLink className="nav-link nav-pill" to="/books" end>
              📚 <span className="d-none d-sm-inline">도서 </span>목록
            </NavLink>

            <NavLink className="nav-link nav-pill" to="/books/new" end>
              📝 <span className="d-none d-sm-inline">새 </span>도서 등록
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="container py-5 d-flex flex-column flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}
