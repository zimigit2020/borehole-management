package com.borehole.management.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "surveys")
data class SurveyEntity(
    @PrimaryKey
    val localId: String, // UUID for local storage
    val serverId: String? = null, // Server ID after sync
    val jobId: String,
    val surveyorId: String,
    val gpsLat: Double,
    val gpsLng: Double,
    val gpsAccuracy: Float? = null,
    val gpsCapturedAt: Date,
    val recommendedMinDepth: Float,
    val recommendedMaxDepth: Float,
    val expectedBreaks: String, // JSON array as string
    val soilType: String? = null,
    val groundConditions: String? = null,
    val surveyMethod: String? = null,
    val graphFileLocalPath: String? = null,
    val graphFileServerId: String? = null,
    val disclaimerAck: Boolean,
    val surveyorNotes: String? = null,
    val deviceId: String,
    val offlineCreatedAt: Date,
    val synced: Boolean = false,
    val syncStatus: SyncStatus = SyncStatus.PENDING,
    val syncAttempts: Int = 0,
    val lastSyncError: String? = null,
    val createdAt: Date,
    val updatedAt: Date
)

enum class SyncStatus {
    PENDING,
    IN_PROGRESS,
    SYNCED,
    FAILED,
    CONFLICT
}