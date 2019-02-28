# dccn-ui

<a href="https://travis-ci.org/cloudfoundry-incubator/stratos/branches"><img src="https://travis-ci.org/cloudfoundry-incubator/stratos.svg?branch=v2-master"></a>&nbsp;<a style="padding-left: 4px" href="https://codeclimate.com/github/cloudfoundry-incubator/stratos/maintainability"><img src="https://api.codeclimate.com/v1/badges/61af8b605f385e894632/maintainability" /></a>
<a href="https://goreportcard.com/github.com/cloudfoundry-incubator/stratos"><img src="https://goreportcard.com/badge/github.com/cloudfoundry-incubator/stratos"/></a>
<a href="https://codecov.io/gh/cloudfoundry-incubator/stratos/branch/v2-master"><img src="https://codecov.io/gh/cloudfoundry-incubator/stratos/branch/v2-master/graph/badge.svg"/></a>
<a href="https://app.zenhub.com/workspace/o/cloudfoundry-incubator/stratos/boards"><img src="https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png"/></a>
[![GitHub release](https://img.shields.io/github/release/cloudfoundry-incubator/stratos.svg)](https://github.com/cloudfoundry-incubator/stratos/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/cloudfoundry-incubator/stratos/blob/master/LICENSE)
[![slack.cloudfoundry.org](https://slack.cloudfoundry.org/badge.svg)](https://cloudfoundry.slack.com/messages/C80EP4Y57/)


![dashboard deep](https://user-images.githubusercontent.com/34444349/52699865-9a47b280-2f2b-11e9-9900-ef353cc0b5c9.jpg)


## Quick Start

To build and start Ankr-UI on your local machine, follow these steps from the root directory:

1. First, because we need to use dep in order to get the dependencies for the files, we need to link the root directory to our go source directory. Find the go/src/ directory, and then link the Ankr-UI directory to the go/src/ directory using:

`$ ln -s ${directory of Ankr-UI} ${name of directory in go/src/}`

`$ cd ${name of directory in go/src/}`

`$ dep ensure --vendor-only`

After the dep command is ran, there will be a vendor directory that will be utilized during the build process.

2. `$ docker build -f deploy/Dockerfile.all-in-one . -t stratos`

3. `$ cd deploy/uaa`

`$ ./prepare.sh`

`$ sudo docker build -f Dockerfile.dev -t uaa .`

4. `$ docker network create --driver=bridge dev-bridge`

`$ docker run -p 4443:443 --net=dev-bridge stratos`

`$ docker run --net=dev-bridge --name=uaa uaa`

5. Access the Console at http://localhost:4443/ and provide the following information: UAA Endpoint API URL: `http://uaa:8080` Client ID: `console` Client Secret: Leave this blank Admin Account: `admin` Password: `hscadmin`

6. Click `enter` and select the following from the list: `stratos.admin`

The Console is now ready to be used.


## Deploying Ankr UI

Stratos can be deployed in the following environments:

1. Cloud Foundry, as an application. See [guide](deploy/cloud-foundry)
2. Kubernetes, using a Helm chart. See [guide](deploy/kubernetes)
3. Docker, using docker compose. See [guide](deploy/docker-compose)
4. Docker, single container deploying all components. See [guide](deploy/all-in-one)

## Troubleshooting
Please see our [Troubleshooting](docs/troubleshooting) page.


## License

The work done has been licensed under Apache License 2.0. The license file can be found [here](LICENSE).
