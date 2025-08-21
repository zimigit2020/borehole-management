package com.untapped.borehole.presentation.survey

import android.Manifest
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberMultiplePermissionsState
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun SurveyFormScreen(
    jobId: String,
    jobName: String,
    onNavigateBack: () -> Unit,
    viewModel: SurveyFormViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    
    // Permission handling for camera and location
    val permissions = rememberMultiplePermissionsState(
        permissions = listOf(
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
    )
    
    // Camera launcher for resistivity graph
    val graphCameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            viewModel.onGraphPhotoCaptured()
        }
    }
    
    // Camera launcher for site photos
    val siteCameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            viewModel.onSitePhotoCaptured()
        }
    }
    
    // Gallery launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            viewModel.onPhotoSelected(it)
        }
    }
    
    LaunchedEffect(jobId) {
        viewModel.initializeSurvey(jobId, jobName)
        permissions.launchMultiplePermissionRequest()
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text("Survey Report", style = MaterialTheme.typography.titleMedium)
                        Text(
                            jobName,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    // Sync status indicator
                    if (!uiState.isOnline) {
                        Icon(
                            Icons.Default.CloudOff,
                            contentDescription = "Offline",
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                    } else if (uiState.isSyncing) {
                        CircularProgressIndicator(
                            modifier = Modifier
                                .size(24.dp)
                                .padding(horizontal = 8.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            Icons.Default.Cloud,
                            contentDescription = "Online",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                    }
                    
                    // Save draft button
                    IconButton(onClick = { viewModel.saveDraft() }) {
                        Icon(Icons.Default.Save, contentDescription = "Save Draft")
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            Surface(
                tonalElevation = 3.dp,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { viewModel.saveDraft() },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Save, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Save Draft")
                    }
                    
                    Button(
                        onClick = { 
                            viewModel.submitSurvey()
                            scope.launch {
                                snackbarHostState.showSnackbar(
                                    if (uiState.isOnline) 
                                        "Survey submitted successfully" 
                                    else 
                                        "Survey saved offline. Will sync when online."
                                )
                            }
                        },
                        modifier = Modifier.weight(1f),
                        enabled = uiState.isFormValid
                    ) {
                        Icon(Icons.Default.Send, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Submit")
                    }
                }
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // GPS Location Section
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                "GPS Location",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        
                        Spacer(Modifier.height(8.dp))
                        
                        if (uiState.currentLocation != null) {
                            Text(
                                "Lat: ${uiState.currentLocation.latitude}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Text(
                                "Lng: ${uiState.currentLocation.longitude}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Text(
                                "Accuracy: ${uiState.currentLocation.accuracy}m",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        } else {
                            Row {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp
                                )
                                Spacer(Modifier.width(8.dp))
                                Text("Acquiring GPS location...")
                            }
                        }
                        
                        Spacer(Modifier.height(8.dp))
                        
                        Button(
                            onClick = { viewModel.refreshLocation() },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.MyLocation, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Refresh GPS")
                        }
                    }
                }
            }
            
            // Site Information Section
            item {
                Text(
                    "Site Information",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                OutlinedTextField(
                    value = uiState.surveyData.siteName,
                    onValueChange = { viewModel.updateSiteName(it) },
                    label = { Text("Site Name *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    isError = uiState.surveyData.siteName.isEmpty()
                )
            }
            
            item {
                OutlinedTextField(
                    value = uiState.surveyData.constituency,
                    onValueChange = { viewModel.updateConstituency(it) },
                    label = { Text("Constituency *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    isError = uiState.surveyData.constituency.isEmpty()
                )
            }
            
            item {
                OutlinedTextField(
                    value = uiState.surveyData.ward,
                    onValueChange = { viewModel.updateWard(it) },
                    label = { Text("Ward *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    isError = uiState.surveyData.ward.isEmpty()
                )
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = uiState.surveyData.contactPerson,
                        onValueChange = { viewModel.updateContactPerson(it) },
                        label = { Text("Contact Person") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    
                    OutlinedTextField(
                        value = uiState.surveyData.contactPhone,
                        onValueChange = { viewModel.updateContactPhone(it) },
                        label = { Text("Phone") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                    )
                }
            }
            
            // Geological Data Section
            item {
                Divider()
                Text(
                    "Geological Data",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                OutlinedTextField(
                    value = uiState.surveyData.geology,
                    onValueChange = { viewModel.updateGeology(it) },
                    label = { Text("Geology Type *") },
                    placeholder = { Text("e.g., Granite rock, Sedimentary rock") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                    isError = uiState.surveyData.geology.isEmpty()
                )
            }
            
            item {
                OutlinedTextField(
                    value = uiState.surveyData.surveyMethod,
                    onValueChange = { viewModel.updateSurveyMethod(it) },
                    label = { Text("Survey Method *") },
                    placeholder = { Text("e.g., Electrical resistivity geophysical method") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    isError = uiState.surveyData.surveyMethod.isEmpty()
                )
            }
            
            // Drilling Recommendations Section
            item {
                Divider()
                Text(
                    "Drilling Recommendations",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = uiState.surveyData.minDepth,
                        onValueChange = { viewModel.updateMinDepth(it) },
                        label = { Text("Min Depth (m) *") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        isError = uiState.surveyData.minDepth.isEmpty()
                    )
                    
                    OutlinedTextField(
                        value = uiState.surveyData.maxDepth,
                        onValueChange = { viewModel.updateMaxDepth(it) },
                        label = { Text("Max Depth (m) *") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        isError = uiState.surveyData.maxDepth.isEmpty()
                    )
                }
            }
            
            // Water Breaks Section
            item {
                Column {
                    Text(
                        "Expected Water Breaks (meters)",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    Spacer(Modifier.height(8.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = uiState.newWaterBreak,
                            onValueChange = { viewModel.updateNewWaterBreak(it) },
                            label = { Text("Depth (m)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                        
                        Button(
                            onClick = { viewModel.addWaterBreak() },
                            enabled = uiState.newWaterBreak.isNotEmpty()
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Add")
                        }
                    }
                    
                    Spacer(Modifier.height(8.dp))
                    
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.surveyData.waterBreaks) { depth ->
                            AssistChip(
                                onClick = { viewModel.removeWaterBreak(depth) },
                                label = { Text("${depth}m") },
                                trailingIcon = {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = "Remove",
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            )
                        }
                    }
                }
            }
            
            item {
                OutlinedTextField(
                    value = uiState.surveyData.recommendations,
                    onValueChange = { viewModel.updateRecommendations(it) },
                    label = { Text("Recommendations *") },
                    placeholder = { Text("e.g., Use temporal casing to counteract collapsing formation") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 4,
                    isError = uiState.surveyData.recommendations.isEmpty()
                )
            }
            
            item {
                OutlinedTextField(
                    value = uiState.surveyData.specialNotes,
                    onValueChange = { viewModel.updateSpecialNotes(it) },
                    label = { Text("Special Notes (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3
                )
            }
            
            // Photo Section
            item {
                Divider()
                Text(
                    "Attachments",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            // Resistivity Graph
            item {
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            "Resistivity Graph",
                            style = MaterialTheme.typography.titleMedium
                        )
                        
                        Spacer(Modifier.height(8.dp))
                        
                        if (uiState.surveyData.resistivityGraphUri != null) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(200.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color.Gray.copy(alpha = 0.1f))
                            ) {
                                AsyncImage(
                                    model = uiState.surveyData.resistivityGraphUri,
                                    contentDescription = "Resistivity Graph",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Fit
                                )
                                
                                IconButton(
                                    onClick = { viewModel.removeResistivityGraph() },
                                    modifier = Modifier.align(Alignment.TopEnd)
                                ) {
                                    Icon(
                                        Icons.Default.Delete,
                                        contentDescription = "Remove",
                                        tint = MaterialTheme.colorScheme.error
                                    )
                                }
                            }
                        }
                        
                        Spacer(Modifier.height(8.dp))
                        
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = {
                                    viewModel.prepareGraphPhotoCapture()?.let { uri ->
                                        graphCameraLauncher.launch(uri)
                                    }
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.CameraAlt, contentDescription = null)
                                Spacer(Modifier.width(8.dp))
                                Text("Camera")
                            }
                            
                            OutlinedButton(
                                onClick = { galleryLauncher.launch("image/*") },
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Photo, contentDescription = null)
                                Spacer(Modifier.width(8.dp))
                                Text("Gallery")
                            }
                        }
                    }
                }
            }
            
            // Site Photos
            item {
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "Site Photos",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                "${uiState.surveyData.sitePhotoUris.size}/10",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        
                        Spacer(Modifier.height(8.dp))
                        
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(uiState.surveyData.sitePhotoUris) { uri ->
                                Box(
                                    modifier = Modifier
                                        .size(100.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                ) {
                                    AsyncImage(
                                        model = uri,
                                        contentDescription = "Site Photo",
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                    
                                    IconButton(
                                        onClick = { viewModel.removeSitePhoto(uri) },
                                        modifier = Modifier
                                            .align(Alignment.TopEnd)
                                            .size(24.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Close,
                                            contentDescription = "Remove",
                                            tint = Color.White,
                                            modifier = Modifier
                                                .background(
                                                    Color.Black.copy(alpha = 0.5f),
                                                    RoundedCornerShape(12.dp)
                                                )
                                                .padding(4.dp)
                                        )
                                    }
                                }
                            }
                            
                            if (uiState.surveyData.sitePhotoUris.size < 10) {
                                item {
                                    Card(
                                        modifier = Modifier
                                            .size(100.dp)
                                            .clickable {
                                                viewModel.prepareSitePhotoCapture()?.let { uri ->
                                                    siteCameraLauncher.launch(uri)
                                                }
                                            },
                                        colors = CardDefaults.cardColors(
                                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                                        )
                                    ) {
                                        Box(
                                            modifier = Modifier.fillMaxSize(),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(
                                                Icons.Default.AddAPhoto,
                                                contentDescription = "Add Photo",
                                                modifier = Modifier.size(32.dp),
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Offline status info
            if (!uiState.isOnline) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.CloudOff,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onErrorContainer
                            )
                            Spacer(Modifier.width(8.dp))
                            Column {
                                Text(
                                    "Working Offline",
                                    style = MaterialTheme.typography.titleSmall,
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                                Text(
                                    "Data will be synced when connection is restored",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}