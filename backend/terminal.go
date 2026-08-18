package backend

import (
	"context"
	"fmt"

	"github.com/moby/moby/client"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Session struct {
	id     string
	hijack client.HijackedResponse
	cancel context.CancelFunc
}

func (a *App) StartTerminal(containerID string) (string, error) {
	ctxWithCancel, cancel := context.WithCancel(a.ctx)

	resp, err := a.docker.Terminal.Start(ctxWithCancel, containerID)
	if err != nil {
		cancel()
		return "", err
	}

	session := Session{
		id:     resp.SessionID,
		hijack: resp.Hijack,
		cancel: cancel,
	}

	a.mu.Lock()
	a.terminals[resp.SessionID] = &session
	a.mu.Unlock()

	// stream outputs
	go a.streamTerminalOutput(session)

	return session.id, nil
}

func (a *App) ResizeTerminal(sessionID string, height uint, width uint) error {
	a.mu.Lock()
	defer a.mu.Unlock() // hold lock till function execution is complete

	session, ok := a.terminals[sessionID]
	if !ok {
		return fmt.Errorf("session id:%s not found", sessionID)
	}

	err := a.docker.Terminal.Resize(a.ctx, session.id, height, width)
	if err != nil {
		return err
	}

	return nil
}

func (a *App) SendTerminalInput(sessionID string, data string) error {
	a.mu.Lock()
	defer a.mu.Unlock() // hold lock till function execution is complete

	session, ok := a.terminals[sessionID]
	if !ok {
		return fmt.Errorf("session id:%s not found", sessionID)
	}

	_, err := session.hijack.Conn.Write([]byte(data))
	if err != nil {
		return err
	}

	return nil
}

func (a *App) CloseTerminal(sessionID string) error {
	a.mu.Lock()
	defer a.mu.Unlock() // hold lock till function execution is complete

	session, ok := a.terminals[sessionID]
	if !ok {
		return fmt.Errorf("session id:%s not found", sessionID)
	}

	delete(a.terminals, sessionID)
	session.hijack.Close()
	session.cancel()

	return nil
}

func (a *App) streamTerminalOutput(session Session) {
	buff := make([]byte, 4096)

	for {
		// as exec was created with ttl: true, there will be
		// single stream not multiplexed.
		n, err := session.hijack.Reader.Read(buff)

		if err != nil {
			a.mu.Lock()
			if _, ok := a.terminals[session.id]; ok {

				delete(a.terminals, session.id)
				session.hijack.Close()
				session.cancel()

				a.emitTerminalClosed(session.id)
			}
			a.mu.Unlock()
			return
		}

		a.emitTerminalOutput(session.id, string(buff[:n]))
	}
}

func (a *App) emitTerminalOutput(sessionID string, data string) {
	runtime.EventsEmit(a.ctx, "terminal:output:"+sessionID, data)
}

func (a *App) emitTerminalClosed(sessionID string) {
	runtime.EventsEmit(a.ctx, "terminal:closed"+sessionID, true)
}
