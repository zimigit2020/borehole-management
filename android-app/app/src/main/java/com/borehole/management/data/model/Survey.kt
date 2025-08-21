package com.borehole.management.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

@Parcelize
data class Survey(
    val id: String? = null,
    val jobId: String,
    val surveyorId: String? = null,
    val gpsLat: Double,
    val gpsLng: Double,
    val gpsAccuracy: Float? = null,
    val gpsCapturedAt: Date? = null,
    val recommendedMinDepth: Float,
    val recommendedMaxDepth: Float,
    val expectedBreaks: List<Float>,
    val soilType: String? = null,
    val groundConditions: String? = null,
    val surveyMethod: String? = null,
    val graphFileId: String? = null,
    val disclaimerAck: Boolean,
    val surveyorNotes: String? = null,
    val deviceId: String? = null,
    val offlineCreatedAt: Date? = null,
    val synced: Boolean = false,
    val createdAt: Date? = null,
    val updatedAt: Date? = null
) : Parcelable

data class CreateSurveyRequest(
    val jobId: String,
    val gpsLat: Double,
    val gpsLng: Double,
    val gpsAccuracy: Float? = null,
    val recommendedMinDepth: Float,
    val recommendedMaxDepth: Float,
    val expectedBreaks: List<Float>,
    val soilType: String? = null,
    val groundConditions: String? = null,
    val surveyMethod: String? = null,
    val disclaimerAck: Boolean,
    val surveyorNotes: String? = null,
    val deviceId: String? = null,
    val offlineCreatedAt: Date? = null
)