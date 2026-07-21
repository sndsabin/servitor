package backend

import (
	"fmt"
	"servitor/backend/docker"
	"strings"

	"github.com/google/uuid"
)

type StartServiceRequest struct {
	Name        string                    `json:"name"`
	Image       string                    `json:"image"`
	Version     string                    `json:"version"`
	PortMapping map[string]map[string]int `json:"port_mapping"`          // portLabel -> {hostPort: <value>,containerPort: <value>}
	EnvMapping  map[string]string         `json:"env_mapping,omitempty"` // envKey -> envValue
	VolumeName  string                    `json:"volume_name,omitempty"`
	VolumePath  string                    `json:"volume_path,omitempty"`
	Command     []string                  `json:"command,omitempty"`
}

const logTail = 300

func (a *App) GetDockerStatus() docker.DockerStatus {
	return a.docker.GetStatus()
}

func (a *App) LaunchContainer(req StartServiceRequest) error {
	container, err := a.createContainer(req)
	if err != nil {
		return err
	}

	err = a.StartContainer(container.ID)
	if err != nil {
		_ = a.DeleteContainer(container.ID)
		return fmt.Errorf("failed to start container: %w", err)
	}

	return nil
}

func (a *App) StopContainer(containerID string) error {
	return a.docker.Containers.Stop(a.ctx, containerID)
}

func (a *App) StartContainer(containerID string) error {
	return a.docker.Containers.Start(a.ctx, containerID)
}

func (a *App) RestartContainer(containerID string) error {
	return a.docker.Containers.Restart(a.ctx, containerID)
}

func (a *App) DeleteContainer(containerID string) error {
	return a.docker.Containers.Delete(a.ctx, containerID, true)
}

func (a *App) FindContainer(containerID string) (docker.Container, error) {
	return a.docker.Containers.Find(a.ctx, containerID)
}

func (a *App) ListAllContainer() ([]docker.Container, error) {
	return a.docker.Containers.ListAll(a.ctx)
}

func (a *App) GetContainerLogs(containerId string) (string, error) {
	return a.docker.Containers.GetLogs(a.ctx, containerId, logTail)
}

func (a *App) createContainer(req StartServiceRequest) (docker.Container, error) {
	namespace := strings.ToLower(a.name)
	resourceSuffix := uuid.NewString()[:12]

	var envMap []string

	for key, value := range req.EnvMapping {
		envMap = append(envMap, key+"="+value)
	}

	var portSpecs []docker.PortSpec
	for label, portInfo := range req.PortMapping {
		containerPort := portInfo["containerPort"]
		hostPort := portInfo["hostPort"]

		portSpecs = append(portSpecs, docker.PortSpec{
			Label:         label,
			HostPort:      hostPort,
			ContainerPort: containerPort,
		})
	}

	image := fmt.Sprintf("%s:%s", req.Image, req.Version)
	if err := a.docker.Images.EnsureImage(a.ctx, image); err != nil {
		return docker.Container{}, fmt.Errorf("error pulling %s: %w", image, err)
	}

	var volumeBinds []string

	if len(req.VolumePath) > 0 && len(req.VolumeName) > 0 {
		volumeName := fmt.Sprintf("%s_%s_%s", namespace, req.VolumeName, resourceSuffix)

		volumeBinds = append(volumeBinds, fmt.Sprintf("%s:%s", volumeName, req.VolumePath))
	}

	createContainerConfig := docker.CreateContainerConfig{
		ServiceName:    req.Name,
		Version:        req.Version,
		Image:          image,
		Env:            envMap,
		Cmd:            req.Command,
		Ports:          portSpecs,
		VolumeBinds:    volumeBinds,
		ResourceSuffix: resourceSuffix,
	}

	return a.docker.Containers.Create(a.ctx, createContainerConfig)
}
