package com.borehole.management.data.local

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.util.Date

class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }
    
    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }
    
    @TypeConverter
    fun fromFloatList(value: String?): List<Float>? {
        if (value == null) return null
        val type = object : TypeToken<List<Float>>() {}.type
        return Gson().fromJson(value, type)
    }
    
    @TypeConverter
    fun fromFloatListToString(list: List<Float>?): String? {
        if (list == null) return null
        return Gson().toJson(list)
    }
    
    @TypeConverter
    fun fromStringList(value: String?): List<String>? {
        if (value == null) return null
        val type = object : TypeToken<List<String>>() {}.type
        return Gson().fromJson(value, type)
    }
    
    @TypeConverter
    fun fromStringListToString(list: List<String>?): String? {
        if (list == null) return null
        return Gson().toJson(list)
    }
}