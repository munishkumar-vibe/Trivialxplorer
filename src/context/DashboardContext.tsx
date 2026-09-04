"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from "react";
import type { ContentCard, ContentType, ContentStatus } from "@/types/creator";
import { useAuth } from "@/context/AuthContext";
import { BLOG, ITINERARY } from "@/lib/api/endpoints";
function toAbsUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : path;
}

function mapApiPost(raw: Record<string, unknown>): ContentCard {
  const authorObj = raw.author as Record<string, unknown> | string | null;
  return {
    id: raw._id as string,
    type: "blog",
    title: raw.title as string,
    thumbnailUrl: toAbsUrl(raw.imageUrl as string | undefined),
    status: (raw.status as ContentStatus) ?? "published",
    createdAt: raw.createdAt as string,
    viewCount: raw.viewCount as number | undefined,
    description: raw.description as string | undefined,
    content: raw.content as string | undefined,
    author: typeof authorObj === "object" && authorObj !== null
      ? (authorObj.name as string)
      : (authorObj as string | undefined),
  };
}

function mapApiItinerary(raw: Record<string, unknown>): ContentCard {
  const authorObj = raw.author as Record<string, unknown> | string | null;
  return {
    id: raw._id as string,
    type: "itinerary",
    title: raw.title as string,
    thumbnailUrl: toAbsUrl(raw.coverImageUrl as string | undefined),
    status: (raw.status as ContentStatus) ?? "published",
    createdAt: raw.createdAt as string,
    viewCount: raw.viewCount as number | undefined,
    description: raw.description as string | undefined,
    author: typeof authorObj === "object" && authorObj !== null
      ? (authorObj.name as string)
      : (authorObj as string | undefined),
  };
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface DashboardState {
  items: ContentCard[];
  isLoadingContent: boolean;
  activeForm: ContentType | null;
  editingPost: ContentCard | null;
  toasts: Toast[];
}

type Action =
  | { type: "SET_ITEMS"; items: ContentCard[] }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "PREPEND_ITEM"; item: ContentCard }
  | { type: "UPDATE_ITEM"; item: ContentCard }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "OPEN_FORM"; formType: ContentType; editingPost?: ContentCard }
  | { type: "CLOSE_FORM" }
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: string };

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case "SET_ITEMS":    return { ...state, items: action.items };
    case "SET_LOADING":  return { ...state, isLoadingContent: action.loading };
    case "PREPEND_ITEM": return { ...state, items: [action.item, ...state.items] };
    case "UPDATE_ITEM":  return { ...state, items: state.items.map((i) => i.id === action.item.id ? action.item : i) };
    case "REMOVE_ITEM":  return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "OPEN_FORM":    return { ...state, activeForm: action.formType, editingPost: action.editingPost ?? null };
    case "CLOSE_FORM":   return { ...state, activeForm: null, editingPost: null };
    case "ADD_TOAST":    return { ...state, toasts: [...state.toasts, action.toast] };
    case "REMOVE_TOAST": return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default: return state;
  }
}

interface DashboardContextValue {
  items: ContentCard[];
  isLoadingContent: boolean;
  activeForm: ContentType | null;
  editingPost: ContentCard | null;
  toasts: Toast[];
  openForm: (type: ContentType) => void;
  openEditForm: (post: ContentCard) => void;
  closeForm: () => void;
  prependItem: (item: ContentCard) => void;
  updateItem: (item: ContentCard) => void;
  removeItem: (id: string) => void;
  showToast: (message: string, type?: "success" | "error") => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { accessToken, status } = useAuth();
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    isLoadingContent: true,
    activeForm: null,
    editingPost: null,
    toasts: [],
  });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !accessToken) {
      dispatch({ type: "SET_LOADING", loading: false });
      return;
    }

    let cancelled = false;
    const headers = { Authorization: `Bearer ${accessToken}` };

    async function fetchAll() {
      dispatch({ type: "SET_LOADING", loading: true });
      try {
        const [blogsRes, itinsRes] = await Promise.all([
          fetch(`${BLOG.LIST}?author=me`,      { credentials: "include", headers }),
          fetch(`${ITINERARY.LIST}?author=me`, { credentials: "include", headers }),
        ]);

        const blogs = blogsRes.ok
          ? ((await blogsRes.json()).data as Record<string, unknown>[]).map(mapApiPost)
          : [];
        const itins = itinsRes.ok
          ? ((await itinsRes.json()).data as Record<string, unknown>[]).map(mapApiItinerary)
          : [];

        if (!cancelled) dispatch({ type: "SET_ITEMS", items: [...blogs, ...itins] });
      } catch {
        // silently fail — empty state will show
      } finally {
        if (!cancelled) dispatch({ type: "SET_LOADING", loading: false });
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [accessToken, status]);

  const openForm = useCallback((formType: ContentType) => {
    dispatch({ type: "OPEN_FORM", formType });
  }, []);

  const openEditForm = useCallback((post: ContentCard) => {
    dispatch({ type: "OPEN_FORM", formType: "blog", editingPost: post });
  }, []);

  const closeForm = useCallback(() => {
    dispatch({ type: "CLOSE_FORM" });
  }, []);

  const prependItem = useCallback((item: ContentCard) => {
    dispatch({ type: "PREPEND_ITEM", item });
  }, []);

  const updateItem = useCallback((item: ContentCard) => {
    dispatch({ type: "UPDATE_ITEM", item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", id });
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: "ADD_TOAST", toast: { id, message, type } });
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), 4000);
  }, []);

  return (
    <DashboardContext.Provider value={{ ...state, openForm, openEditForm, closeForm, prependItem, updateItem, removeItem, showToast }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be inside <DashboardProvider>");
  return ctx;
}
