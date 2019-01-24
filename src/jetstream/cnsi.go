package main

import (
	"crypto/x509"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"

	"io/ioutil"

	"crypto/sha1"
	"encoding/base64"

	"github.com/cloudfoundry-incubator/stratos/src/jetstream/repository/cnsis"
	"github.com/cloudfoundry-incubator/stratos/src/jetstream/repository/interfaces"
	"github.com/cloudfoundry-incubator/stratos/src/jetstream/repository/tokens"

	"context"

	pb "github.com/Ankr-network/dccn-common/protocol/cli"
	ankr_const "github.com/Ankr-network/dccn-common"
	"google.golang.org/grpc"

	"time"
)

const dbReferenceError = "Unable to establish a database reference: '%v'"

func isSSLRelatedError(err error) (bool, string) {
	if urlErr, ok := err.(*url.Error); ok {
		if x509Err, ok := urlErr.Err.(x509.UnknownAuthorityError); ok {
			return true, x509Err.Error()
		}
		if x509Err, ok := urlErr.Err.(x509.HostnameError); ok {
			return true, x509Err.Error()
		}
		if x509Err, ok := urlErr.Err.(x509.CertificateInvalidError); ok {
			return true, x509Err.Error()
		}
	}
	return false, ""
}

func (p *portalProxy) RegisterEndpoint(c echo.Context, fetchInfo interfaces.InfoFunc) error {
	log.Debug("registerEndpoint")
	cnsiName := c.FormValue("cnsi_name")
	apiEndpoint := c.FormValue("api_endpoint")
	skipSSLValidation, err := strconv.ParseBool(c.FormValue("skip_ssl_validation"))
	if err != nil {
		log.Errorf("Failed to parse skip_ssl_validation value: %s", err)
		// default to false
		skipSSLValidation = false
	}

	ssoAllowed, err := strconv.ParseBool(c.FormValue("sso_allowed"))
	if err != nil {
		// default to false
		ssoAllowed = false
	}

	cnsiClientId := c.FormValue("cnsi_client_id")
	cnsiClientSecret := c.FormValue("cnsi_client_secret")

	if cnsiClientId == "" {
		cnsiClientId = p.GetConfig().CFClient
		cnsiClientSecret = p.GetConfig().CFClientSecret
	}

	newCNSI, err := p.DoRegisterEndpoint(cnsiName, apiEndpoint, skipSSLValidation, cnsiClientId, cnsiClientSecret, ssoAllowed, fetchInfo)
	if err != nil {
		return err
	}

	c.JSON(http.StatusCreated, newCNSI)
	return nil
}

func (p *portalProxy) DoRegisterEndpoint(cnsiName string, apiEndpoint string, skipSSLValidation bool, clientId string, clientSecret string, ssoAllowed bool, fetchInfo interfaces.InfoFunc) (interfaces.CNSIRecord, error) {

	if len(cnsiName) == 0 || len(apiEndpoint) == 0 {
		return interfaces.CNSIRecord{}, interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"Needs CNSI Name and API Endpoint",
			"CNSI Name or Endpoint were not provided when trying to register an CF Cluster")
	}

	apiEndpoint = strings.TrimRight(apiEndpoint, "/")

	// Remove trailing slash, if there is one
	apiEndpointURL, err := url.Parse(apiEndpoint)
	if err != nil {
		return interfaces.CNSIRecord{}, interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"Failed to get API Endpoint",
			"Failed to get API Endpoint: %v", err)
	}

	// check if we've already got this endpoint in the DB
	ok := p.cnsiRecordExists(apiEndpoint)
	if ok {
		// a record with the same api endpoint was found
		return interfaces.CNSIRecord{}, interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"Can not register same endpoint multiple times",
			"Can not register same endpoint multiple times",
		)
	}

	newCNSI, _, err := fetchInfo(apiEndpoint, skipSSLValidation)
	if err != nil {
		if ok, detail := isSSLRelatedError(err); ok {
			return interfaces.CNSIRecord{}, interfaces.NewHTTPShadowError(
				http.StatusForbidden,
				"SSL error - "+detail,
				"There is a problem with the server Certificate - %s",
				detail)
		}
		return interfaces.CNSIRecord{}, interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"Failed to validate endpoint",
			"Failed to validate endpoint: %v",
			err)
	}

	h := sha1.New()
	h.Write([]byte(apiEndpointURL.String()))
	guid := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	newCNSI.Name = cnsiName
	newCNSI.APIEndpoint = apiEndpointURL
	newCNSI.SkipSSLValidation = skipSSLValidation
	newCNSI.ClientId = clientId
	newCNSI.ClientSecret = clientSecret
	newCNSI.SSOAllowed = ssoAllowed

	err = p.setCNSIRecord(guid, newCNSI)

	// set the guid on the object so it's returned in the response
	newCNSI.GUID = guid

	return newCNSI, err
}

