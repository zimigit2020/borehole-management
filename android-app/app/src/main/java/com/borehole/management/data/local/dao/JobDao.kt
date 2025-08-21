package com.borehole.management.data.local.dao

import androidx.room.*
import com.borehole.management.data.local.entity.JobEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface JobDao {
    @Query("SELECT * FROM jobs ORDER BY createdAt DESC")
    fun getAllJobs(): Flow<List<JobEntity>>
    
    @Query("SELECT * FROM jobs WHERE assignedSurveyorId = :surveyorId ORDER BY createdAt DESC")
    fun getAssignedJobs(surveyorId: String): Flow<List<JobEntity>>
    
    @Query("SELECT * FROM jobs WHERE id = :jobId")
    suspend fun getJobById(jobId: String): JobEntity?
    
    @Query("SELECT * FROM jobs WHERE status = :status")
    fun getJobsByStatus(status: String): Flow<List<JobEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertJob(job: JobEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertJobs(jobs: List<JobEntity>)
    
    @Update
    suspend fun updateJob(job: JobEntity)
    
    @Delete
    suspend fun deleteJob(job: JobEntity)
    
    @Query("DELETE FROM jobs")
    suspend fun deleteAllJobs()
    
    @Query("UPDATE jobs SET status = :status, surveyCompletedAt = :completedAt WHERE id = :jobId")
    suspend fun markJobSurveyed(jobId: String, status: String = "SURVEYED", completedAt: java.util.Date)
}