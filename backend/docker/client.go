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
	err        error
	Containers *ContainerService
	Images     *ImageService
}

type DockerStatus struct {
	Available bool   `json:"available"`
	Version   string `json:"version"`
	Error     string `json:"error,omitempty"`
}

func New(userAgent string, namespace string) *Docker {
	if namespace == "" {
		return &Docker{
			err: fmt.Errorf("namespace cannot be empty"),
		}
	}

	apiClient, err := client.New(client.FromEnv, client.WithUserAgent(userAgent))

	return &Docker{
		client:     apiClient,
		err:        err,
		Containers: &ContainerService{dockerClient: apiClient, namespace: namespace},
		Images:     &ImageService{dockerClient: apiClient},
	}
}

func (d *Docker) GetStatus() DockerStatus {
	if d.err != nil {
		return DockerStatus{
			Available: false,
			Error:     d.err.Error(),
		}
	}

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
	if d.client == nil {
		return nil
	}

	return d.client.Close()
}