// TODO (wchrisjohnson) We need do this as a TRANSACTION, vs a set of single calls
func (p *portalProxy) unregisterCluster(c echo.Context) error {
	cnsiGUID := c.FormValue("cnsi_guid")
	log.WithField("cnsiGUID", cnsiGUID).Debug("unregisterCluster")

	if len(cnsiGUID) == 0 {
		//return interfaces.NewHTTPShadowError(
		//	http.StatusBadRequest,
		//	"Missing target endpoint",
		//	"Need CNSI GUID passed as form param")
		return nil
	}

	p.unsetCNSIRecord(cnsiGUID)

	p.unsetCNSITokenRecords(cnsiGUID)

	return nil
}

func (p *portalProxy) buildCNSIList(c echo.Context) ([]*interfaces.CNSIRecord, error) {
	log.Debug("buildCNSIList")
	var cnsiList []*interfaces.CNSIRecord
	var err error

	cnsiRepo, err := cnsis.NewPostgresCNSIRepository(p.DatabaseConnectionPool)
	if err != nil {
		return cnsiList, fmt.Errorf("listRegisteredCNSIs: %s", err)
	}

	cnsiList, err = cnsiRepo.List(p.Config.EncryptionKeyInBytes)
	if err != nil {
		return cnsiList, err
	}

	return cnsiList, nil
}

func (p *portalProxy) listCNSIs(c echo.Context) error {
	log.Debug("listCNSIs")
	cnsiList, err := p.buildCNSIList(c)
	if err != nil {
		return interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"Failed to retrieve list of CNSIs",
			"Failed to retrieve list of CNSIs: %v", err,
		)
	}

	jsonString, err := marshalCNSIlist(cnsiList)
	if err != nil {
		return err
	}

	c.Response().Header().Set("Content-Type", "application/json")
	c.Response().Write(jsonString)
	return nil
}

func (p *portalProxy) getDatacenters(c echo.Context) error {
	log.Debug("get Datacenters")
	jobList := p.buildDatacenters(c)

	jsonString, err := json.Marshal(jobList)
	if err != nil {
		return err
	}

	c.Response().Header().Set("Content-Type", "application/json")
	c.Response().Write(jsonString)
	return nil
}

func (p *portalProxy) buildDatacenters(c echo.Context) ankr_const.Metrics {
	url := "client.dccn.ankr.network"
	port := "50051"
	conn, err := grpc.Dial(url+":"+port, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}

	defer conn.Close()
	dc2 := pb.NewDccncliClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	r, err := dc2.DataCenterList(ctx, &pb.DataCenterListRequest{Usertoken: "ed1605e17374bde6c68864d072c9f5c9"})
	if err != nil {
		log.Fatalf("Client: could not send: %v", err)
	}
	Taskinfos := r.DcList[0]
	var m ankr_const.Metrics
	if Taskinfos == nil {
		log.Fatalf("Client: could not receive the Datacenter information.")
	}
	log.Info(Taskinfos.Metrics)
	json.Unmarshal([]byte(Taskinfos.Metrics), &m)
	log.Info(m)
	return m
}

