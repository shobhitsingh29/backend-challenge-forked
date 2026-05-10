# Backend Coding Challenge

This repository demonstrates a backend architecture that handles asynchronous tasks, workflows, and job execution using TypeScript, Express.js, and TypeORM. The project showcases how to:

- Define and manage entities such as `Task` and `Workflow`.
- Use a `WorkflowFactory` to create workflows from YAML configurations.
- Implement a `TaskRunner` that executes jobs associated with tasks and manages task and workflow states.
- Run tasks asynchronously using a background worker.

## Key Features

1. **Entity Modeling with TypeORM**  
   - **Task Entity:** Represents an individual unit of work with attributes like `taskType`, `status`, `progress`, and references to a `Workflow`.
   - **Workflow Entity:** Groups multiple tasks into a defined sequence or steps, allowing complex multi-step processes.

2. **Workflow Creation from YAML**  
   - Use `WorkflowFactory` to load workflow definitions from a YAML file.
   - Dynamically create workflows and tasks without code changes by updating YAML files.

3. **Asynchronous Task Execution**  
   - A background worker (`taskWorker`) continuously polls for `queued` tasks.
   - The `TaskRunner` runs the appropriate job based on a task’s `taskType`.

4. **Robust Status Management**  
   - `TaskRunner` updates the status of tasks (from `queued` to `in_progress`, `completed`, or `failed`).
   - Workflow status is evaluated after each task completes, ensuring you know when the entire workflow is `completed` or `failed`.

5. **Dependency Injection and Decoupling**  
   - `TaskRunner` takes in only the `Task` and determines the correct job internally.
   - `TaskRunner` handles task state transitions, leaving the background worker clean and focused on orchestration.

## Project Structure

```
src
├─ models/
│   ├─ world_data.json  # Contains world data for analysis
│   
├─ models/
│   ├─ Result.ts        # Defines the Result entity
│   ├─ Task.ts          # Defines the Task entity
│   ├─ Workflow.ts      # Defines the Workflow entity
│   
├─ jobs/
│   ├─ Job.ts           # Job interface
│   ├─ JobFactory.ts    # getJobForTaskType function for mapping taskType to a Job
│   ├─ TaskRunner.ts    # Handles job execution & task/workflow state transitions
│   ├─ DataAnalysisJob.ts (example)
│   ├─ EmailNotificationJob.ts (example)
│
├─ workflows/
│   ├─ WorkflowFactory.ts  # Creates workflows & tasks from a YAML definition
│
├─ workers/
│   ├─ taskWorker.ts    # Background worker that fetches queued tasks & runs them
│
├─ routes/
│   ├─ analysisRoutes.ts # POST /analysis endpoint to create workflows
│
├─ data-source.ts       # TypeORM DataSource configuration
└─ index.ts             # Express.js server initialization & starting the worker
```

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm or yarn
- SQLite or another supported database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/backend-coding-challenge.git
   cd backend-coding-challenge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure TypeORM:**
    - Edit `data-source.ts` to ensure the `entities` array includes `Task` and `Workflow` entities.
    - Confirm database settings (e.g. SQLite file path).

4. **Create or Update the Workflow YAML:**
    - Place a YAML file (e.g. `example_workflow.yml`) in a `workflows/` directory.
    - Define steps, for example:
      ```yaml
      name: "example_workflow"
      steps:
        - taskType: "analysis"
          stepNumber: 1
        - taskType: "notification"
          stepNumber: 2
      ```

### Running the Application

