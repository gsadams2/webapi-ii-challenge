const express = require("express");

const db = require("../data/db");

const router = express.Router();

//all these begin with /api/posts automatically

router.get("/", (req, res) => {
  db.find()
    .then(post => {
      res.status(200).json(post);
    })
    .catch(error => {
      res
        .status(500)
        .json({ error: "The posts information could not be retrieved." });
    });
});

router.get("/:id/comments", (req, res) => {
  const id = req.params.id;
  db.findPostComments(id)
    .then(idFound => {
      if (idFound && idFound.length) {
        res.status(200).json(idFound);
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(error => {
      res
        .status(500)
        .json({ error: "The comments information could not be retrieved." });
    });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.findById(id)
    .then(idFound => {
      if (idFound && idFound.length) {
        res.status(200).json(idFound);
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist." });
      }
    })
    .catch(error => {
      res
        .status(500)
        .json({ error: "The post information could not be retrieved." });
    });
});

router.post("/", (req, res) => {
  const { title, contents } = req.body;

  if (!title || !contents) {
    res.status(400).json({
      errorMessage: "Please provide title and contents for the post."
    });
  } else {
    db.insert(req.body)
      .then(post => {
        res.status(201).json(post);
      })
      .catch(error => {
        res.status(500).json({
          error: "There was an error while saving the post to the database"
        });
      });
  }
});

router.post("/:id/comments", (req, res) => {
  const commentInfo = req.body.text;
  const id = req.params.id;

  const comment = {
    post_id: id,
    text: commentInfo
  };

  if (!id) {
    res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });
  } else {
    if (isValidComment(comment)) {
      db.insertComment(comment)
        .then(comment => {
          res.status(201).json(comment);
        })
        .catch(error => {
          res.status(500).json({
            error: "There was an error while saving the comment to the database"
          });
        });
    } else {
      res
        .status(400)
        .json({ errorMessage: "Please provide text for the comment." });
    }
  }
});

function isValidComment(comment) {
  const { text } = comment;
  return text;
}

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { title, contents } = req.body;

  if (title || contents) {
    db.update(id, req.body)
      .then(numPostUpdated => {
        if (numPostUpdated) {
          res
            .status(200)
            .json({ okay: "post updated successfully", numPostUpdated });
        } else {
          res.status(404).json({
            message: "The post with the specified ID does not exist."
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          error: "The post information could not be modified."
        });
      });
  } else {
    res
      .status(400)
      .json({ errorMessage: "Please provide text for the comment." });
  }
});

module.exports = router;