func (p *portalProxy) buildJobs(c echo.Context) []*pb.TaskInfo {
	url := "client.dccn.ankr.network"
	port := "50051"
	conn, err := grpc.Dial(url+":"+port, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}

	defer conn.Close()
	dc2 := pb.NewDccncliClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	r, err := dc2.TaskList(ctx, &pb.TaskListRequest{Usertoken: "ed1605e17374bde6c68864d072c9f5c9"})
	if err != nil {
		log.Fatalf("Client: could not send: %v", err)
	}
	Taskinfos := r.Tasksinfo
	log.Info(Taskinfos)
	log.Info("Sucessfully obtained list of tasks")
	return Taskinfos
}

func (p *portalProxy) getJobs(c echo.Context) error {
	log.Debug("get Jobs")
	jobList := p.buildJobs(c)

	jsonString, err := json.Marshal(jobList)
	if err != nil {
		return err
	}

	c.Response().Header().Set("Content-Type", "application/json")
	c.Response().Write(jsonString)
	return nil
}

func (p *portalProxy) createJob(c echo.Context) error {
	log.Info("Create Job")
	s, err := ioutil.ReadAll(c.Request().Body())
	if err != nil {
		return err
	}

	var body map[string]interface{}
	if err := json.Unmarshal(s, &body); err != nil {
		return err
	}

	log.Info(body)

	url := "client.dccn.ankr.network"
	port := "50051"
	conn, err := grpc.Dial(url+":"+port, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}

	defer conn.Close()
	dc := pb.NewDccncliClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	Datacenterids := body["datacenter"].(string)
	Datacenteridint64, err := strconv.ParseInt(Datacenterids, 10, 64)
	if err != nil {
		log.Info("Coversion Error")
	}
	tcrq := &pb.AddTaskRequest{
		Name:       body["taskname"].(string),
		Type:       "web",
		Datacenterid: Datacenteridint64,
		Usertoken:  "ed1605e17374bde6c68864d072c9f5c9",
	}
	log.Info("xiaowu")
	if body["replica"].(string) != "" {
		replicaCount, err := strconv.Atoi(body["replica"].(string))
		if err != nil {
			return fmt.Errorf("replica count %s is not an int", body["replica"].(string))
		}
		tcrq.Replica = int64(replicaCount)
	}

	tcrp, err := dc.AddTask(ctx, tcrq)
	if err != nil {
		return err
	}
	if tcrp.Status == "Success" {
		log.Info("Task id %d created successfully. \n", tcrp.Taskid)
	} else {
		log.Info("Fail to create task. \n", tcrp.Reason)
	}

	// jsonString, err := json.Marshal(jobList)
	// if err != nil {
	// 	return err
	// }

	// c.Response().Header().Set("Content-Type", "application/json")
	// c.Response().Write(jsonString)
	return nil
}

