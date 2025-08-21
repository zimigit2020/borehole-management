package com.untapped.borehole.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.untapped.borehole.data.local.converter.Converters
import java.util.Date
import java.util.UUID

@Entity(tableName = "survey_reports")
@TypeConverters(Converters::class)
data class SurveyReportEntity(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val jobId: String,
    val jobName: String,
    val surveyorId: String,
    val surveyorName: String,
    
    // Location Data
    val siteName: String,
    val constituency: String,
    val ward: String,
    val latitude: Double,
    val longitude: Double,
    val contactPerson: String? = null,
    val contactPhone: String? = null,
    
    // Geological Data
    val geology: String,
    val surveyMethod: String,
    
    // Drilling Recommendations
    val minDrillingDepth: Int,
    val maxDrillingDepth: Int,
    val expectedWaterBreaks: List<Int>, // Will be converted by TypeConverter
    val recommendations: String,
    
    // Special Notes
    val specialNotes: String? = null,
    val disclaimer: String? = null,
    
    // Attachments (stored as local file paths)
    val resistivityGraphPath: String? = null,
    val sitePhotoPaths: List<String> = emptyList(), // Will be converted by TypeConverter
    
    // Sync Status
    val isSynced: Boolean = false,
    val syncError: String? = null,
    val lastSyncAttempt: Date? = null,
    
    // Metadata
    val status: String = "draft", // draft, submitted, synced
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val submittedAt: Date? = null
)