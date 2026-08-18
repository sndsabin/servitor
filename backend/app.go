package backend

import (
	"context"
	"embed"
	"fmt"
	"servitor/backend/docker"
	"servitor/backend/logger"
	"servitor/backend/workspace"
	"strings"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed resources
var resourcesFS embed.FS

// App struct
type App struct {
	ctx            context.Context
	cancel         context.CancelFunc
	name           string
	version        string
	schemaVersion  string
	resourcesFS    embed.FS
	Workspace      *workspace.Workspace
	logger         *logger.Logger
	serviceCatalog []Service
	docker         *docker.Docker
	resourceSyncer *workspace.ResourceSyncer
	mu             sync.Mutex
	terminals      map[string]*Session
}

type AppInfo struct {
	Name          string `json:"name"`
	Version       string `json:"version"`
	SchemaVersion string `json:"schema_version"`
}

type AppConfig struct {
	Name               string
	Version            string
	SchemaVersion      string
	AppResourceBaseUrl string
}

const DockerStatusEvent = "docker:status"
const syncTimeOut = 5 * time.Minute

// NewApp creates a new App application struct
func NewApp(config *AppConfig) (*App, error) {
	if err := validateConfig(config); err != nil {
		return nil, err
	}

	appWorkspace, err := workspace.New(config.Name, config.SchemaVersion)
	if err != nil {
		return nil, err
	}

	appLogger, err := logger.NewLogger(appWorkspace.Dirs.Logs)
	if err != nil {
		return nil, fmt.Errorf("unable to initialize logger: %w", err)
	}

	userAgent := fmt.Sprintf("%s-%s", strings.ToLower(config.Name), config.Version)
	docker, err := docker.New(userAgent, config.Name)
	if err != nil {
		return nil, err
	}

	resourceSyncer, err := workspace.NewResourceSyncer(&workspace.ResourceSyncerConfig{
		BaseUrl:       config.AppResourceBaseUrl,
		SchemaVersion: config.SchemaVersion,
		Workspace:     appWorkspace,
	})
	if err != nil {
		return nil, err
	}

	return &App{
		name:           config.Name,
		version:        config.Version,
		schemaVersion:  config.SchemaVersion,
		Workspace:      appWorkspace,
		logger:         appLogger,
		resourcesFS:    resourcesFS,
		docker:         docker,
		resourceSyncer: resourceSyncer,
		terminals:      make(map[string]*Session),
	}, nil
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx

	// sync embedded resources to disk only on first run after install
	if !a.Workspace.ManifestExists() {
		err := a.Workspace.SyncEmbeddedResources(resourcesFS, "resources")
		if err != nil {
			a.logger.Error().
				Err(err).
				Msg("failed syncing embedded resources")
		}
	}

	serviceCatalog, err := a.fetchServiceCatalog()
	if err != nil {
		a.logger.Error().
			Err(err).
			Msg("failed loading service catalog")
	}

	a.serviceCatalog = serviceCatalog

	// sync resource with remote in background
	go a.syncResourcesWithRemote()

	// monitor docker status
	monitorCtx, cancel := context.WithCancel(a.ctx)
	a.cancel = cancel

	go a.monitorDockerStatus(monitorCtx)
}

// Shutdown is called when app is closed
func (a *App) Shutdown(_ context.Context) {
	// stop the monitor go routine
	if a.cancel != nil {
		a.cancel()
	}

	// close docker client
	if err := a.docker.Close(); err != nil {
		a.logger.Error().
			Err(err).
			Msg("failed closing docker connection")
	}

	// close all terminals
	a.mu.Lock()
	sessionIDs := make([]string, 0, len(a.terminals))

	for sessionID := range a.terminals {
		sessionIDs = append(sessionIDs, sessionID)
	}

	a.mu.Unlock()

	for _, sessionID := range sessionIDs {
		if err := a.CloseTerminal(sessionID); err != nil {
			a.logger.Error().
				Err(err).
				Msg("failed closing terminal")
		}
	}

	// close logfile
	a.logger.Close()

}

func (a *App) GetAppInfo() AppInfo {
	return AppInfo{
		Name:          a.name,
		Version:       a.version,
		SchemaVersion: a.schemaVersion,
	}
}

func (a *App) monitorDockerStatus(ctx context.Context) {
	dockerStatus := a.docker.GetStatus()

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			newDockerStatus := a.docker.GetStatus()
			if newDockerStatus != dockerStatus {
				runtime.EventsEmit(a.ctx, DockerStatusEvent, newDockerStatus)
				dockerStatus = newDockerStatus
			}
		}
	}
}

func (a *App) syncResourcesWithRemote() {
	ctx, cancel := context.WithTimeout(a.ctx, syncTimeOut)
	defer cancel()

	if err := a.resourceSyncer.SyncWithRemote(ctx); err != nil {
		a.logger.Error().
			Err(err).
			Msg("error syncing to remote resources")
	}

	a.logger.Info().
		Msg("remote resources synced succesfully")
}

func validateConfig(config *AppConfig) error {
	if config == nil {
		return fmt.Errorf("config cannot be nil")
	}

	if config.Name == "" {
		return fmt.Errorf("name cannot be empty")
	}

	if config.Version == "" {
		return fmt.Errorf("version cannot be empty")
	}

	if config.SchemaVersion == "" {
		return fmt.Errorf("schema version cannot be empty")
	}

	if config.AppResourceBaseUrl == "" {
		return fmt.Errorf("app resource base url cannot be empty")
	}

	return nil
}
