import { Question, QuestionCategory, GameMode, IntensityLevel } from "@/types/game";
import { SEED_QUESTIONS } from "@/data/questions";

const CUSTOM_QUESTIONS_KEY = "insight_custom_questions";
const DELETED_QUESTIONS_KEY = "insight_deleted_questions";
const REPORTS_STORAGE_KEY = "insight_question_reports";

export interface QuestionReport {
  id: string;
  questionId: string;
  questionText: string;
  reason: string;
  reportedBy: string;
  reportedAt: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
}

class QuestionStore {
  private customQuestions: Question[] = [];
  private deletedIds: Set<string> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const rawCustom = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
        if (rawCustom) {
          this.customQuestions = JSON.parse(rawCustom);
        }
        const rawDeleted = localStorage.getItem(DELETED_QUESTIONS_KEY);
        if (rawDeleted) {
          this.deletedIds = new Set(JSON.parse(rawDeleted));
        }
      } catch {}
    }
  }

  public getCustomQuestions(): Question[] {
    return [...this.customQuestions];
  }

  public getAllQuestions(): Question[] {
    const activeSeed = SEED_QUESTIONS.filter((q) => !this.deletedIds.has(q.id));
    return [...this.customQuestions, ...activeSeed];
  }

  public addQuestion(question: Omit<Question, "id">): Question {
    const newQ: Question = {
      ...question,
      id: `q-custom-${Date.now()}`,
    };
    this.customQuestions.unshift(newQ);
    this.saveCustom();
    return newQ;
  }

  public updateQuestion(id: string, updates: Partial<Question>): boolean {
    // Check if custom question
    const customIdx = this.customQuestions.findIndex((q) => q.id === id);
    if (customIdx >= 0) {
      this.customQuestions[customIdx] = { ...this.customQuestions[customIdx], ...updates };
      this.saveCustom();
      return true;
    }

    // If seed question, copy to custom override
    const seedQ = SEED_QUESTIONS.find((q) => q.id === id);
    if (seedQ) {
      this.deletedIds.add(id);
      this.saveDeleted();
      this.customQuestions.unshift({ ...seedQ, ...updates });
      this.saveCustom();
      return true;
    }

    return false;
  }

  public deleteQuestion(id: string): boolean {
    const customIdx = this.customQuestions.findIndex((q) => q.id === id);
    if (customIdx >= 0) {
      this.customQuestions.splice(customIdx, 1);
      this.saveCustom();
      return true;
    }

    this.deletedIds.add(id);
    this.saveDeleted();
    return true;
  }

  public reportQuestion(questionId: string, questionText: string, reason: string, reporter: string) {
    if (typeof window === "undefined") return;
    const reports = this.getReports();
    reports.unshift({
      id: `rep_${Date.now()}`,
      questionId,
      questionText,
      reason,
      reportedBy: reporter,
      reportedAt: new Date().toLocaleDateString(),
      status: "PENDING",
    });
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  }

  public getReports(): QuestionReport[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public resolveReport(reportId: string, action: "RESOLVED" | "DISMISSED") {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (rep) {
      rep.status = action;
      if (typeof window !== "undefined") {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
      }
    }
  }

  private saveCustom() {
    if (typeof window !== "undefined") {
      localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(this.customQuestions));
    }
  }

  private saveDeleted() {
    if (typeof window !== "undefined") {
      localStorage.setItem(DELETED_QUESTIONS_KEY, JSON.stringify(Array.from(this.deletedIds)));
    }
  }
}

export const questionStore = new QuestionStore();