1. **Compile TypeScript (optional if using `ts-node`):**
   ```bash
   npx tsc
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

   If using `ts-node`, this will start the Express.js server and the background worker after database initialization.

3. **Create a Workflow (e.g. via `/analysis`):**
   ```bash
   curl -X POST http://localhost:3000/analysis \
   -H "Content-Type: application/json" \
   -d '{
    "clientId": "client123",
    "geoJson": {
        "type": "Polygon",
        "coordinates": [
            [
                [
                    -63.624885020050996,
                    -10.311050368263523
                ],
                [
                    -63.624885020050996,
                    -10.367865108370523
                ],
                [
                    -63.61278302732815,
                    -10.367865108370523
                ],
                [
                    -63.61278302732815,
                    -10.311050368263523
                ],
                [
                    -63.624885020050996,
                    -10.311050368263523
                ]
            ]
        ]
    }
    }'
   ```

   This will read the configured workflow YAML, create a workflow and tasks, and queue them for processing.

4. **Check Logs:**
    - The worker picks up tasks from `queued` state.
    - `TaskRunner` runs the corresponding job (e.g., data analysis, email notification) and updates states.
    - Once tasks are done, the workflow is marked as `completed`.


### **Coding Challenge Tasks for the Interviewee**

The following tasks must be completed to enhance the backend system:

---

### **1. Add a New Job to Calculate Polygon Area**
**Objective:**  
Create a new job class to calculate the area of a polygon from the GeoJSON provided in the task.

#### **Steps:**
1. Create a new job file `PolygonAreaJob.ts` in the `src/jobs/` directory.
2. Implement the `Job` interface in this new class.
3. Use `@turf/area` to calculate the polygon area from the `geoJson` field in the task.
4. Save the result in the `output` field of the task.

#### **Requirements:**
- The `output` should include the calculated area in square meters.
- Ensure that the job handles invalid GeoJSON gracefully and marks the task as failed.

---

### **2. Add a Job to Generate a Report**
**Objective:**  
Create a new job class to generate a report by aggregating the outputs of multiple tasks in the workflow.

#### **Steps:**
1. Create a new job file `ReportGenerationJob.ts` in the `src/jobs/` directory.
2. Implement the `Job` interface in this new class.
3. Aggregate outputs from all preceding tasks in the workflow into a JSON report. For example:
   ```json
   {
       "workflowId": "<workflow-id>",
       "tasks": [
           { "taskId": "<task-1-id>", "type": "polygonArea", "output": "<area>" },
           { "taskId": "<task-2-id>", "type": "dataAnalysis", "output": "<analysis result>" }
       ],
       "finalReport": "Aggregated data and results"
   }
   ```
4. Save the report as the `output` of the `ReportGenerationJob`.

#### **Requirements:**
- Ensure the job runs only after all preceding tasks are complete.
- Handle cases where tasks fail, and include error information in the report.

---

### **3. Support Interdependent Tasks in Workflows**
**Objective:**  
Modify the system to support workflows with tasks that depend on the outputs of earlier tasks.

#### **Steps:**
1. Update the `Task` entity to include a `dependency` field that references another task
2. Modify the `TaskRunner` to wait for dependent tasks to complete and pass their outputs as inputs to the current task.
3. Extend the workflow YAML format to specify task dependencies (e.g., `dependsOn`).
4. Update the `WorkflowFactory` to parse dependencies and create tasks accordingly.

#### **Requirements:**
- Ensure dependent tasks do not execute until their dependencies are completed.
- Test workflows where tasks are chained through dependencies.

---

### **4. Ensure Final Workflow Results Are Properly Saved**
**Objective:**  
Save the aggregated results of all tasks in the workflow as the `finalResult` field of the `Workflow` entity.

#### **Steps:**
1. Modify the `Workflow` entity to include a `finalResult` field:
2. Aggregate the outputs of all tasks in the workflow after the last task completes.
3. Save the aggregated results in the `finalResult` field.

#### **Requirements:**
- The `finalResult` must include outputs from all completed tasks.
- Handle cases where tasks fail, and include failure information in the final result.

---

### **5. Create an Endpoint for Getting Workflow Status**
**Objective:**  
Implement an API endpoint to retrieve the current status of a workflow.

#### **Endpoint Specification:**
- **URL:** `/workflow/:id/status`
- **Method:** `GET`
- **Response Example:**
   ```json
   {
       "workflowId": "3433c76d-f226-4c91-afb5-7dfc7accab24",
       "status": "in_progress",
       "completedTasks": 3,
       "totalTasks": 5
   }
   ```

#### **Requirements:**
- Include the number of completed tasks and the total number of tasks in the workflow.
- Return a `404` response if the workflow ID does not exist.

---

### **6. Create an Endpoint for Retrieving Workflow Results**
**Objective:**  
Implement an API endpoint to retrieve the final results of a completed workflow.

#### **Endpoint Specification:**
- **URL:** `/workflow/:id/results`
- **Method:** `GET`
- **Response Example:**
   ```json
   {
       "workflowId": "3433c76d-f226-4c91-afb5-7dfc7accab24",
       "status": "completed",
       "finalResult": "Aggregated workflow results go here"
   }
   ```

#### **Requirements:**
- Return the `finalResult` field of the workflow if it is completed.
- Return a `404` response if the workflow ID does not exist.
- Return a `400` response if the workflow is not yet completed.

---

---

## Implementation Summary

All coding challenge tasks have been successfully implemented. This section documents the completed features.

### **1. Polygon Area Calculation Job ✓**

**File:** `src/jobs/PolygonAreaJob.ts`

Calculates the area of a polygon using Turf.js area function.

**Example Output:**
```json
{
  "areaInSquareMeters": 8363324.273315565
}
```

**Error Handling:** Invalid GeoJSON geometries are caught and the task is marked as failed.

### **2. Report Generation Job ✓**

**File:** `src/jobs/ReportGenerationJob.ts`

Aggregates outputs from all preceding tasks in the workflow.

**Example Output:**
```json
{
  "workflowId": "dbd36551-089c-4d8e-a724-d4879c531162",
  "tasks": [
    {
      "taskId": "cdd771fd-0763-4878-874e-a77ef2537b18",
      "type": "analysis",
      "status": "completed",
      "output": "Brazil"
    },
    {
      "taskId": "154a85c6-5109-483e-b573-f5b3998e7448",
      "type": "polygonArea",
      "status": "completed",
      "output": {
        "areaInSquareMeters": 8363324.273315565
      }
    }
  ],
  "finalReport": "Workflow completed with 4 tasks. Results aggregated successfully."
}
```

### **3. Task Dependencies Support ✓**

**Modified Files:** `src/models/Task.ts`, `src/workflows/WorkflowFactory.ts`, `src/workers/taskWorker.ts`

Tasks can now specify dependencies on other tasks using the `dependsOn` field.

**YAML Example with Dependencies:**
```yaml
name: "workflow_with_dependencies"
steps:
  - taskType: "analysis"
    stepNumber: 1
  - taskType: "polygonArea"
    stepNumber: 2
  - taskType: "notification"
    stepNumber: 3
    dependsOn: 1    # This task waits for step 1 to complete
  - taskType: "report"
    stepNumber: 4
    dependsOn: 2    # This task waits for step 2 to complete
