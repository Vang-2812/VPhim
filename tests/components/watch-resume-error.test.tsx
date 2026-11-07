// @vitest-environment node
import { expect, it, vi } from "vitest";
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { normalizeDetail } from "@/features/movies/normalize";
import fixture from "../fixtures/kkphim/detail.json";
const boundary = vi.hoisted(() => ({
  getMovie: vi.fn(),
  getMovieResume: vi.fn(),
}));
vi.mock("@/features/movies/client.server", () => ({
  getMovie: boundary.getMovie,
}));
vi.mock("@/features/playback/progress.server", () => ({
  getMovieResume: boundary.getMovieResume,
}));
vi.mock("@/features/auth/context.server", () => ({
  getOptionalMember: async () => ({
    userId: "user-a",
    role: "member",
    membership: "normal",
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  notFound: () => {
    throw Error("404");
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));
import WatchPage from "@/app/(public)/xem/[slug]/page";
// Resolve async server components while leaving client components to React's
// real SSR renderer. No mocked player: a mounted player would emit <video>.
async function resolveServer(node: ReactNode): Promise<ReactNode> {
  if (Array.isArray(node)) return Promise.all(node.map(resolveServer));
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode }>;
  if (
    typeof element.type === "function" &&
    element.type.constructor.name === "AsyncFunction"
  )
    return resolveServer(
      await (element.type as (props: unknown) => Promise<ReactNode>)(
        element.props,
      ),
    );
  return cloneElement(element, {}, await resolveServer(element.props.children));
}
it("does not mount playback after a failed resume read", async () => {
  boundary.getMovie.mockResolvedValue({
    ok: true,
    data: normalizeDetail(fixture),
  });
  boundary.getMovieResume.mockResolvedValue({
    ok: false,
    code: "SAVE_FAILED",
    message: "Resume temporarily unavailable",
  });
  const page = await WatchPage({
    params: Promise.resolve({ slug: "phim-a" }),
    searchParams: Promise.resolve({}),
  });
  const html = renderToStaticMarkup(await resolveServer(page));
  expect(html).not.toContain("<video");
  expect(html).toContain("Resume temporarily unavailable");
});
