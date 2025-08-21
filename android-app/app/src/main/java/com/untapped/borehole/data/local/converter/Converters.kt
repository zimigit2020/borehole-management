package com.untapped.borehole.data.local.converter

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.util.Date

class Converters {
    private val gson = Gson()
    
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }
    
    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }
    
    @TypeConverter
    fun fromIntList(value: String?): List<Int> {
        if (value == null) return emptyList()
        val listType = object : TypeToken<List<Int>>() {}.type
        return gson.fromJson(value, listType)
    }
    
    @TypeConverter
    fun fromIntListToString(list: List<Int>?): String {
        return gson.toJson(list ?: emptyList())
    }
    
    @TypeConverter
    fun fromStringList(value: String?): List<String> {
        if (value == null) return emptyList()
        val listType = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(value, listType)
    }
    
    @TypeConverter
    fun fromStringListToString(list: List<String>?): String {
        return gson.toJson(list ?: emptyList())
    }
}