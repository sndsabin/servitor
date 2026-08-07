package docker

import (
	"context"
	"fmt"
	"time"

	"github.com/moby/moby/client"
)

const DefaultHost = "0.0.0.0"

type Docker struct {
	client     *client.Client
	Containers *ContainerService
	Images     *ImageService
	Terminal   *TerminalService
}

type DockerStatus struct {
	Available bool   `json:"available"`
	Version   string `json:"version"`
	Error     string `json:"error,omitempty"`
}

func New(userAgent string, namespace string) (*Docker, error) {
	if namespace == "" {
		return nil, fmt.Errorf("namespace cannot be empty")
	}

	apiClient, err := client.New(client.FromEnv, client.WithUserAgent(userAgent))
	if err != nil {
		return nil, fmt.Errorf("failed to create docker client: %w", err)
	}

	return &Docker{
		client:     apiClient,
		Containers: &ContainerService{dockerClient: apiClient, namespace: namespace},
		Images:     &ImageService{dockerClient: apiClient},
		Terminal:   &TerminalService{dockerClient: apiClient},
	}, nil
}

func (d *Docker) GetStatus() DockerStatus {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	version, err := d.client.ServerVersion(ctx, client.ServerVersionOptions{})
	if err != nil {
		return DockerStatus{
			Available: false,
			Error:     err.Error(),
		}
	}

	return DockerStatus{
		Available: true,
		Version:   version.Version,
	}
}

func (d *Docker) Close() error {
	return d.client.Close()
}
