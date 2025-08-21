package com.borehole.management.di

import android.content.Context
import com.borehole.management.data.local.BoreholeDatabase
import com.borehole.management.data.local.dao.JobDao
import com.borehole.management.data.local.dao.SurveyDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context
    ): BoreholeDatabase {
        return BoreholeDatabase.getDatabase(context)
    }
    
    @Provides
    @Singleton
    fun provideJobDao(database: BoreholeDatabase): JobDao {
        return database.jobDao()
    }
    
    @Provides
    @Singleton
    fun provideSurveyDao(database: BoreholeDatabase): SurveyDao {
        return database.surveyDao()
    }
}