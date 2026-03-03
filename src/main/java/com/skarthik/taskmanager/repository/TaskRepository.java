package com.skarthik.taskmanager.repository;

import com.skarthik.taskmanager.model.Task;
import com.skarthik.taskmanager.model.Priority;
import com.skarthik.taskmanager.model.Status;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByTitleContainingIgnoreCase(
            String title,
            Pageable pageable
    );

    Page<Task> findByStatus(
            Status status,
            Pageable pageable
    );

    Page<Task> findByPriority(
            Priority priority,
            Pageable pageable
    );

    Page<Task> findByStatusAndPriority(
            Status status,
            Priority priority,
            Pageable pageable
    );

    Page<Task> findByStatusAndPriorityAndTitleContainingIgnoreCase(
            Status status,
            Priority priority,
            String title,
            Pageable pageable
    );
}