```

**How It Works:**
- Tasks with unmet dependencies remain in the `queued` state
- The task worker skips queued tasks whose dependencies haven't completed yet
- Once a dependency completes, the dependent task is executed on the next poll cycle

### **4. Workflow Final Results ✓**

**Modified File:** `src/models/Workflow.ts`, `src/workers/taskRunner.ts`

The workflow entity now stores aggregated results from all tasks when the workflow completes.

**Final Result Structure:**
```json
{
  "workflowId": "dbd36551-089c-4d8e-a724-d4879c531162",
  "status": "completed",
  "completedAt": "2026-05-10T22:23:39.835Z",
  "tasks": [
    {
      "taskId": "cdd771fd-0763-4878-874e-a77ef2537b18",
      "type": "analysis",
      "status": "completed",
      "result": "Brazil"
    },
    ...
  ]
}
```

### **5. Workflow Status Endpoint ✓**

**URL:** `GET /workflow/:id/status`

Retrieve the current progress of a workflow.

**Example Request:**
```bash
curl http://localhost:3000/workflow/dbd36551-089c-4d8e-a724-d4879c531162/status
```

**Example Response:**
```json
{
  "workflowId": "dbd36551-089c-4d8e-a724-d4879c531162",
  "status": "completed",
  "completedTasks": 4,
  "totalTasks": 4
}
```

**Status Values:**
- `initial` - Workflow created but not started
- `in_progress` - At least one task is running or queued
- `completed` - All tasks completed successfully
- `failed` - One or more tasks failed

### **6. Workflow Results Endpoint ✓**

**URL:** `GET /workflow/:id/results`

Retrieve the final results of a completed workflow.

**Example Request:**
```bash
curl http://localhost:3000/workflow/dbd36551-089c-4d8e-a724-d4879c531162/results
```

**Example Response:**
```json
{
  "workflowId": "dbd36551-089c-4d8e-a724-d4879c531162",
  "status": "completed",
  "finalResult": {
    "workflowId": "dbd36551-089c-4d8e-a724-d4879c531162",
    "status": "completed",
    "completedAt": "2026-05-10T22:23:39.835Z",
    "tasks": [...]
  }
}
```

**Error Responses:**
- `404` - Workflow not found
- `400` - Workflow is not yet completed

---

## Testing the Implementation

### Prerequisites for Testing

Before running tests, ensure:
- Node.js is installed (`node --version`)
- Dependencies are installed (`npm install`)
- Server is running (`npm start`)
- Database is initialized (SQLite by default)

### 1. Quick Start Test (All Tasks)

This test creates a complete workflow with all 4 task types and verifies end-to-end execution.

#### Step 1: Start the server
```bash
npm start
```
Expected output: Server listening on port 3000, background worker started.

#### Step 2: Create a workflow
```bash
RESPONSE=$(curl -X POST http://localhost:3000/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test-client-001",
    "geoJson": {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-63.624885020050996, -10.311050368263523],
          [-63.624885020050996, -10.367865108370523],
          [-63.61278302732815, -10.367865108370523],
          [-63.61278302732815, -10.311050368263523],
          [-63.624885020050996, -10.311050368263523]
        ]]
      }
    }
  }')

