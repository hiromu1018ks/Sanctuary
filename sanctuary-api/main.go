package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "welcome to Sanctuary API!",
			"status":  "success",
		})
	})

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"message":   "Sanctuary API is running",
			"framework": "Gin",
		})
	})

	api := router.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Login endpoint - Coming soon!",
				})
			})
			auth.POST("/register", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Register endpoint - Coming soon!",
				})
			})
		}

		posts := api.Group("/posts")
		{
			posts.GET("", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Posts list - coming soon!",
					"data":    []string{},
				})
			})
			posts.POST("", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Create post - coming soon!",
				})
			})
		}
	}

	router.Run(":8080")
}
