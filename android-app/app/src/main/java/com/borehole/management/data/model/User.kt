package com.borehole.management.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class User(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: UserRole,
    val phone: String? = null
) : Parcelable

enum class UserRole {
    ADMIN,
    PROJECT_MANAGER,
    SURVEYOR,
    DRILLER
}

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val access_token: String,
    val user: User
)