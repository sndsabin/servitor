package docker

import (
	"bytes"
	"context"
	"fmt"
	"net/netip"
	appnetwork "servitor/backend/network"
	"strconv"
	"strings"
	"time"

	"github.com/docker/docker/pkg/stdcopy"
	"github.com/moby/moby/api/types/container"
	mobynetwork "github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
)

type ContainerService struct {
	dockerClient *client.Client
	namespace    string
}

type CreateContainerConfig struct {
	ServiceName    string
	Version        string
	Image          string
	Env            []string
	Cmd            []string
	Ports          []PortSpec
	VolumeBinds    []string
	ResourceSuffix string
}

type PortSpec struct {
	Label         string
	HostPort      int
	ContainerPort int
}

type Container struct {
	ID          string                   `json:"id"`
	Name        string                   `json:"name"`
	ServiceName string                   `json:"service_name"`
	Version     string                   `json:"version"`
	Image       string                   `json:"image"`
	State       container.ContainerState `json:"state"`
	Ports       []PortSpec               `json:"ports"`
	CreatedAt   string                   `json:"created_at"`
}

func (cs *ContainerService) Create(ctx context.Context, config CreateContainerConfig) (Container, error) {
	if err := validateConfig(config); err != nil {
		return Container{}, err
	}

	prefix := strings.ToLower(cs.namespace)

	containerConfig := &container.Config{
		Image: config.Image,
		Env:   config.Env,
		Cmd:   config.Cmd,
		Labels: map[string]string{
			prefix + ".managed": "true",
			prefix + ".service": config.ServiceName,
			prefix + ".version": config.Version,
		},
	}

	portsBindings, err := buildPortBindings(config.Ports)
	if err != nil {
		return Container{}, err
	}

	hostConfig := container.HostConfig{
		PortBindings: portsBindings,
		Binds:        config.VolumeBinds,
	}

	name := fmt.Sprintf(
		"%s-%s-%s",
		prefix,
		strings.ToLower(config.ServiceName),
		config.ResourceSuffix,
	)
	resp, err := cs.dockerClient.ContainerCreate(ctx, client.ContainerCreateOptions{
		Config:     containerConfig,
		HostConfig: &hostConfig,
		Name:       name,
	})
	if err != nil {
		return Container{}, err
	}

	container, err := cs.Find(ctx, resp.ID)
	if err != nil {
		return Container{}, fmt.Errorf("container %s not found after creation: %w", resp.ID, err)
	}

	return container, nil
}

func (cs *ContainerService) Stop(ctx context.Context, id string) error {
	_, err := cs.dockerClient.ContainerStop(ctx, id, client.ContainerStopOptions{})
	return err
}

func (cs *ContainerService) Start(ctx context.Context, id string) error {
	_, err := cs.dockerClient.ContainerStart(ctx, id, client.ContainerStartOptions{})
	return err
}

func (cs *ContainerService) Restart(ctx context.Context, id string) error {
	_, err := cs.dockerClient.ContainerRestart(ctx, id, client.ContainerRestartOptions{})
	return err
}

func (cs *ContainerService) Delete(ctx context.Context, id string, removeVolume bool) error {
	_, err := cs.dockerClient.ContainerRemove(ctx, id, client.ContainerRemoveOptions{
		Force:         true,
		RemoveVolumes: removeVolume,
	})
	return err
}

func (cs *ContainerService) Find(ctx context.Context, id string) (Container, error) {
	filter := client.Filters{}
	filter.Add("id", id)

	containers, err := cs.dockerClient.ContainerList(ctx, client.ContainerListOptions{
		All:     true,
		Filters: filter,
	})
	if err != nil {
		return Container{}, err
	}

	if len(containers.Items) == 0 {
		return Container{}, fmt.Errorf("no container found with id %s", id)
	}

	return cs.toContainer(containers.Items[0]), nil
}

func (cs *ContainerService) ListAll(ctx context.Context) ([]Container, error) {
	managedLabelFilter := strings.ToLower(cs.namespace) + ".managed=true"

	filter := client.Filters{}
	filter.Add("label", managedLabelFilter)

	containers, err := cs.dockerClient.ContainerList(ctx, client.ContainerListOptions{
		All:     true,
		Filters: filter,
	})
	if err != nil {
		return []Container{}, err
	}

	return cs.toContainers(containers), nil
}

func (cs *ContainerService) GetLogs(ctx context.Context, containerId string, tail int) (string, error) {
	reader, err := cs.dockerClient.ContainerLogs(ctx, containerId, client.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Tail:       strconv.Itoa(tail),
	})
	if err != nil {
		return "", err
	}

	defer reader.Close()

	// since, we are not starting docker with TTY enabled,
	// streams for stdout and stderr are multiplexed.
	var logs bytes.Buffer
	// writing to same buffer to preserve the original order of stdout and stderr
	_, err = stdcopy.StdCopy(&logs, &logs, reader)
	if err != nil {
		return "", err
	}

	return logs.String(), nil
}

func (cs *ContainerService) toContainers(containers client.ContainerListResult) []Container {
	var containerList []Container

	for _, item := range containers.Items {
		containerList = append(containerList, cs.toContainer(item))
	}

	return containerList
}

func (cs *ContainerService) toContainer(item container.Summary) Container {
	name := ""

	if len(item.Names) > 0 {
		name = item.Names[0]
	}

	var ports []PortSpec

	for _, port := range item.Ports {
		if port.PublicPort == 0 {
			continue
		}

		ports = append(ports, PortSpec{
			ContainerPort: int(port.PrivatePort),
			HostPort:      int(port.PublicPort),
		})
	}

	prefix := strings.ToLower(cs.namespace)

	return Container{
		ID:          item.ID,
		Name:        name,
		ServiceName: item.Labels[prefix+".service"],
		Version:     item.Labels[prefix+".version"],
		Image:       item.Image,
		State:       item.State,
		Ports:       ports,
		CreatedAt:   time.Unix(item.Created, 0).Format(time.RFC3339),
	}
}

func buildPortBindings(ports []PortSpec) (mobynetwork.PortMap, error) {
	portBindings := mobynetwork.PortMap{}

	hostIP, err := netip.ParseAddr(DefaultHost)
	if err != nil {
		return nil, err
	}

	for _, port := range ports {

		if checkPort := appnetwork.IsPortAvailable(port.HostPort); !checkPort.Available {
			return nil, fmt.Errorf("port %d is already in use - pick a different host port for %s (%s)", port.HostPort, port.Label, checkPort.Message)
		}

		containerPort, err := mobynetwork.ParsePort(strconv.Itoa(port.ContainerPort))
		if err != nil {
			return nil, err
		}

		bindings := []mobynetwork.PortBinding{
			{HostIP: hostIP, HostPort: strconv.Itoa(port.HostPort)},
		}
		portBindings[containerPort] = bindings

	}

	return portBindings, nil
}

func validateConfig(config CreateContainerConfig) error {
	if config.Image == "" {
		return fmt.Errorf("image cannot be empty")
	}

	if len(config.Ports) == 0 {
		return fmt.Errorf("ports cannot be empty")
	}

	if config.ResourceSuffix == "" {
		return fmt.Errorf("resource suffix cannot be empty")
	}

	return nil
}
