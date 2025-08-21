package com.borehole.management.data.remote.api

import com.borehole.management.data.model.LoginRequest
import com.borehole.management.data.model.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @POST("auth/refresh")
    suspend fun refreshToken(@Header("Authorization") token: String): Response<LoginResponse>
    
    @GET("auth/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<com.borehole.management.data.model.User>
}