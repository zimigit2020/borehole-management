package com.untapped.borehole.data.local.dao

import androidx.room.*
import com.untapped.borehole.data.local.entity.SurveyReportEntity
import kotlinx.coroutines.flow.Flow
import java.util.Date

@Dao
interface SurveyReportDao {
    
    @Query("SELECT * FROM survey_reports ORDER BY createdAt DESC")
    fun getAllSurveyReports(): Flow<List<SurveyReportEntity>>
    
    @Query("SELECT * FROM survey_reports WHERE jobId = :jobId LIMIT 1")
    suspend fun getSurveyReportByJobId(jobId: String): SurveyReportEntity?
    
    @Query("SELECT * FROM survey_reports WHERE id = :id")
    suspend fun getSurveyReportById(id: String): SurveyReportEntity?
    
    @Query("SELECT * FROM survey_reports WHERE isSynced = 0 AND status = 'submitted'")
    suspend fun getUnsyncedReports(): List<SurveyReportEntity>
    
    @Query("SELECT * FROM survey_reports WHERE status = :status")
    fun getSurveyReportsByStatus(status: String): Flow<List<SurveyReportEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSurveyReport(report: SurveyReportEntity)
    
    @Update
    suspend fun updateSurveyReport(report: SurveyReportEntity)
    
    @Delete
    suspend fun deleteSurveyReport(report: SurveyReportEntity)
    
    @Query("UPDATE survey_reports SET isSynced = 1, syncError = NULL WHERE id = :reportId")
    suspend fun markAsSynced(reportId: String)
    
    @Query("UPDATE survey_reports SET isSynced = 0, syncError = :error, lastSyncAttempt = :timestamp WHERE id = :reportId")
    suspend fun markSyncFailed(reportId: String, error: String, timestamp: Date)
    
    @Query("UPDATE survey_reports SET status = :status, updatedAt = :timestamp WHERE id = :reportId")
    suspend fun updateStatus(reportId: String, status: String, timestamp: Date)
    
    @Query("SELECT COUNT(*) FROM survey_reports WHERE isSynced = 0")
    fun getUnsyncedCount(): Flow<Int>
    
    @Query("DELETE FROM survey_reports WHERE status = 'draft' AND createdAt < :timestamp")
    suspend fun deleteOldDrafts(timestamp: Date)
}