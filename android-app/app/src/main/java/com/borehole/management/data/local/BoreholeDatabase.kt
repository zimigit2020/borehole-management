package com.borehole.management.data.local

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import android.content.Context
import com.borehole.management.data.local.dao.JobDao
import com.borehole.management.data.local.dao.SurveyDao
import com.borehole.management.data.local.entity.JobEntity
import com.borehole.management.data.local.entity.SurveyEntity

@Database(
    entities = [
        JobEntity::class,
        SurveyEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class BoreholeDatabase : RoomDatabase() {
    
    abstract fun jobDao(): JobDao
    abstract fun surveyDao(): SurveyDao
    
    companion object {
        @Volatile
        private var INSTANCE: BoreholeDatabase? = null
        
        fun getDatabase(context: Context): BoreholeDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    BoreholeDatabase::class.java,
                    "borehole_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}