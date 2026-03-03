package com.skarthik.taskmanager.service;

import com.skarthik.taskmanager.model.Task;
import com.skarthik.taskmanager.model.Priority;
import com.skarthik.taskmanager.model.Status;
import com.skarthik.taskmanager.repository.TaskRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task createTask(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Page<Task> getTasks(
            String search,
            Status status,
            Priority priority,
            Pageable pageable
    ) {

        if (search != null && status != null && priority != null) {
            return taskRepository
                    .findByStatusAndPriorityAndTitleContainingIgnoreCase(
                            status, priority, search, pageable
                    );
        }

        if (status != null && priority != null) {
            return taskRepository
                    .findByStatusAndPriority(status, priority, pageable);
        }

        if (search != null) {
            return taskRepository
                    .findByTitleContainingIgnoreCase(search, pageable);
        }

        if (status != null) {
            return taskRepository
                    .findByStatus(status, pageable);
        }

        if (priority != null) {
            return taskRepository
                    .findByPriority(priority, pageable);
        }

        return taskRepository.findAll(pageable);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public Task updateTask(Long id, Task updatedTask) {

        Task existing = getTaskById(id);

        existing.setTitle(updatedTask.getTitle());
        existing.setDescription(updatedTask.getDescription());
        existing.setStatus(updatedTask.getStatus());
        existing.setPriority(updatedTask.getPriority());
        existing.setDueDate(updatedTask.getDueDate());
        existing.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(existing);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}