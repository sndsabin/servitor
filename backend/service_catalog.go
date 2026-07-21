package backend

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
)

type Port struct {
	ContainerPort int    `json:"container_port"`
	HostPort      int    `json:"host_port"`
	Label         string `json:"label"`
}

type EnvVar struct {
	Key         string `json:"key"`
	Default     string `json:"default"`
	Description string `json:"description"`
	Secret      bool   `json:"secret"`
	Required    bool   `json:"required"`
}

type Service struct {
	Name        string   `json:"name"`
	Category    string   `json:"category"`
	Description string   `json:"description"`
	Versions    []string `json:"versions"`
	Logo        string   `json:"logo,omitempty"`
	Image       string   `json:"image"`
	Ports       []Port   `json:"ports"`
	Env         []EnvVar `json:"env,omitempty"`
	VolumeName  string   `json:"volume_name,omitempty"`
	VolumePath  string   `json:"volume_path,omitempty"`
	Command     []string `json:"command,omitempty"`
}

func (a *App) GetServiceCatalog() []Service {
	return a.serviceCatalog
}

func (a *App) GetService(name string) (Service, bool) {
	if name == "" {
		return Service{}, false
	}

	for _, service := range a.serviceCatalog {
		if service.Name == name {
			return service, true
		}
	}

	return Service{}, false
}

func (a *App) fetchServiceCatalog() ([]Service, error) {
	entries, err := os.ReadDir(a.Workspace.Dirs.Blueprints)
	if err != nil {
		a.logger.Error().
			Err(err).
			Str("directory", a.Workspace.Dirs.Blueprints).
			Msg("error opening directory.")

		return nil, err
	}

	var services []Service

	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}

		bluePrintFile := filepath.Join(a.Workspace.Dirs.Blueprints, entry.Name())

		bluePrintData, err := os.ReadFile(bluePrintFile)
		if err != nil {
			a.logger.Error().
				Err(err).
				Str("file", bluePrintFile).
				Msg("error reading file.")

			continue
		}

		var service Service

		err = json.Unmarshal(bluePrintData, &service)
		if err != nil {
			a.logger.Error().
				Err(err).
				Str("file", entry.Name()).
				Msg("Error unmarshalling json")

			continue
		}

		services = append(services, service)
	}

	sort.Slice(services, func(i, j int) bool {
		return services[i].Name < services[j].Name
	})

	return services, nil
}