echo $RESPONSE | jq .
```

Expected response:
```json
{
  "workflowId": "550e8400-e29b-41d4-a716-446655440000",
  "clientId": "test-client-001",
  "status": "initial"
}
```

Save the `workflowId` for the next steps.

#### Step 3: Monitor workflow status progression
```bash
WORKFLOW_ID="550e8400-e29b-41d4-a716-446655440000"  # Replace with your workflowId

# Check status immediately (should show 0/4 completed)
curl http://localhost:3000/workflow/$WORKFLOW_ID/status | jq .
```

Expected response (initial):
```json
{
  "workflowId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "initial",
  "completedTasks": 0,
  "totalTasks": 4
}
```

#### Step 4: Wait for task execution and monitor progress
```bash
# Wait 5-10 seconds and check again
sleep 5
curl http://localhost:3000/workflow/$WORKFLOW_ID/status | jq .
```

Expected response (in progress):
```json
{
  "workflowId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "in_progress",
  "completedTasks": 2,
  "totalTasks": 4
}
```

#### Step 5: Retrieve final results
```bash
# Wait 20-30 seconds total for all tasks to complete
sleep 20
curl http://localhost:3000/workflow/$WORKFLOW_ID/results | jq .
```

Expected response (completed):
```json
{
  "workflowId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "finalResult": {
    "workflowId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "completedAt": "2026-05-11T10:30:45.123Z",
    "tasks": [
      {
        "taskId": "task-1-uuid",
        "type": "analysis",
        "status": "completed",
        "result": "Brazil"
      },
      {
        "taskId": "task-2-uuid",
        "type": "polygonArea",
        "status": "completed",
        "result": {
          "areaInSquareMeters": 8363324.273315565
        }
      },
      {
        "taskId": "task-3-uuid",
        "type": "notification",
        "status": "completed",
        "result": null
      },
      {
        "taskId": "task-4-uuid",
        "type": "report",
        "status": "completed",
        "result": {
          "workflowId": "550e8400-e29b-41d4-a716-446655440000",
          "tasks": [
            {"taskId": "task-1-uuid", "type": "analysis", "status": "completed", "output": "Brazil"},
            {"taskId": "task-2-uuid", "type": "polygonArea", "status": "completed", "output": {"areaInSquareMeters": 8363324.273315565}},
            {"taskId": "task-3-uuid", "type": "notification", "status": "completed", "output": null}
          ],
          "finalReport": "Workflow completed with 3 tasks. Results aggregated successfully."
        }
      }
    ]
  }
}
```

### 2. Test Individual Job Types

#### Test: Polygon Area Calculation

The polygon area job calculates the geographic area of a polygon in square meters.

```bash
WORKFLOW_ID="550e8400-e29b-41d4-a716-446655440000"

