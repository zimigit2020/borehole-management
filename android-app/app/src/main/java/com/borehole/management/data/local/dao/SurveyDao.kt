package com.borehole.management.data.local.dao

import androidx.room.*
import com.borehole.management.data.local.entity.SurveyEntity
import com.borehole.management.data.local.entity.SyncStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface SurveyDao {
    @Query("SELECT * FROM surveys ORDER BY createdAt DESC")
    fun getAllSurveys(): Flow<List<SurveyEntity>>
    
    @Query("SELECT * FROM surveys WHERE jobId = :jobId")
    suspend fun getSurveyByJobId(jobId: String): SurveyEntity?
    
    @Query("SELECT * FROM surveys WHERE localId = :localId")
    suspend fun getSurveyById(localId: String): SurveyEntity?
    
    @Query("SELECT * FROM surveys WHERE synced = 0 AND syncStatus != :excludeStatus")
    suspend fun getUnsyncedSurveys(excludeStatus: SyncStatus = SyncStatus.IN_PROGRESS): List<SurveyEntity>
    
    @Query("SELECT * FROM surveys WHERE syncStatus = :status")
    suspend fun getSurveysBySyncStatus(status: SyncStatus): List<SurveyEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSurvey(survey: SurveyEntity): Long
    
    @Update
    suspend fun updateSurvey(survey: SurveyEntity)
    
    @Query("UPDATE surveys SET synced = 1, syncStatus = :status, serverId = :serverId WHERE localId = :localId")
    suspend fun markAsSynced(localId: String, serverId: String, status: SyncStatus = SyncStatus.SYNCED)
    
    @Query("UPDATE surveys SET syncStatus = :status, lastSyncError = :error, syncAttempts = syncAttempts + 1 WHERE localId = :localId")
    suspend fun markSyncFailed(localId: String, status: SyncStatus = SyncStatus.FAILED, error: String)
    
    @Query("UPDATE surveys SET syncStatus = :status WHERE localId = :localId")
    suspend fun updateSyncStatus(localId: String, status: SyncStatus)
    
    @Delete
    suspend fun deleteSurvey(survey: SurveyEntity)
    
    @Query("DELETE FROM surveys WHERE synced = 1 AND createdAt < :beforeDate")
    suspend fun deleteOldSyncedSurveys(beforeDate: java.util.Date)
}