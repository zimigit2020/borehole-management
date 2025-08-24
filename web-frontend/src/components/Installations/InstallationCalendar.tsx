import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Installation } from '../../services/installationService';

interface InstallationCalendarProps {
  installations: Installation[];
  onViewDetails: (installation: Installation) => void;
}

const InstallationCalendar: React.FC<InstallationCalendarProps> = ({
  installations,
  onViewDetails,
}) => {
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getInstallationsForDay = (day: Date) => {
    return installations.filter((inst) => {
      if (!inst.scheduledDate) return false;
      return isSameDay(new Date(inst.scheduledDate), day);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in_progress':
        return '#2196f3';
      case 'scheduled':
        return '#9e9e9e';
      case 'on_hold':
        return '#ff9800';
      case 'failed':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {format(currentDate, 'MMMM yyyy')}
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={1}>
          {/* Week day headers */}
          {weekDays.map((day) => (
            <Grid key={day} size={{ xs: 12 / 7 }}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {day}
                </Typography>
              </Box>
            </Grid>
          ))}

          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const dayInstallations = getInstallationsForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <Grid key={day.toISOString()} size={{ xs: 12 / 7 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    minHeight: 100,
                    backgroundColor: isCurrentDay ? 'action.selected' : 'background.paper',
                    cursor: dayInstallations.length > 0 ? 'pointer' : 'default',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isCurrentDay ? 'bold' : 'normal',
                      color: isCurrentDay ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    {dayInstallations.slice(0, 3).map((inst) => (
                      <Chip
                        key={inst.id}
                        label={`${inst.job?.jobNumber || 'N/A'}`}
                        size="small"
                        sx={{
                          mb: 0.5,
                          width: '100%',
                          backgroundColor: getStatusColor(inst.status),
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                        onClick={() => onViewDetails(inst)}
                      />
                    ))}
                    {dayInstallations.length > 3 && (
                      <Typography variant="caption" color="textSecondary">
                        +{dayInstallations.length - 3} more
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2">Legend:</Typography>
        {[
          { status: 'scheduled', label: 'Scheduled' },
          { status: 'in_progress', label: 'In Progress' },
          { status: 'completed', label: 'Completed' },
          { status: 'on_hold', label: 'On Hold' },
        ].map((item) => (
          <Box key={item.status} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: getStatusColor(item.status),
                borderRadius: '2px',
              }}
            />
            <Typography variant="caption">{item.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default InstallationCalendar;