import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import groupsRouter from "./groups";
import invitesRouter from "./invites";
import usersRouter from "./users";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(groupsRouter);
router.use(invitesRouter);
router.use(usersRouter);
router.use(uploadRouter);

export default router;