# Extract the polygon area task result
curl http://localhost:3000/workflow/$WORKFLOW_ID/results | jq '.finalResult.tasks[] | select(.type=="polygonArea")'
```

Expected output:
```json
{
  "taskId": "task-2-uuid",
  "type": "polygonArea",
  "status": "completed",
  "result": {
    "areaInSquareMeters": 8363324.273315565
  }
}
```

**Validation:** The area should be a positive number > 0 for valid polygons.

#### Test: Data Analysis Job

The analysis job identifies which country contains the polygon coordinates.

```bash
# Extract the analysis task result
curl http://localhost:3000/workflow/$WORKFLOW_ID/results | jq '.finalResult.tasks[] | select(.type=="analysis")'
```

Expected output:
```json
{
  "taskId": "task-1-uuid",
  "type": "analysis",
  "status": "completed",
  "result": "Brazil"
}
```

**Validation:** Should return a country name as a string.

#### Test: Report Generation Job

The report job aggregates all previous task results.

```bash
# Extract the report task result
curl http://localhost:3000/workflow/$WORKFLOW_ID/results | jq '.finalResult.tasks[] | select(.type=="report") | .result'
```

Expected output:
```json
{
  "workflowId": "550e8400-e29b-41d4-a716-446655440000",
  "tasks": [
    {"taskId": "task-1-uuid", "type": "analysis", "status": "completed", "output": "Brazil"},
    {"taskId": "task-2-uuid", "type": "polygonArea", "status": "completed", "output": {"areaInSquareMeters": 8363324.273315565}},
    {"taskId": "task-3-uuid", "type": "notification", "status": "completed", "output": null}
  ],
  "finalReport": "Workflow completed with 3 tasks. Results aggregated successfully."
}
```

**Validation:** Report should include all preceding tasks' results.

### 3. Test Task Dependencies

Task dependencies ensure that a task only executes after its dependent task completes.

#### Create a test workflow with dependencies
```bash
# Create a custom YAML file with dependencies
cat > /tmp/test_dependencies.yml << 'EOF'
name: "test_workflow_dependencies"
steps:
  - taskType: "analysis"
    stepNumber: 1
  - taskType: "polygonArea"
    stepNumber: 2
    dependsOn: 1      # Waits for step 1 (analysis) to complete
  - taskType: "notification"
    stepNumber: 3
    dependsOn: 2      # Waits for step 2 (polygonArea) to complete
EOF
```

#### Configure the application to use this workflow
1. Update `src/routes/analysisRoutes.ts` to point to `/tmp/test_dependencies.yml` (or copy to project)
2. Restart the server: `npm start`

#### Execute and verify dependency chain
```bash
# Create workflow
RESPONSE=$(curl -X POST http://localhost:3000/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test-dependencies",
    "geoJson": {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-63.624885,-10.311051],[-63.624885,-10.367865],[-63.612783,-10.367865],[-63.612783,-10.311051],[-63.624885,-10.311051]]]}}
  }')

WORKFLOW_ID=$(echo $RESPONSE | jq -r '.workflowId')

