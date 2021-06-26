const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

app.use(express.json());
const databasePath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
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

const convertTodoToJson = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbobject.category,
    dueDate: dbObject.due_date,
  };
};

const hasStatus = (requestQuery) => {
  return (
    requestQuery.category === undefined && requestQuery.priority === undefined
  );
};
const hasPriority = (req) => {
  return req.category === undefined && req.status === undefined;
};
const hasPriorityAndstatus = (req) => {
  return req.category === undefined;
};
const hasSearch = (req) => {
  return (
    req.category !== undefined &&
    req.status !== undefined &&
    req.priority !== undefined
  );
};
const hasCategoryAndStatus = (req) => {
  return req.priority === undefined;
};
const hasCategory = (req) => {
  return req.priority === undefined && req.status === undefined;
};
const hasCategoryAndPriority = (req) => {
  return req.status === undefined;
};

const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
const priorityArray = ["HIGH", "MEDIUM", "LOW"];
const categoryArray = ["WORK", "HOME", "LEARNING"];

const formatDate = (date) => {
  let formattedDate = format(new Date(date), "yyyy-MM-dd");
  return formatDate;
};

app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  const { status, priority, category, search_q = "" } = request.query;
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
    default:
      getTodosQuery = `
            SELECT
            *
            FROM
            todo 
            WHERE
            todo LIKE '${search_q}';`;
      break;
  }
  console.log(hasCategoryAndStatus(request.query));
  if (hasStatus(request.query) === true) {
    if (statusArray.includes(status)) {
      let data = await db.all(getTodosQuery);
      response.send(data);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (hasPriority(request.query) === true) {
    if (priorityArray.includes(priority)) {
      let data = await db.all(getTodosQuery);
      response.send(data);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (hasPriorityAndstatus(request.query) === true) {
    if (statusArray.includes(status)) {
      if (priorityArray.includes(priority)) {
        let data = await db.all(getTodosQuery);
        response.send(data);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (hasCategoryAndStatus(request.query) === true) {
    if (statusArray.includes(status)) {
      if (categoryArray.includes(category)) {
        let data = await db.all(getTodosQuery);
        response.send(data);
      } else {
        response.status(400);
        response.send("Invalid Todo category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (hasCategory(request.query) === true) {
    if (categoryArray.includes(category)) {
      let data = await db.all(getTodosQuery);
      response.send(data);
    } else {
      response.status(400);
      response.send("Invalid Todo category");
    }
  } else if (hasCategoryAndPriority(request.query) === true) {
    if (categoryArray.includes(category)) {
      if (priorityArray.includes(priority)) {
        let data = await db.all(getTodosQuery);
        response.send(data);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo category");
    }
  } else {
    let data = await db.all(getTodosQuery);
    response.send(data);
  }
});

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id = '${todoId}';`;
  console.log(todoId);
  let data = await db.get(query);
  response.send(data);
});

app.get("/agenda", async (request, response) => {
  const { date } = request.query;
  if (date === undefined) {
    response.status(400);
    response.send("invalid Due Date");
  } else {
    const formtdate = formatDate(date);
    const isDatevalid = isValid(new Date(formtdate));
    if (isDatevalid) {
      const getQuery = `
          SELECT
          8
          FROM 
          todo 
          WHERE 
          due_date = '${formtdate}';`;
      const data = await db.all(getQuery);
      response.send(todos.map((todo) => convertTodoToJson(todo)));
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

app.post("/todos", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const Query = `INSERT INTO todo(id, todo, priority, status, category, due_date) VALUES ('${id}', '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
  await db.run(Query);
  response.send("Todo Successfully Added");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id = '${todoId}';`;
  await db.run(query);
  response.send("Todo Deleted");
});
const checkReq = (a) => {
  return a !== undefined;
};
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let id = todoId;
  let query = "";
  let msg = "";
  const { status, priority, todo, category, dueDate } = request.body;
  switch (true) {
    case checkReq(status):
      if (statusArray.includes(status)) {
        query = `UPDATE todo SET status = '${status}' WHERE id = '${todoId}';`;
        msg = "Status Updated";
        await db.run(query);
        response.send(msg);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;
    case checkReq(priority):
      if (priorityArray.includes(priority)) {
        query = `UPDATE todo SET priority = '${priority}' WHERE id = '${todoId}';`;
        msg = "Priority Updated";
        await db.run(query);
        response.send(msg);
      } else {
        response.status(400);
        response.send("Invalid Todo priority");
      }

      break;
    case checkReq(todo):
      query = `UPDATE todo SET todo = '${todo}' WHERE id = '${todoId}';`;
      msg = "Todo Updated";
      await db.run(query);
      response.send(msg);
      break;
    case checkReq(category):
      if (categoryArray.includes(category)) {
        query = `UPDATE todo SET category = '${category}' WHERE id = '${todoId}';`;
        msg = "Category Updated";
        await db.run(query);
        response.send(msg);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;
    case checkReq(dueDate):
      try {
        formattedDate = formatDate(requestBody.dueDate);
        const isDateValid = isValid(new Date(formattedDate));
        if (isDateValid === false) {
          response.status(400);
          response.send("Invalid Due Date");
        } else {
          updateColumn = "Due Date";
        }
      } catch (e) {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});
module.exports = app;
