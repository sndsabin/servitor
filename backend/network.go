package backend

import "servitor/backend/network"

func (a *App) IsPortAvailable(port int) network.PortCheckResponse {
	return network.IsPortAvailable(port)
}
