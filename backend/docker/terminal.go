package docker

import (
	"context"

	"github.com/moby/moby/client"
)

type TerminalService struct {
	dockerClient *client.Client
}

type TerminalStartResponse struct {
	SessionID string
	Hijack    client.HijackedResponse
}

func (ts *TerminalService) Start(ctx context.Context, containerID string) (TerminalStartResponse, error) {
	// start bash if present otherwise fallback to sh
	startShellCmd := []string{
		"/bin/sh",
		"-c",
		"if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi",
	}

	createResult, err := ts.dockerClient.ExecCreate(ctx, containerID, client.ExecCreateOptions{
		TTY:          true,
		AttachStdin:  true,
		AttachStdout: true,
		Cmd:          startShellCmd,
	})
	if err != nil {
		return TerminalStartResponse{}, err
	}

	attachResult, err := ts.dockerClient.ExecAttach(ctx, createResult.ID, client.ExecAttachOptions{
		TTY: true,
	})
	if err != nil {
		return TerminalStartResponse{}, err
	}

	return TerminalStartResponse{
		SessionID: createResult.ID,
		Hijack:    attachResult.HijackedResponse,
	}, nil
}

func (ts *TerminalService) Resize(ctx context.Context, sessionID string, height uint, width uint) error {
	_, err := ts.dockerClient.ExecResize(ctx, sessionID, client.ExecResizeOptions{
		Height: height,
		Width:  width,
	})
	if err != nil {
		return err
	}

	return nil
}