func (p *portalProxy) cancelJob(c echo.Context) error {
	log.Info("Cancel Job")
	s, err := ioutil.ReadAll(c.Request().Body())
	if err != nil {
		return err
	}

	var body map[string]interface{}
	if err := json.Unmarshal(s, &body); err != nil {
		return err
	}

	log.Info(body)

	url := "client.dccn.ankr.network"
	port := "50051"
	conn, err := grpc.Dial(url+":"+port, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	dc := pb.NewDccncliClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	idinterface := body["taskID"]
	log.Info(idinterface)
	idfloat64 := idinterface.(float64)
	log.Info("BeforeID")
	id := int64(idfloat64)
	log.Info(id)
	if err != nil {
		log.Fatalf("ID is not an integer")
	}
		log.Info("Afterid")
	if ctr, err := dc.CancelTask(ctx, &pb.CancelTaskRequest{Taskid: id, Usertoken: "ed1605e17374bde6c68864d072c9f5c9"}); err != nil {
		return fmt.Errorf("unable to delete task %d: %v", id, err)
	} else {
		fmt.Printf("Delete task id %d ...%s! \n", id, ctr.Status)
	}

	// c.Response().Header().Set("Content-Type", "application/json")
	// c.Response().Write(jsonString)
	return nil
}

func (p *portalProxy) deleteJob(c echo.Context) error {
	log.Info("Delete Job")
	s, err := ioutil.ReadAll(c.Request().Body())
	log.Info(s)
	if err != nil {
		return err
	}

	var body map[string]interface{}
	if err := json.Unmarshal(s, &body); err != nil {
		return err
	}

	log.Info(body)
	log.Info("xiaowu")

	url := "client.dccn.ankr.network"
	port := "50051"
	conn, err := grpc.Dial(url+":"+port, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	dc := pb.NewDccncliClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	idinterface := body["taskID"]
	log.Info(idinterface)
	idfloat64 := idinterface.(float64)
	log.Info("BeforeID")
	id := int64(idfloat64)
	log.Info(id)
	if err != nil {
		log.Fatalf("ID is not an integer")
	}
		log.Info("Afterid")
	if ctr, err := dc.PurgeTask(ctx, &pb.PurgeTaskRequest{Taskid: id, Usertoken: "ed1605e17374bde6c68864d072c9f5c9"}); err != nil {
		return fmt.Errorf("unable to delete task %d: %v", id, err)
	} else {
		fmt.Printf("Delete task id %d ...%s! \n", id, ctr.Status)
	}

	// c.Response().Header().Set("Content-Type", "application/json")
	// c.Response().Write(jsonString)
	return nil
}

func (p *portalProxy) updateJob(c echo.Context) error {
	log.Info("Update Job")
	s, err := ioutil.ReadAll(c.Request().Body())
	if err != nil {
		return err
	}

	var body map[string]interface{}
	if err := json.Unmarshal(s, &body); err != nil {
		return err
	}

	log.Info(body)

	url := "client.dccn.ankr.network"
	port := "50051"
	conn, err := grpc.Dial(url+":"+port, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	dc := pb.NewDccncliClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	id, err := strconv.Atoi(body["taskID"].(string))
	if err != nil {
		log.Fatalf("ID is not an integer")
	}

	log.Info(id)
	utrq := &pb.UpdateTaskRequest{
		Usertoken: "ed1605e17374bde6c68864d072c9f5c9",
		Taskid:    int64(id),
	}
	log.Info(utrq.Taskid)
	/*if body["replica"].(string) != "" {
		replicaCount, err := strconv.Atoi(body["replica"].(string))
		if err != nil {
			return fmt.Errorf("replica count %s is not an int", body["replica"].(string))
		}
		utrq.Replica = int64(replicaCount)
	}*/
	utrq.Replica = 1
	log.Info(utrq.Usertoken)
	if body["taskname"].(string) != "" {
		utrq.Name = body["taskname"].(string)
	}
	log.Info(utrq.Taskid)
	log.Info(utrq.Name)
	if utrp, err := dc.UpdateTask(ctx, utrq); err != nil {
		return fmt.Errorf("unable to update task %d: %v", id, err)
	} else {
		fmt.Printf("Update task id %d ...%s! \n", id, utrp.Status)
	}
	// c.Response().Header().Set("Content-Type", "application/json")
	// c.Response().Write(jsonString)
	return nil
}

func (p *portalProxy) listRegisteredCNSIs(c echo.Context) error {
	log.Debug("listRegisteredCNSIs")
	userGUIDIntf, err := p.GetSessionValue(c, "user_id")
	if err != nil {
		return interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"User session could not be found",
			"User session could not be found: %v", err,
		)
	}
	userGUID := userGUIDIntf.(string)

	cnsiRepo, err := cnsis.NewPostgresCNSIRepository(p.DatabaseConnectionPool)
	if err != nil {
		return fmt.Errorf("listRegisteredCNSIs: %s", err)
	}

	var jsonString []byte
	var clusterList []*interfaces.ConnectedEndpoint

	clusterList, err = cnsiRepo.ListByUser(userGUID)
	if err != nil {
		return interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"Failed to retrieve list of clusters",
			"Failed to retrieve list of clusters: %v", err,
		)
	}

	jsonString, err = marshalClusterList(clusterList)
	if err != nil {
		return err
	}

	c.Response().Header().Set("Content-Type", "application/json")
	c.Response().Write(jsonString)
	return nil
}

func marshalCNSIlist(cnsiList []*interfaces.CNSIRecord) ([]byte, error) {
	log.Debug("marshalCNSIlist")
	jsonString, err := json.Marshal(cnsiList)
	if err != nil {
		return nil, interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"Failed to retrieve list of CNSIs",
			"Failed to retrieve list of CNSIs: %v", err,
		)
	}
	return jsonString, nil
}

