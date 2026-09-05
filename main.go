package main

import (
	"embed"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"servitor/backend"
	"servitor/backend/workspace"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

const (
	AppName            = "Servitor"
	AppVersion         = "0.0.9"
	AppSchemaVersion   = "v1"
	AppResourceBaseUrl = "https://sndsabin.github.io/servitor-data"
)

//go:embed all:frontend/dist
var assets embed.FS

var logoDir string

func main() {
	initCrashLog()

	// Create an instance of the app structure
	appConfig := &backend.AppConfig{
		Name:               AppName,
		Version:            AppVersion,
		SchemaVersion:      AppSchemaVersion,
		AppResourceBaseUrl: AppResourceBaseUrl,
	}
	app, err := backend.NewApp(appConfig)
	if err != nil {
		log.Fatal(err)
	}

	logoDir = app.Workspace.Dirs.Logos.Path

	// Create application with options
	err = wails.Run(&options.App{
		Title:     "Servitor",
		Width:     1180,
		Height:    780,
		MinWidth:  980,
		MinHeight: 640,
		AssetServer: &assetserver.Options{
			Assets:     assets,
			Middleware: serviceLogoMiddleware,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Startup,
		OnShutdown:       app.Shutdown,
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId:               "978c226e-6ca4-4a98-8885-4d14bc1045b7" + "-" + strings.ToLower(AppName),
			OnSecondInstanceLaunch: app.OnSecondInstanceLaunch,
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}

func serviceLogoMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		const prefix = "/service-logo/"

		if strings.HasPrefix(r.URL.Path, prefix) {
			logoName := path.Clean(strings.TrimPrefix(r.URL.Path, prefix))

			logoPath := filepath.Join(logoDir, logoName)
			http.ServeFile(w, r, logoPath)
			return

		}

		next.ServeHTTP(w, r)
	})
}

func initCrashLog() {
	dir, err := os.UserConfigDir()
	if err != nil {
		dir = os.TempDir()
	}

	logsDir := filepath.Join(dir, AppName, workspace.LogsDirName)
	err = os.MkdirAll(logsDir, workspace.DirPermMode)
	if err != nil {
		return
	}

	filePath := filepath.Join(logsDir, "startup-error.log")
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, workspace.FilePermMode)
	if err != nil {
		return
	}

	log.SetOutput(file)
}
