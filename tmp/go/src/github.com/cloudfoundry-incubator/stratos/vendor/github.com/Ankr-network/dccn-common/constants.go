package ankr_const

const TaskManagerQueueName = "task_manager"
const NewTaskEvent = "New"
const UpdateTaskEvent = "Update"
const CancelTaskEvent = "Cancel"

const TaskStatusNew = "new"
const TaskStatusRunning = "running"
const TaskStatusStartFailed = "startFailed"
const TaskStatusUpdating = "updating"
const TaskStatusUpdateFailed = "updateFailed"
const TaskStatusCancelled = "cancelled"
const TaskStatusDone = "done"


const DataCenterTaskStartSuccess = "StartSuccess"
const DataCenterTaskStartFailure = "StartFailure"
const DataCenterTaskUpdateSuccess = "UpdateSuccess"
const DataCenterTaskUpdateFailure = "UpdateFailure"
const DataCenterTaskDone = "Done"
const DataCenterTaskCancelled = "Cancelled"

const CliReplyStatusSuccess = "Success"
const CliReplyStatusFailure = "Failure"

const DataCenterName = "datacenter_1"

const DataCenteStatusOnLine = "available"
const DataCenteStatusOffLine = "unavailable"


const TaskHidden = "hidden"


const CliErrorReasonDataCenterNotExist = "DataCenter does not exist"
const CliErrorReasonUserNotExist = "User does not exist"
const CliErrorReasonTaskNotExist = "Task does not exist"
const CliErrorReasonUserNotOwn = "User does not own this task"
const CliErrorReasonUpdateFailed = "Task can not be updated"


const DefaultPort = "50051"

const DefaultUserToken = "ed1605e17374bde6c68864d072c9f5c9"

const HeartBeatTimeOut = 30
