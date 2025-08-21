package com.borehole.management.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

@Parcelize
data class Job(
    val id: String,
    val name: String,
    val clientName: String,
    val siteName: String,
    val latitude: Double,
    val longitude: Double,
    val status: JobStatus,
    val contactPerson: String? = null,
    val contactPhone: String? = null,
    val accessNotes: String? = null,
    val priority: String? = null,
    val budgetUsd: Double? = null,
    val assignedSurveyorId: String? = null,
    val assignedDrillerId: String? = null,
    val assignedAt: Date? = null,
    val surveyCompletedAt: Date? = null,
    val createdAt: Date,
    val updatedAt: Date
) : Parcelable

enum class JobStatus {
    CREATED,
    ASSIGNED,
    SURVEYED,
    DRILLING,
    COMPLETED
}