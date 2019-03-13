const express = require("express");

const authMiddleware = require("../middlewares/auth");

const Project = require("../models/project");
const Task = require("../models/task");

const router = express.Router();

// Executando o middleware do token antes da rota principal
router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    /* populate("someAttr") serve para trazer os dados do  relacionamento (eager loading).
     * Nesse caso, faz duas consultas, uma para trazer os projetos e outra para trazer o relacionamento. */
    const projects = await Project.find().populate(["user", "tasks"]);
    return res.send({ projects });
  } catch (error) {
    return res.status(400).send({ Error: "Error loading projects" });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate([
      "user",
      "tasks"
    ]);
    return res.send({ project });
  } catch (error) {
    return res.status(400).send({ Error: "Error loading project" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    const project = await Project.create({
      title,
      description,
      user: req.userId
    });

    // Salvando as tasks do projeto (relacionamento = 1 projeto tem muitas tasks)
    /* Aguardar todas as tasks serem adicionadas para depois salvá-las no projeto
     * pois senão ele executa o project.save() antes de concluir o callback
     */
    await Promise.all(
      tasks.map(async task => {
        // Cria uma task definindo o id do projeto em que ela está vinculada.
        const projectTask = new Task({
          ...task,
          assignedTo: project.user._id,
          project: project._id
        });

        // Aguarda até que seja salva a task
        await projectTask.save();

        // Adiciona a task salva em seu projeto com mesmo id
        project.tasks.push(projectTask);
      })
    );

    // Aguarda todas as tasks serem salvas e adicionadas no projeto e enão salva o projeto
    await project.save();

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ Error: "Error creating new projetct" });
  }
});

router.put("/:projectId", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        title,
        description
      },
      { new: true }
    ); // "new true" retorna o projeto atualizado do projeto e não o antigo

    // Deletando todas as tasks pois serão recriadas novamente
    project.tasks = [];
    await Task.remove({ project: project._id });

    await Promise.all(
      tasks.map(async task => {
        const projectTask = new Task({
          ...task,
          assignedTo: project.user._id,
          project: project._id
        });

        await projectTask.save();

        project.tasks.push(projectTask);
      })
    );

    await project.save();

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ Error: "Error updating new projetct" });
  }
});

router.delete("/:projectId", async (req, res) => {
  try {
    const project = await Project.findByIdAndRemove(req.params.projectId);
    return res.send();
  } catch (err) {
    return res.status(400).send({ Error: "Error deleting new projetct" });
  }
});

module.exports = app => app.use("/projects", router);
