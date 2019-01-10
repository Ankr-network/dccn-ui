FROM golang:alpine as builder
RUN apk update && apk add git && apk add --update bash && apk add openssh

RUN mkdir src/dccn-hub
WORKDIR src/dccn-hub

COPY . .

CMD go build .
