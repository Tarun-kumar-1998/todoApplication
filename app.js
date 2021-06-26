const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const databasePath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasStatus = (requestQuery) => {
  return (
    requestQuery.category === undefined && requestQuery.priority === undefined
  );
};
const hasPriority = (req) => {
  return req.category !== undefined && req.status !== undefined;
};
const hasPriorityAndstatus = (req) => {
  return req.category !== undefined;
};
const hasSearch = (req) => {
  return (
    req.category !== undefined &&
    req.status !== undefined &&
    req.priority !== undefined
  );
};
const hasCategoryAndStatus = (req) => {
  return req.priority !== undefined;
};
const hasCategory = (req) => {
  return req.priority !== undefined && req.status !== undefined;
};
const hasCategoryAndPriority = (req) => {
  return req.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  const { status, priority, search_q, category } = request.query;
  console.log(hasStatus(request.query));
  switch (true) {
    case hasStatus(request.query):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo 
            WHERE
            status = '${status}';`;

      break;
    case hasPriority(request.query):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo 
            WHERE
            priority = '${priority}';`;
      break;
    case hasPriorityAndstatus(request.query):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo 
            WHERE
            status = '${status}'
            AND priority = '${priority}';`;
      break;
    case hasSearch(request.query):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo 
            WHERE
            todo LIKE '${search_q}';`;
      break;
    case hasCategoryAndStatus(request.query):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo 
            WHERE
            category ='${category}'
            AND status = '${status}';`;
      break;
    case hasCategory(request.query):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo 
            WHERE
            category = '${category}';`;
      break;
    case hasCategoryAndPriority(request.query):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo 
            WHERE
            category = '${category}'
            AND priority = '${priority}';`;
      break;
  }
  console.log(getTodosQuery);
  let data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId", async (request, response) => {
  const Id = request.params;
  const query = `SELECT * FROM todo WHERE id = '${Id}';`;
  console.log(request.params);
  let data = await db.get(query);
  response.send(data);
});

app.get("/agenda", async (request, response) => {
  const dat = request.query.date;
  const query = `SELECT * FROM todo WHERE duedate = '${dat}';`;
  let data = await db.all(query);
  response.send(data);
});

app.post("/todos", async (request, response) => {
  const { id, todo, priority, status, category, duedate } = request.body;
  const Query = `INSERT INTO todo(id, todo, priority, status, category, due_date) VALUES ('${id}', '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
  await db.run(Query);
  response.send("Todo Successfully Added");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const id = request.params;
  const query = `DELETE FROM todo WHERE id = '${id}';`;
  await db.run(query);
  response.send("Todo Deleted");
});
const checkReq = (a) => {
  return a !== undefined;
};
app.put("/todos/:todoId/", async (request, response) => {
  const id = request.params;
  let query = "";
  let msg = "";
  const { status, priority, todo, category, dueDate } = request.body;
  switch (true) {
    case checkReq(status):
      query = `UPDATE todo SET status = '${status} WHERE id = '${id}';`;
      msg = "Status Updated";
      break;
    case checkReq(priority):
      query = `UPDATE todo SET priority = '${priority} WHERE id = '${id}';`;
      msg = "Priority Updated";
      break;
    case checkReq(todo):
      query = `UPDATE todo SET todo = '${todo} WHERE id = '${id}';`;
      msg = "Todo Updated";
      break;
    case checkReq(category):
      query = `UPDATE todo SET category = '${category} WHERE id = '${id}';`;
      msg = "Category Updated";
      break;
    case checkReq(dueDate):
      query = `UPDATE todo SET dueDate = '${dueDate} WHERE id = '${id}';`;
      msg = "Due Date Updated";
      break;
  }
  await db.run(query);
  response.send(msg);
});

module.exports = app;
