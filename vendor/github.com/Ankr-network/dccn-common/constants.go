package ankr_const

// RabbitQ name
const TaskManagerQueueName = "task_manager"
const K8sAdopterQueueName = "k8s_adopter"

// Request Types
const RequestTypeAddTask = "AddTask"
const RequestTypeTaskList = "TaskListRequest"
const RequestTypeCancelTask = "CancelTaskRequest"

// Task Events
const NewTaskEvent = "New"
const UpdateTaskEvent = "Update"
const CancelTaskEvent = "Cancel"

// Hub task status
const TaskStatusNew = "new"
const TaskStatusRunning = "running"
const TaskStatusStartFailed = "startFailed"
const TaskStatusUpdating = "updating"
const TaskStatusUpdateFailed = "updateFailed"
const TaskStatusCancelled = "cancelled"
const TaskStatusDone = "done"

// Data center task status
const DataCenterTaskStartSuccess = "StartSuccess"
const DataCenterTaskStartFailure = "StartFailure"
const DataCenterTaskUpdateSuccess = "UpdateSuccess"
const DataCenterTaskUpdateFailure = "UpdateFailure"
const DataCenterTaskDone = "Done"
const DataCenterTaskCancelled = "Cancelled"

// Data center status
const DataCenteStatusOnLine = "available"
const DataCenteStatusOffLine = "unavailable"

// CLI reply status
const CliReplyStatusSuccess = "Success"
const CliReplyStatusFailure = "Failure"

// CLI errors
const CliErrorReasonDataCenterNotExist = "DataCenter does not exist"
const CliErrorReasonUserNotExist = "Token error, can not find user"
const CliErrorReasonTaskNotExist = "Task does not exist"
const CliErrorReasonUserNotOwn = "User does not own this task"
const CliErrorReasonUpdateFailed = "Task can not be updated"

const CliErrorReasonUserExit= "User already existed"
const CliErrorReasonPasswordError = "Password does not match"
const CliErrorReasonNamePasswordEmpty = "Name or Password is empty"

// To do: Remove this line when usrmgr is ready
const DefaultUserToken = "ed1605e17374bde6c68864d072c9f5c9"

const DefaultPort = 50051      // Default port for gRPC connection
const HeartBeatInterval = 30   // Default interval for heartbeating
const ClientTimeOut = 60       // Default timeout for client connection
const MicroServiceTimeOut = 10 // Default timeout for internal micro service connection


//DataCenter Metrics
type Metrics struct {
	TotalCPU     int64
	UsedCPU      int64
	TotalMemory  int64
	UsedMemory   int64
	TotalStorage int64
	UsedStorage  int64
	ImageCount    int64
	EndPointCount int64
	NetworkIO     int64
}
