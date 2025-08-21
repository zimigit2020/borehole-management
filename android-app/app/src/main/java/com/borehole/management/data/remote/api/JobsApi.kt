package com.borehole.management.data.remote.api

import com.borehole.management.data.model.Job
import retrofit2.Response
import retrofit2.http.*

interface JobsApi {
    @GET("jobs")
    suspend fun getAllJobs(
        @Header("Authorization") token: String
    ): Response<List<Job>>
    
    @GET("jobs/assigned")
    suspend fun getAssignedJobs(
        @Header("Authorization") token: String
    ): Response<List<Job>>
    
    @GET("jobs/{id}")
    suspend fun getJobById(
        @Header("Authorization") token: String,
        @Path("id") jobId: String
    ): Response<Job>
    
    @POST("jobs/{id}/complete-survey")
    suspend fun completeSurvey(
        @Header("Authorization") token: String,
        @Path("id") jobId: String
    ): Response<Job>
}