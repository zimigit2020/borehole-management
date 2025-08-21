package com.borehole.management.data.remote.api

import com.borehole.management.data.model.CreateSurveyRequest
import com.borehole.management.data.model.Survey
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface SurveysApi {
    @POST("surveys")
    suspend fun createSurvey(
        @Header("Authorization") token: String,
        @Body survey: CreateSurveyRequest
    ): Response<Survey>
    
    @GET("surveys")
    suspend fun getAllSurveys(
        @Header("Authorization") token: String
    ): Response<List<Survey>>
    
    @GET("surveys/my-surveys")
    suspend fun getMySurveys(
        @Header("Authorization") token: String
    ): Response<List<Survey>>
    
    @GET("surveys/{id}")
    suspend fun getSurveyById(
        @Header("Authorization") token: String,
        @Path("id") surveyId: String
    ): Response<Survey>
    
    @GET("surveys/job/{jobId}")
    suspend fun getSurveyByJobId(
        @Header("Authorization") token: String,
        @Path("jobId") jobId: String
    ): Response<Survey>
    
    @Multipart
    @POST("surveys/{id}/upload-graph")
    suspend fun uploadGraph(
        @Header("Authorization") token: String,
        @Path("id") surveyId: String,
        @Part file: MultipartBody.Part
    ): Response<Survey>
    
    @POST("surveys/sync")
    suspend fun syncSurveys(
        @Header("Authorization") token: String,
        @Body surveys: List<CreateSurveyRequest>
    ): Response<SyncResponse>
}

data class SyncResponse(
    val synced: List<SyncedItem>,
    val failed: List<FailedItem>,
    val conflicts: List<ConflictItem>
)

data class SyncedItem(
    val id: String,
    val jobId: String,
    val deviceId: String?
)

data class FailedItem(
    val jobId: String,
    val reason: String
)

data class ConflictItem(
    val deviceId: String?,
    val jobId: String,
    val reason: String
)