func marshalClusterList(clusterList []*interfaces.ConnectedEndpoint) ([]byte, error) {
	log.Debug("marshalClusterList")
	jsonString, err := json.Marshal(clusterList)
	if err != nil {
		return nil, interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"Failed to retrieve list of clusters",
			"Failed to retrieve list of clusters: %v", err,
		)
	}
	return jsonString, nil
}

func (p *portalProxy) GetCNSIRecord(guid string) (interfaces.CNSIRecord, error) {
	log.Debug("GetCNSIRecord")
	cnsiRepo, err := cnsis.NewPostgresCNSIRepository(p.DatabaseConnectionPool)
	if err != nil {
		return interfaces.CNSIRecord{}, err
	}

	rec, err := cnsiRepo.Find(guid, p.Config.EncryptionKeyInBytes)
	if err != nil {
		return interfaces.CNSIRecord{}, err
	}

	// Ensure that trailing slash is removed from the API Endpoint
	rec.APIEndpoint.Path = strings.TrimRight(rec.APIEndpoint.Path, "/")

	return rec, nil
}

func (p *portalProxy) GetCNSIRecordByEndpoint(endpoint string) (interfaces.CNSIRecord, error) {
	log.Debug("GetCNSIRecordByEndpoint")
	var rec interfaces.CNSIRecord

	cnsiRepo, err := cnsis.NewPostgresCNSIRepository(p.DatabaseConnectionPool)
	if err != nil {
		return rec, err
	}

	rec, err = cnsiRepo.FindByAPIEndpoint(endpoint, p.Config.EncryptionKeyInBytes)
	if err != nil {
		return rec, err
	}

	// Ensure that trailing slash is removed from the API Endpoint
	rec.APIEndpoint.Path = strings.TrimRight(rec.APIEndpoint.Path, "/")

	return rec, nil
}

func (p *portalProxy) cnsiRecordExists(endpoint string) bool {
	log.Debug("cnsiRecordExists")

	_, err := p.GetCNSIRecordByEndpoint(endpoint)
	return err == nil
}

func (p *portalProxy) setCNSIRecord(guid string, c interfaces.CNSIRecord) error {
	log.Debug("setCNSIRecord")
	cnsiRepo, err := cnsis.NewPostgresCNSIRepository(p.DatabaseConnectionPool)
	if err != nil {
		log.Errorf(dbReferenceError, err)
		return fmt.Errorf(dbReferenceError, err)
	}

	err = cnsiRepo.Save(guid, c, p.Config.EncryptionKeyInBytes)
	if err != nil {
		msg := "Unable to save a CNSI Token: %v"
		log.Errorf(msg, err)
		return fmt.Errorf(msg, err)
	}

	return nil
}

func (p *portalProxy) unsetCNSIRecord(guid string) error {
	log.Debug("unsetCNSIRecord")
	cnsiRepo, err := cnsis.NewPostgresCNSIRepository(p.DatabaseConnectionPool)
	if err != nil {
		log.Errorf(dbReferenceError, err)
		return fmt.Errorf(dbReferenceError, err)
	}

	err = cnsiRepo.Delete(guid)
	if err != nil {
		msg := "Unable to delete a CNSI record: %v"
		log.Errorf(msg, err)
		return fmt.Errorf(msg, err)
	}

	return nil
}

func (p *portalProxy) GetCNSITokenRecord(cnsiGUID string, userGUID string) (interfaces.TokenRecord, bool) {
	log.Debug("GetCNSITokenRecord")
	tokenRepo, err := tokens.NewPgsqlTokenRepository(p.DatabaseConnectionPool)
	if err != nil {
		return interfaces.TokenRecord{}, false
	}

	tr, err := tokenRepo.FindCNSIToken(cnsiGUID, userGUID, p.Config.EncryptionKeyInBytes)
	if err != nil {
		return interfaces.TokenRecord{}, false
	}

	return tr, true
}

