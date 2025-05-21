package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/hiphops-io/hook/license"
	"github.com/labstack/echo/v4"
)

const socketPath = "/tmp/hiphops.sock"

func main() {
	if err := run(); err != nil {
		fmt.Printf("Exited due to: %e\n", err)
		os.Exit(1)
	}
}

func run() error {
	socket, err := net.Listen("unix", socketPath)
	if err != nil {
		return err
	}

	// Pre-warm the license cache
	license.GetLicenseInfo()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(sigChan)

	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	e.Listener = socket
	e.GET("/license", getLicenseInfo)

	server := new(http.Server)

	go func() {
		if err := e.StartServer(server); err != nil {
			// TODO: Handle the error
			log.Fatal(err)
		}
	}()

	<-sigChan

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := e.Shutdown(ctx); err != nil {
		return err
	}

	if err := os.Remove(socketPath); err != nil {
		return err
	}

	return nil
}

func getLicenseInfo(c echo.Context) error {
	info := license.GetLicenseInfo()

	return c.JSON(http.StatusOK, info)
}
