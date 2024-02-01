package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/kkdai/youtube/v2"
)

type VideoRequest struct {
	URL string `json:"url"`
}

func downloadYouTubeVideo(w http.ResponseWriter, r *http.Request) {
	// Print the request status
	fmt.Printf("Received request from %s for video download\n", r.RemoteAddr)

	// Parse JSON from the request body
	var videoRequest VideoRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&videoRequest); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		fmt.Println("Error: Invalid JSON payload")
		return
	}

	// Extract video ID from the URL
	videoID := extractVideoID(videoRequest.URL)
	if videoID == "" {
		http.Error(w, "Invalid YouTube URL", http.StatusBadRequest)
		fmt.Println("Error: Invalid YouTube URL")
		return
	}

	// Download YouTube video
	client := youtube.Client{}
	video, err := client.GetVideo(videoID)
	if err != nil {
		http.Error(w, "Error getting video info", http.StatusInternalServerError)
		fmt.Println("Error: Getting video info")
		return
	}

	formats := video.Formats.WithAudioChannels()
	stream, _, err := client.GetStream(video, &formats[0])
	if err != nil {
		http.Error(w, "Error getting video stream", http.StatusInternalServerError)
		fmt.Println("Error: Getting video stream")
		return
	}
	defer stream.Close()

	// Set response headers
	w.Header().Set("Content-Type", "video/mp4")
	w.Header().Set("Content-Disposition", "attachment; filename=video.mp4")

	// Copy video stream to response
	_, err = io.Copy(w, stream)
	if err != nil {
		http.Error(w, "Error copying video stream to response", http.StatusInternalServerError)
		fmt.Println("Error: Copying video stream to response")
		return
	}

	// Print success status
	fmt.Printf("Video served successfully to %s\n", r.RemoteAddr)
}

func extractVideoID(url string) string {
	parts := strings.Split(url, "=")
	if len(parts) != 2 {
		return ""
	}
	return parts[1]
}

func main() {
	router := mux.NewRouter()

	// Enable CORS
	headersOk := handlers.AllowedHeaders([]string{"Content-Type", "Origin", "Accept"})
	originsOk := handlers.AllowedOrigins([]string{"*"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	// Route for handling download requests
	router.HandleFunc("/download", downloadYouTubeVideo).Methods("POST")

	// Start server with CORS support
	fmt.Println("Server is running on :8080")
	http.ListenAndServe(":8080", handlers.CORS(headersOk, originsOk, methodsOk)(router))
}
