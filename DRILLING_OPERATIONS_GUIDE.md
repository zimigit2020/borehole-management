# Drilling Operations Module - User Guide

## Overview
The Drilling Operations module manages the actual drilling phase after geological surveys have been completed. It tracks active drilling jobs, generates drilling reports, and handles both successful wells and dry holes.

## Workflow

### 1. Job Flow States
```
Survey Completed → Job Assigned → Drilling Started → Drilling Completed → Report Generated
                                                              ↓
                                              [Dry Hole → End] OR [Successful → Installation]
```

## Module Features

### Active Jobs Tab
Shows all drilling jobs in progress with their current status:

- **Assigned** - Job assigned to drilling team but not started
- **Drilling** - Active drilling in progress
- **Testing** - Water yield testing phase
- **Completed** - Drilling finished, report pending

**Actions Available:**
- **Start Drilling** - Moves job from assigned to drilling status
- **Complete Report** - Opens drilling report form (for jobs in drilling status)
- **Update Test Results** - Enter water yield test results

### Drilling Reports Tab
Contains all completed drilling reports with comprehensive data:

**Report Fields (matching physical drilling report):**
- **Report Number** - Unique identifier (e.g., 0523)
- **BH No.** - Borehole number
- **Client Details** - Name, contact, address
- **Drilling Depths:**
  - Site Depth - Target depth
  - End of Hole - Actual depth reached
- **Water Breaks** - Depths where water was encountered (Break 1, 2, 3)
- **Casing Information:**
  - Size (e.g., 155mm)
  - Length in meters
  - Type (e.g., 140 casing)
- **Ground Profile** - Geological layers encountered (e.g., "1-6m: Sandy, 6-90m: Granite")
- **Bit Sizes Used** - Different drill bit sizes for different depths
- **Water Yield** - Flow rate (e.g., 2000L/hr) or "Dry"
- **Crew Information:**
  - Site Manager
  - Driller
  - Offsider (assistant)
- **Equipment Hours:**
  - Compressor hours
  - Donkey (engine) hours
  - Rig hours
  - Fuel consumption (liters)
- **GPS Coordinates** - Start and end positions

**Report Actions:**
- **View** - See full report details
- **Print** - Generate printable version
- **Edit** - Modify report data

### Dry Holes Tab
Special tracking for unsuccessful drilling attempts:

**Why Track Dry Holes?**
- No water found at any depth
- Helps identify problematic areas
- Prevents repeat failures in same location
- Important for billing/cost recovery

**Dry Hole Actions:**
- **Request Re-survey** - New geological survey at different location
- **Close Job** - End the job as unsuccessful

## How to Use

### Creating a Drilling Report

1. Go to **Active Jobs** tab
2. Find the job currently being drilled
3. Click **Complete Report** button
4. Fill in the drilling report form:

#### Basic Information Section
- Date and Report Number
- Client details from job
- Site location and BH number

#### Drilling Details Section
- Enter actual depth reached
- Record all water break depths (leave 0 if none)
- Note the ground profile/geology encountered

#### Water & Casing Section
- Select casing size and type
- Enter total meters of casing used
- Record water yield (liters/hour or mark as dry)

#### Crew & Equipment Section
- Enter crew member names
- Record equipment operating hours
- Calculate fuel consumption
- Add GPS coordinates

5. **Review** all information
6. Mark as **Dry Hole** if no water found, or **Successful** if water located
7. **Submit** the report

### Handling Different Outcomes

#### Successful Well
- Report shows water yield > 0
- Job moves to installation phase
- Can proceed with pump installation
- Generate invoice for client

#### Dry Hole
- No water encountered
- Report marked as dry hole
- Appears in Dry Holes tab
- Options:
  - Request new survey location
  - Close job and bill for work done
  - Document reasons for failure

### Key Metrics Tracked

1. **Total Boreholes Drilled** - All drilling attempts
2. **Successful Wells** - Water-producing boreholes
3. **Dry Holes** - Failed attempts
4. **Currently Drilling** - Active operations

### Important Notes

- **Always complete reports same day** - Equipment hours and details are easier to record immediately
- **Take photos** - Document the site, equipment setup, and any issues
- **GPS coordinates** - Record both start and end positions for accuracy
- **Water breaks** - Record ALL depths where water was encountered, even minor ones
- **Fuel tracking** - Important for job costing and billing

### Integration with Other Modules

- **Survey Reports** → Provides geological data and recommendations
- **Jobs** → Source of drilling assignments
- **Inventory** → Tracks equipment and supplies used
- **Finance** → Generates invoices based on drilling reports

## Common Scenarios

### Scenario 1: Normal Successful Drilling
1. Receive job from surveys
2. Start drilling
3. Hit water at expected depths
4. Complete to target depth
5. Submit successful report
6. Proceed to installation

### Scenario 2: Dry Hole
1. Drill to maximum recommended depth
2. No water encountered
3. Mark as dry hole
4. Request alternative site survey
5. Close original job

### Scenario 3: Partial Success
1. Water found but low yield
2. Document actual yield
3. Discuss with client about:
   - Accepting lower yield
   - Drilling deeper
   - Alternative site

## Tips for Accurate Reporting

1. **Document everything** - Better to have too much information than too little
2. **Use consistent units** - Always use meters for depth, liters for fuel
3. **Time tracking** - Record actual operating hours, not elapsed time
4. **Photo evidence** - Especially important for dry holes or difficult conditions
5. **Client communication** - Keep client informed during drilling, especially if issues arise

## Report Review Checklist

Before submitting a drilling report, verify:
- [ ] All depths are accurate
- [ ] Water breaks recorded
- [ ] Casing details complete
- [ ] Crew names entered
- [ ] Equipment hours logged
- [ ] Fuel consumption calculated
- [ ] GPS coordinates captured
- [ ] Result (successful/dry) marked correctly
- [ ] Special notes added if needed

This module is critical for operations as it:
- Documents billable work
- Tracks success rates
- Identifies problem areas
- Provides data for future surveys
- Ensures accountability