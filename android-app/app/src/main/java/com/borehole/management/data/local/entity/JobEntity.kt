package com.borehole.management.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "jobs")
data class JobEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val clientName: String,
    val siteName: String,
    val latitude: Double,
    val longitude: Double,
    val status: String,
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
    val updatedAt: Date,
    val lastSyncedAt: Date? = null
)