import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.js";
import { createFlashCard, getFlashCardsByFilter, getFlashCardById, updateFlashCard, deleteFlashCard } from "../controllers/flashCard.controller.js";

const flashCardRouter = Router();

flashCardRouter.use(verifyAuth);

flashCardRouter.route("/create-flashcard").post(createFlashCard);
flashCardRouter.route("/get-flashcards").get(getFlashCardsByFilter);
flashCardRouter.route("/get-flashcard/:id").get(getFlashCardById);
flashCardRouter.route("/update-flashcard/:id").put(updateFlashCard);
flashCardRouter.route("/delete-flashcard/:id").delete(deleteFlashCard);



export default flashCardRouter;