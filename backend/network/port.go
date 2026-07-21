package network

import (
	"fmt"
	"net"
)

type PortCheckResponse struct {
	Port      int    `json:"port"`
	Available bool   `json:"available"`
	Message   string `json:"message,omitempty"`
}

func IsPortAvailable(port int) PortCheckResponse {
	addr := fmt.Sprintf(":%d", port)

	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return PortCheckResponse{
			Port:      port,
			Available: false,
			Message:   err.Error(),
		}
	}
	defer listener.Close()

	return PortCheckResponse{
		Port:      port,
		Available: true,
	}
}
