package server_rpc

import (
	"log"
	"net"
	"google.golang.org/grpc"
)

func Connect(port string)(net.Listener, *grpc.Server){
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()


	// Register reflection service on gRPC server.
	return lis, s
}
