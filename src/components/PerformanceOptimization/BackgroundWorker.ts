// A simple background task processor for offloading heavy computations

export interface Task {
  id: string;
  type: string;
  data: any;
  priority?: 'high' | 'normal' | 'low';
  createdAt: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  progress?: number;
}

export type TaskHandler = (task: Task, updateProgress: (progress: number) => void) => Promise<any>;

class BackgroundWorker {
  private queue: Task[] = [];
  private isProcessing: boolean = false;
  private handlers: Map<string, TaskHandler> = new Map();
  private maxConcurrent: number = 1;
  private activeTasks: number = 0;
  private callbacks: Map<string, ((task: Task) => void)[]> = new Map();
  
  constructor(maxConcurrent: number = 1) {
    this.maxConcurrent = maxConcurrent;
  }
  
  /**
   * Register a handler for a specific task type
   */
  registerHandler(taskType: string, handler: TaskHandler): void {
    this.handlers.set(taskType, handler);
  }
  
  /**
   * Add a task to the queue
   */
  addTask(taskType: string, data: any, priority: 'high' | 'normal' | 'low' = 'normal'): Task {
    if (!this.handlers.has(taskType)) {
      throw new Error(`No handler registered for task type: ${taskType}`);
    }
    
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: taskType,
      data,
      priority,
      createdAt: Date.now(),
      status: 'pending',
      progress: 0
    };
    
    // Add to queue based on priority
    if (priority === 'high') {
      this.queue.unshift(task);
    } else {
      this.queue.push(task);
    }
    
    // Start processing if not already running
    this.processQueue();
    
    return task;
  }
  
  /**
   * Process the task queue
   */
  private processQueue(): void {
    if (this.isProcessing || this.activeTasks >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    // Sort queue by priority and creation time
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = (priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal']);
      return priorityDiff !== 0 ? priorityDiff : a.createdAt - b.createdAt;
    });
    
    // Process task
    const task = this.queue.shift();
    if (task) {
      this.activeTasks++;
      task.status = 'running';
      
      const updateProgress = (progress: number) => {
        task.progress = progress;
        this.notifyTaskUpdate(task);
      };
      
      // Execute handler
      const handler = this.handlers.get(task.type);
      if (handler) {
        handler(task, updateProgress)
          .then(result => {
            task.status = 'completed';
            task.result = result;
            this.notifyTaskUpdate(task);
          })
          .catch(error => {
            task.status = 'failed';
            task.error = error.message || 'Unknown error';
            this.notifyTaskUpdate(task);
          })
          .finally(() => {
            this.activeTasks--;
            this.isProcessing = false;
            // Continue processing queue
            this.processQueue();
          });
      } else {
        task.status = 'failed';
        task.error = `No handler found for task type: ${task.type}`;
        this.notifyTaskUpdate(task);
        this.activeTasks--;
        this.isProcessing = false;
        this.processQueue();
      }
    } else {
      this.isProcessing = false;
    }
  }
  
  /**
   * Subscribe to task updates
   */
  onTaskUpdate(taskId: string, callback: (task: Task) => void): () => void {
    if (!this.callbacks.has(taskId)) {
      this.callbacks.set(taskId, []);
    }
    
    this.callbacks.get(taskId)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(taskId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Notify all subscribers about task update
   */
  private notifyTaskUpdate(task: Task): void {
    const callbacks = this.callbacks.get(task.id);
    if (callbacks) {
      callbacks.forEach(callback => callback(task));
    }
  }
  
  /**
   * Get the status of a task
   */
  getTaskStatus(taskId: string): Task | undefined {
    // Check active tasks
    const activeTask = this.queue.find(t => t.id === taskId);
    return activeTask;
  }
  
  /**
   * Get worker statistics
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeTasks: this.activeTasks,
      isProcessing: this.isProcessing,
      registeredHandlers: Array.from(this.handlers.keys())
    };
  }
}

// Create a singleton instance
export const backgroundWorker = new BackgroundWorker(3);

// Register some example handlers
backgroundWorker.registerHandler('data-processing', async (task, updateProgress) => {
  // Simulate processing large data sets
  const totalItems = task.data.items?.length || 100;
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < totalItems; i += batchSize) {
    // Process a batch
    const batch = task.data.items?.slice(i, i + batchSize) || [];
    const batchResults = batch.map(item => ({ ...item, processed: true }));
    results.push(...batchResults);
    
    // Update progress
    updateProgress(Math.min(100, Math.round((i + batchSize) / totalItems * 100)));
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return {
    processedItems: results.length,
    results
  };
});

backgroundWorker.registerHandler('report-generation', async (task, updateProgress) => {
  // Simulate report generation
  updateProgress(10);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  updateProgress(30);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  updateProgress(75);
  await new Promise(resolve => setTimeout(resolve, 700));
  
  updateProgress(100);
  
  return {
    reportName: task.data.name,
    generatedAt: new Date().toISOString(),
    url: `https://example.com/reports/${task.data.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
  };
});

backgroundWorker.registerHandler('data-import', async (task, updateProgress) => {
  // Simulate importing data from files
  const files = task.data.files || [];
  const totalFiles = files.length;
  
  if (totalFiles === 0) {
    throw new Error('No files to import');
  }
  
  const importedData = [];
  
  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    
    // Simulate parsing file data
    await new Promise(resolve => setTimeout(resolve, 300));
    
    importedData.push({
      fileName: file.name,
      records: Math.floor(Math.random() * 100) + 50,
      importedAt: new Date().toISOString()
    });
    
    updateProgress(Math.round((i + 1) / totalFiles * 100));
  }
  
  return {
    totalFilesImported: totalFiles,
    totalRecordsImported: importedData.reduce((sum, file) => sum + file.records, 0),
    importedData
  };
});