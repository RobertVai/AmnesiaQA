import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar/Sidebar";
import styles from "./questions.module.css";
import { Question } from "@/types/interfaces";
import { useUser } from "@/contexts/UserContext";
import api from "@/utils/api";
import QuestionCard from "@/components/QuestionCard/questioncard";
import LogOut from "@/components/LogOut";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [answerInputs, setAnswerInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const [filter, setFilter] = useState<"all" | "answered" | "unanswered">(
    "all"
  );
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
    } else {
      setIsAuth(true);
      fetchQuestions();
    }
  }, [user, loading]);

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get("/api/questions");
      const { data: userData } = await api.get("/api/auth/me");
      const currentUserId = userData.user._id;

      const enriched = await Promise.all(
        data.map(async (q: any) => {
          let count = 0;
          try {
            const res = await api.get(`/api/question/${q._id}/answers/count`);
            count = res.data.count ?? 0;
          } catch {}
          return {
            ...q,
            liked: q.likedBy?.includes(currentUserId),
            disliked: q.dislikedBy?.includes(currentUserId),
            likes: q.likes || 0,
            dislikes: q.dislikes || 0,
            showAnswers: false,
            answers: [],
            answersCount: count,
          };
        })
      );
      setQuestions(enriched);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (id: string) => {
    try {
      const { data: u } = await api.post(`/api/question/${id}/like`);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === id
            ? {
                ...q,
                likes: u.likes || 0,
                dislikes: u.dislikes || 0,
                liked: u.likedBy.includes(u.currentUserId),
                disliked: false,
              }
            : q
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDislike = async (id: string) => {
    try {
      const { data: u } = await api.post(`/api/question/${id}/dislike`);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === id
            ? {
                ...q,
                likes: u.likes || 0,
                dislikes: u.dislikes || 0,
                disliked: u.dislikedBy.includes(u.currentUserId),
                liked: false,
              }
            : q
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAnswerLike = async (aid: string, qid: string) => {
    try {
      const { data: u } = await api.post(`/api/answer/${aid}/like`);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === qid
            ? {
                ...q,
                answers: q.answers.map((a) =>
                  a._id === aid
                    ? {
                        ...a,
                        likes: u.likes,
                        dislikes: u.dislikes,
                        liked: u.likedBy.includes(u.currentUserId),
                        disliked: false,
                      }
                    : a
                ),
              }
            : q
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAnswerDislike = async (aid: string, qid: string) => {
    try {
      const { data: u } = await api.post(`/api/answer/${aid}/dislike`);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === qid
            ? {
                ...q,
                answers: q.answers.map((a) =>
                  a._id === aid
                    ? {
                        ...a,
                        likes: u.likes,
                        dislikes: u.dislikes,
                        disliked: u.dislikedBy.includes(u.currentUserId),
                        liked: false,
                      }
                    : a
                ),
              }
            : q
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete question?")) return;
    try {
      await api.delete(`/api/question/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnswer = async (aid: string, qid: string) => {
    try {
      await api.delete(`/api/answer/${aid}`);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === qid
            ? { ...q, answers: q.answers.filter((a) => a._id !== aid) }
            : q
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAnswers = async (id: string) => {
    const copy = [...questions];
    const q = copy.find((x) => x._id === id);
    if (!q) return;
    if (!q.answers.length) {
      try {
        const { data } = await api.get(`/api/question/${id}/answers`);
        q.answers = data.map((a: any) => ({
          ...a,
          liked: a.likedBy.includes(user!._id),
          disliked: a.dislikedBy.includes(user!._id),
        }));
        q.answersCount = q.answers.length;
      } catch {}
    }
    q.showAnswers = !q.showAnswers;
    setQuestions(copy);
  };

  const handleAnswerChange = (id: string, val: string) => {
    setAnswerInputs((p) => ({ ...p, [id]: val }));
  };

  const submitAnswer = async (id: string) => {
    const txt = answerInputs[id]?.trim();
    if (!txt) return;
    try {
      const { data: na } = await api.post(`/api/question/${id}/answers`, {
        text: txt,
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === id
            ? {
                ...q,
                answers: [...q.answers, na],
                answersCount: (q.answersCount || 0) + 1,
              }
            : q
        )
      );
      setAnswerInputs((p) => ({ ...p, [id]: "" }));
    } catch {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      <main className={styles.main}>
        <div className={styles.logoutWrapper}>
          <LogOut />
        </div>
        <h1 className={styles.heading}>What’s on your mind?</h1>
        <p className={styles.subheading}>Browse questions or ask your own</p>

        {isAuth && (
          <div className={styles.askWrapper}>
            <Link href="/Ask" className={styles.askBtn}>
              + Ask Question
            </Link>
          </div>
        )}

        <div className={styles.filterWrapper}>
          <label htmlFor="filter" className={styles.filterLabel}>
            Filter:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className={styles.select}
          >
            <option value="all">All</option>
            <option value="answered">Answered</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>

        <div className={styles.list}>
          {user &&
            questions
              .filter((q) =>
                filter === "all"
                  ? true
                  : filter === "answered"
                  ? q.answersCount > 0
                  : q.answersCount === 0
              )
              .map((q) => (
                <QuestionCard
                  key={q._id}
                  q={q}
                  userId={user._id}
                  isAuth={isAuth}
                  answerInputs={answerInputs}
                  onLike={toggleLike}
                  onDislike={toggleDislike}
                  onToggleAnswers={toggleAnswers}
                  onDeleteQuestion={handleDelete}
                  onAnswerLike={toggleAnswerLike}
                  onAnswerDislike={toggleAnswerDislike}
                  onDeleteAnswer={handleDeleteAnswer}
                  onAnswerChange={handleAnswerChange}
                  onSubmitAnswer={submitAnswer}
                />
              ))}
        </div>
      </main>
    </div>
  );
}