# Monitor tasks executing in order
echo "T=0s:"
curl http://localhost:3000/workflow/$WORKFLOW_ID/status | jq '.completedTasks, .totalTasks'

sleep 10

echo "T=10s (after step 1 & 2):"
curl http://localhost:3000/workflow/$WORKFLOW_ID/status | jq '.completedTasks, .totalTasks'

sleep 15

echo "T=25s (all complete):"
curl http://localhost:3000/workflow/$WORKFLOW_ID/results | jq '.finalResult.status'
```

**Expected behavior:**
- Task 1 (analysis) executes first
- Task 2 (polygonArea) waits for Task 1 to complete, then executes
- Task 3 (notification) waits for Task 2 to complete, then executes
- Final status: "completed"

### 4. Test Workflow Status Endpoint

The status endpoint provides real-time progress information.

```bash
WORKFLOW_ID="550e8400-e29b-41d4-a716-446655440000"

# Test status at different stages
echo "Status while processing:"
curl http://localhost:3000/workflow/$WORKFLOW_ID/status | jq .

echo "Status after completion:"
sleep 20
curl http://localhost:3000/workflow/$WORKFLOW_ID/status | jq .
```

Expected progression:
```
initial → in_progress → completed/failed
```

### 5. Test Error Cases

#### Test: Invalid Workflow ID (404 Not Found)

```bash
curl http://localhost:3000/workflow/invalid-uuid/status
```

Expected response:
```json
{
  "message": "Invalid workflow ID format"
}
```

#### Test: Workflow Not Completed (400 Bad Request)

```bash
WORKFLOW_ID="550e8400-e29b-41d4-a716-446655440000"

# Try to get results immediately after creation
curl http://localhost:3000/workflow/$WORKFLOW_ID/results
```

Expected response (if still processing):
```json
{
  "message": "Workflow is not yet completed"
}
```

#### Test: Invalid GeoJSON

```bash
curl -X POST http://localhost:3000/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "invalid-test",
    "geoJson": {"type": "InvalidType"}
  }'
```

Expected: Workflow created but tasks will fail. Check status to see "failed" status.

### 6. Run Automated Tests

```bash
npm test
```

This runs the integration tests that validate:
- ✓ Sequential job execution
- ✓ Polygon area calculation accuracy
- ✓ Report generation with task aggregation
- ✓ Job factory with multiple job types
- ✓ Error handling in job pipeline

### Testing Checklist

- [ ] Server starts without errors
- [ ] Workflow creation endpoint works
- [ ] Status endpoint shows correct task counts
- [ ] Tasks execute sequentially
- [ ] Polygon area is calculated correctly (> 0)
- [ ] Analysis job identifies the correct country
- [ ] Report job aggregates all task results
- [ ] Dependencies prevent out-of-order execution
- [ ] Final results are properly aggregated
- [ ] Error cases return appropriate status codes
- [ ] Tests pass: `npm test`

### Expected Workflow Output

The default workflow (`src/workflows/example_workflow.yml`) executes:
1. **Analysis** (stepNumber: 1) - Determines which country contains the polygon
2. **Polygon Area** (stepNumber: 2) - Calculates area in square meters
3. **Notification** (stepNumber: 3) - Simulates sending notification
4. **Report** (stepNumber: 4, depends on step 2) - Aggregates all task results

**Expected timing:** 20-30 seconds total for all tasks to complete.

---

### **Deliverables**
- **Code Implementation:** ✓
   - New jobs: `PolygonAreaJob.ts` and `ReportGenerationJob.ts`
   - Enhanced Task entity with `dependsOnTaskId` field
   - Enhanced Workflow entity with `finalResult` field
   - Updated WorkflowFactory to parse dependencies from YAML
   - Updated TaskWorker to respect task dependencies
   - Updated TaskRunner to aggregate and save workflow results
   - New API endpoints for workflow status and results

- **Documentation:** ✓
   - Comprehensive README updates with feature documentation
   - API endpoint specifications with examples
   - Testing instructions and expected behavior
   - YAML workflow configuration examples

---

