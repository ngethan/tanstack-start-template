import { createTRPCRouter } from "./init";
import { commentsRouter } from "./routers/comments";
import { postsRouter } from "./routers/posts";
import { shortcutsRouter } from "./routers/shortcuts";
import { userRouter } from "./routers/user";

export const trpcRouter = createTRPCRouter({
	user: userRouter,
	shortcuts: shortcutsRouter,
	posts: postsRouter,
	comments: commentsRouter,
});
export type TRPCRouter = typeof trpcRouter;
