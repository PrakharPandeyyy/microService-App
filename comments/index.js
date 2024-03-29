const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const { randomBytes } = require("crypto");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const commentsByPostsId = {};

app.get("/posts/:id/comments", (req, res) => {
    res.send(commentsByPostsId[req.params.id] || []);
  
});
app.post("/posts/:id/comments", async (req, res) => {
  const commentsId = randomBytes(4).toString("hex");
    const { content } = req.body;
    const comments = commentsByPostsId[req.params.id] || [];
    comments.push({ id: commentsId, content ,status: "pending"});
    commentsByPostsId[req.params.id] = comments;

  await axios.post("http://event-bus-srv:4005/events", {
        type: "CommentCreated",
        data: {
            id: commentsId,
            content,
            status: "pending",
            postId: req.params.id,
        }
    }).catch((err) => {
        console.log(err.message);
    });

    
    res.status(201).send(comments);

});

app.post("/events", async (req, res) => {
  console.log("Received Event", req.body.type);

  const { type, data } = req.body;
  if(type === "CommentModerated"){
    const {postId, id, status, content} = data;
    const comments = commentsByPostsId[postId];
    const comment = comments.find(comment => {
      return comment.id === id;
    });
    comment.status = status;
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data: {
          id,
          content,
          status,
          postId,
      }
  }).catch((err) => {
      console.log(err.message);
  });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