func (p *portalProxy) GetCNSITokenRecordWithDisconnected(cnsiGUID string, userGUID string) (interfaces.TokenRecord, bool) {
	log.Debug("GetCNSITokenRecordWithDisconnected")
	tokenRepo, err := tokens.NewPgsqlTokenRepository(p.DatabaseConnectionPool)
	if err != nil {
		return interfaces.TokenRecord{}, false
	}

	tr, err := tokenRepo.FindCNSITokenIncludeDisconnected(cnsiGUID, userGUID, p.Config.EncryptionKeyInBytes)
	if err != nil {
		return interfaces.TokenRecord{}, false
	}

	return tr, true
}

func (p *portalProxy) ListEndpointsByUser(userGUID string) ([]*interfaces.ConnectedEndpoint, error) {
	log.Debug("ListCEndpointsByUser")
	cnsiRepo, err := cnsis.NewPostgresCNSIRepository(p.DatabaseConnectionPool)
	if err != nil {
		log.Errorf(dbReferenceError, err)
		return nil, fmt.Errorf(dbReferenceError, err)
	}

	cnsiList, err := cnsiRepo.ListByUser(userGUID)
	if err != nil {
		log.Debugf("Error was: %+v", err)
		return nil, err
	}

	return cnsiList, nil
}

// Uopdate the Access Token, Refresh Token and Token Expiry for a token
func (p *portalProxy) updateTokenAuth(userGUID string, t interfaces.TokenRecord) error {
	log.Debug("updateTokenAuth")
	tokenRepo, err := tokens.NewPgsqlTokenRepository(p.DatabaseConnectionPool)
	if err != nil {
		log.Errorf(dbReferenceError, err)
		return fmt.Errorf(dbReferenceError, err)
	}

	err = tokenRepo.UpdateTokenAuth(userGUID, t, p.Config.EncryptionKeyInBytes)
	if err != nil {
		msg := "Unable to update Token: %v"
		log.Errorf(msg, err)
		return fmt.Errorf(msg, err)
	}

	return nil
}

func (p *portalProxy) setCNSITokenRecord(cnsiGUID string, userGUID string, t interfaces.TokenRecord) error {
	log.Debug("setCNSITokenRecord")
	tokenRepo, err := tokens.NewPgsqlTokenRepository(p.DatabaseConnectionPool)
	if err != nil {
		log.Errorf(dbReferenceError, err)
		return fmt.Errorf(dbReferenceError, err)
	}

	err = tokenRepo.SaveCNSIToken(cnsiGUID, userGUID, t, p.Config.EncryptionKeyInBytes)
	if err != nil {
		msg := "Unable to save a CNSI Token: %v"
		log.Errorf(msg, err)
		return fmt.Errorf(msg, err)
	}

	return nil
}

func (p *portalProxy) unsetCNSITokenRecord(cnsiGUID string, userGUID string) error {
	log.Debug("unsetCNSITokenRecord")
	tokenRepo, err := tokens.NewPgsqlTokenRepository(p.DatabaseConnectionPool)
	if err != nil {
		msg := "Unable to establish a database reference: '%v'"
		log.Errorf(msg, err)
		return fmt.Errorf(msg, err)
	}

	err = tokenRepo.DeleteCNSIToken(cnsiGUID, userGUID)
	if err != nil {
		msg := "Unable to delete a CNSI Token: %v"
		log.Errorf(msg, err)
		return fmt.Errorf(msg, err)
	}

	return nil
}

func (p *portalProxy) unsetCNSITokenRecords(cnsiGUID string) error {
	log.Debug("unsetCNSITokenRecord")
	tokenRepo, err := tokens.NewPgsqlTokenRepository(p.DatabaseConnectionPool)
	if err != nil {
		msg := "Unable to establish a database reference: '%v'"
		log.Errorf(msg, err)
		return fmt.Errorf(msg, err)
	}

	err = tokenRepo.DeleteCNSITokens(cnsiGUID)
	if err != nil {
		msg := "Unable to delete a CNSI Token: %v"
		log.Errorf(msg, err)
		return fmt.Errorf(msg, err)
	}

	return nil
}
