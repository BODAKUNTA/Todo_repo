/* 
CREATE TABLE todo(id INTEGER, todo TEXT, priority TEXT, status TEXT);
INSERT INTO todo (id, todo, priority, status)
VALUES (1, "Learn HTML", "HIGH", "TO DO"),
(2, "Learn JS", "MEDIUM", "DONE"),
(3, "Learn CSS", "LOW", "DONE"),
(4, "Play CHESS", "LOW", "DONE");
SELECT * from todo;

*/

const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializingDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (e) {
    console.log('DB Error: ${e.message}')
  }
}
initializingDbServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperties = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperties = requestQuery => {
  return requestQuery.status !== undefined
}

// GET API 1

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodoQuery = ''
  const {search_q = '', priority, status} = request.query
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodoQuery = `
    SELECT
    *
    FROM
    todo
    WHERE
    todo LIKE "%${search_q}%"
    AND status = "${status}"
    AND priority = "${priority}";
    `
      break
    case hasPriorityProperties(request.query):
      getTodoQuery = `
    SELECT
    * 
    FROM 
    todo
    WHERE
    todo LIKE "%${search_q}%"
    AND priority = "${priority}"
    `
      break
    case hasStatusProperties(request.query):
      getTodoQuery = `
    SELECT
    *
    FROM
    todo
    WHERE
    todo LIKE "%${search_q}%"
    AND status = "${status}"
    `
      break
    default:
      getTodoQuery = `
    SELECT 
    *
    FROM
    todo
    WHERE
    todo LIKE '%${search_q}%'
    `
  }

  data = await db.all(getTodoQuery)
  response.send(date)
})

// GET API 2

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `
  SELECT 
  *
  FROM
  todo
  WHERE
  id = ${todoId}
  `
  const todo = await db.get(getTodoQuery)
  response.send(todo)
})

//POST API 3

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.query
  const postTodoQuery = `
  INSERT INTO
  todo (id, todo, priority, status)
  VALUES ('${id}', '${todo}', '${priority}', '${status}')
  `
  await database.run(postTodoQuery)
  response.send('Todo Successfully Added')
})

//PUT API 4

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }
  const priviousTodoQuery = `
  SELECT
  *
  FROM
  todo
  WHERE
  id = ${todoId}
  `
  const priviousTodo = await db.get(priviousTodoQuery)

  const {
    todo = priviousTodo.todo,
    priority = priviousTodoQuery.priority,
    status = priviousTodoQuery.status,
  } = request.body

  const updateTodoQuery = `
  UPDATE 
  todo
  SET
   todo = '${todo}',
   priority = '${priority}'
   status = '${status}'
  WHERE
  id = ${todoId}
  `
  await db.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

//DELETE API 5

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  DELETE FROM
  todo
  WHERE
  id = ${todoId}
  `
  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
