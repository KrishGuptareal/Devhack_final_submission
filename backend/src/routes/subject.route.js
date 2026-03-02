import { Router } from "express";
import { getAllSubjects, createSubject, updateSubject, deleteSubject, getSubjectById } from "../controllers/subject.controller.js";
import { verifyAuth } from "../middlewares/auth.js";

const subjectRouter = Router();

// Apply auth middleware to all variants of routes
subjectRouter.use(verifyAuth);

subjectRouter.route("/get-subjects").get(getAllSubjects);
subjectRouter.route("/create-subject").post(createSubject);
subjectRouter.route("/get-subject/:id").get(getSubjectById);
subjectRouter.route("/update-subject/:id").put(updateSubject);
subjectRouter.route("/delete-subject/:id").delete(deleteSubject);

export default subjectRouter;