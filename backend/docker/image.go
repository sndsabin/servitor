package docker

import (
	"context"
	"fmt"

	"github.com/containerd/errdefs"
	"github.com/moby/moby/client"
)

type ImageService struct {
	dockerClient *client.Client
}

func (is *ImageService) EnsureImage(ctx context.Context, imageName string) error {
	if imageName == "" {
		return fmt.Errorf("imagename cannot be empty")
	}

	// return if image is already in the local machine, otherwise pull image
	_, err := is.dockerClient.ImageInspect(ctx, imageName)
	if err == nil {
		return nil
	}

	if !errdefs.IsNotFound(err) {
		// If the error is other than image not found
		// (e.g: docker unavailable, permission, etc)
		// return error
		return err
	}

	response, err := is.dockerClient.ImagePull(ctx, imageName, client.ImagePullOptions{})
	if err != nil {
		return err
	}

	defer response.Close()

	// wait until docker confirms the pull is completed
	return response.Wait(ctx)
}
