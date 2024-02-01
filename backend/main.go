package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

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

	// Create and write to the video file
	file, err := os.Create("video.mp4")
	if err != nil {
		http.Error(w, "Error creating video file", http.StatusInternalServerError)
		fmt.Println("Error: Creating video file")
		return
	}
	defer file.Close()

	_, err = io.Copy(file, stream)
	if err != nil {
		http.Error(w, "Error copying video stream to file", http.StatusInternalServerError)
		fmt.Println("Error: Copying video stream to file")
		return
	}

	// Print success status
	fmt.Printf("Video downloaded successfully from %s\n", r.RemoteAddr)

	// Send response to the client
	fmt.Fprintf(w, "Video downloaded successfully")
}

func extractVideoID(url string) string {
	parts := strings.Split(url, "=")
	if len(parts) != 2 {
		return ""
	}
	return parts[1]
}

func main() {
	http.HandleFunc("/download", downloadYouTubeVideo)
	fmt.Println("Server is running on :8080")
	http.ListenAndServe(":8080", nil)
}
