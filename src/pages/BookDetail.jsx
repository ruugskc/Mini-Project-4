import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../api/books";
import CoverGenerator from "../components/CoverGenerator";

export default function BookDetail() {
  const { id } = useParams(); // id 읽기
  const navigate = useNavigate();
  const deleteDialog = useRef(null);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteDone, setDeleteDone] = useState(false);
  const [showCoverGenerator, setShowCoverGenerator] = useState(false);
  const coverGeneratorRef = useRef(null);

  // 토글을 열면 AI 표지 생성 영역이 보이도록 부드럽게 스크롤
  useEffect(() => {
    if (showCoverGenerator) {
      coverGeneratorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showCoverGenerator]);

  useEffect(() => {
    const cancelHandle = new AbortController();

    async function loadBook() {
      // 새 요청 시작 시 로딩을 켜고 이전 에러를 지워 줌
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/${id}`, {
          signal: cancelHandle.signal,
        });

        if (response.status === 404) {
          throw new Error("해당 도서를 찾을 수 없습니다.");
        }
        if (!response.ok) {
          throw new Error("도서 정보를 불러오지 못했습니다.");
        }

        setBook(await response.json());
      } catch (err) {
        if (!cancelHandle.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!cancelHandle.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBook();

    // 화면을 떠나거나 id가 바뀌면 이전 요청을 취소
    return () => cancelHandle.abort();
  }, [id]);

  function formatDate(value) {
    return new Date(value).toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      dateStyle: "medium",
      timeStyle: "short",
      hour12: false,
    });
  }

  function openDeleteDialog() {
    setDeleteDone(false);
    setDeleteError("");
    deleteDialog.current.showModal();
  }

  // 팝업에서 '예'를 눌렀을 때만 삭제 요청을 보냄
  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("도서를 삭제하지 못했습니다.");
      }

      // 같은 팝업을 삭제 완료 화면으로 바꿈
      setDeleteDone(true);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit() {
    navigate(`/books/${id}/edit`);
  }

  // AI 표지 생성이 끝나면 화면의 book 상태에 즉시 반영
  function handleCoverGenerated(url) {
    setBook((prev) => ({ ...prev, coverImageUrl: url }));
  }

  return (
    <section>
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">도서 정보를 불러오는 중이에요...</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && book && (
        <>
          <div
            className="d-flex align-items-end gap-2 flex-wrap border-bottom border-1 pb-2"
            style={{ "--bs-border-color": "#7cc8c6" }}
          >
            <h1 className="h2 mb-0">{book.title}</h1>
            <span className="h5 mb-0 me-auto">{book.author}</span>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={openDeleteDialog}
              aria-label="도서 삭제"
            >
              🗑️ 삭제
            </button>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleEdit}
            >
              ✏️ 수정
            </button>
          </div>

          <div className="card card-outline shadow-sm mt-4">
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-12 col-md-4 text-center">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={`${book.title} 표지`}
                      className="d-block mx-auto rounded shadow"
                      style={{ width: "100%", maxWidth: 240, height: "auto" }}
                    />
                  ) : (
                    <div
                      className="bg-light text-muted rounded d-flex align-items-center justify-content-center mx-auto"
                      style={{ width: "100%", maxWidth: 200, aspectRatio: "2 / 3" }}
                    >
                      표지 없음
                    </div>
                  )}

                  <div className="mt-3">
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        showCoverGenerator ? "btn-primary" : "btn-outline-primary"
                      }`}
                      aria-expanded={showCoverGenerator}
                      onClick={() => setShowCoverGenerator((prev) => !prev)}
                    >
                      ✨ AI 표지 생성 {showCoverGenerator ? "▴" : "▾"}
                    </button>
                  </div>
                </div>

                <div className="col-12 col-md-8">
                  <h2 className="h5">책 내용</h2>
                  <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                    {book.content || "등록된 도서 소개가 없어요."}
                  </p>

                  <hr />

                  <p className="small text-muted mb-1">
                    등록일자: {formatDate(book.createdAt)}
                  </p>
                  {book.updatedAt && book.createdAt !== book.updatedAt && (
                    <p className="small text-muted mb-0">
                      수정일자: {formatDate(book.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI 표지 생성 (E 담당 컴포넌트): 토글 버튼을 눌렀을 때만 표시 */}
          {showCoverGenerator && (
            <div ref={coverGeneratorRef} style={{ scrollMarginTop: 80 }}>
              <CoverGenerator book={book} onGenerated={handleCoverGenerated} />
            </div>
          )}

          <div className="text-center mt-5">
            <Link to="/books" className="btn btn-outline-secondary">
              도서 목록으로 돌아가기
            </Link>
          </div>

          <dialog
            ref={deleteDialog}
            aria-labelledby="delete-title"
            className="rounded-3 shadow p-3 text-center m-auto"
            style={{
              width: 340,
              maxWidth: "calc(100vw - 32px)",
              border: "1px solid #7cc8c6",
            }}
            onCancel={(event) => {
              if (deleting) event.preventDefault();
            }}
            onClose={() => {
              // 삭제 완료 상태에서 팝업을 닫으면 목록으로 이동
              if (deleteDone) window.location.replace("/books");
            }}
          >
            <p id="delete-title" className="mb-3">
              {deleteDone
                ? "도서 삭제 완료 🗑️"
                : `‘${book.title}’ 도서를 삭제할까요?`}
            </p>

            {deleteError && (
              <div className="alert alert-danger py-2 small" role="alert">
                {deleteError}
              </div>
            )}

            <div className="d-flex justify-content-center gap-2">
              {deleteDone ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => deleteDialog.current.close()}
                >
                  확인
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "삭제 중…" : "예"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => deleteDialog.current.close()}
                    disabled={deleting}
                  >
                    아니오
                  </button>
                </>
              )}
            </div>
          </dialog>
        </>
      )}
    </section>
  );
}
