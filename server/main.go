package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type Todo struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Done        bool      `json:"done"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
}

func main() {
	// Create a Fiber app instance
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// List of Todos
	todos := []Todo{}

	// Routes (c is for Fiber Context)
	app.Get("/healthcheck", func(c *fiber.Ctx) error {
		return c.SendString("App is healthy")
	})

	app.Get("/api/todos", func(c *fiber.Ctx) error {
		return c.JSON(todos)
	})

	app.Post("/api/todos", func(c *fiber.Ctx) error {
		// Create a Todo object
		todo := &Todo{}

		// Tries to parse the body of the request in the Todo object
		// If BodyParser() returns an error, return the error
		if err := c.BodyParser(todo); err != nil {
			log.Fatal(err)

			return c.Status(500).SendString("Something went wrong")
		}

		// Contruct Todo
		// The ID prop is the length of todos list + 1
		todo.ID = len(todos) + 1
		todo.Done = false
		todo.CreatedAt = time.Now()

		// Append the new Todo to the list of todos
		todos = append(todos, *todo)

		return c.Status(201).JSON(todo)
	})

	app.Patch("/api/todos/:id/done", func(c *fiber.Ctx) error {
		// Parse the params to integer
		id, err := c.ParamsInt("id")

		if err != nil {
			log.Fatal(err)

			return c.Status(401).SendString("Invalid id")
		}

		// Iterate the todos list
		// i = index
		// t = todo item
		// range todos = todos list
		for index, todo := range todos {
			// Find the todo to update
			if todo.ID == id {
				todos[index].Done = true

				return c.JSON(todos[index])
			}
		}

		// If not found todo, return 401 error
		return c.Status(401).SendString("Todo not found")
	})

	// If app.Listen() returns error, it logs the error as Fatal
	log.Fatal(app.Listen(":5000"))
}
