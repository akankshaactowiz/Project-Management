import express from "express";
import TaskData from '../models/TaskData.js'
import Module from '../models/Module.js'
import {addTask, getTasks} from '../controllers/taskController.js'
const router = express.Router();

router.post("/", addTask)

router.get("/", getTasks);
export default router;