/// <reference path="../pb_data/types.d.ts" />
// Hook to handle temporary schedule reservations with timeout
// When a schedule is marked as 'Reservado', set a 10-minute timeout
// If payment is not completed after 10 minutes, revert status to 'Disponível'

onRecordAfterUpdateSuccess((e) => {
  // Only process schedules collection
  if (e.record.get("availability_status") === "Reservado") {
    const scheduleId = e.record.id;
    const scheduleRecord = e.record;
    
    // Set a timeout for 10 minutes (600000 milliseconds)
    setTimeout(() => {
      try {
        // Fetch the latest schedule record
        const currentSchedule = $app.findRecordById("schedules", scheduleId);
        
        // Check if still in 'Reservado' state
        if (currentSchedule.get("availability_status") === "Reservado") {
          // Find any pending enrollments for this schedule
          const pendingEnrollments = $app.findRecordsByFilter(
            "enrollments",
            "schedule_id = '" + scheduleId + "' && payment_status = 'pending'",
            { limit: 1 }
          );
          
          // If there are pending enrollments, check if timeout has passed
          if (pendingEnrollments && pendingEnrollments.length > 0) {
            const enrollment = pendingEnrollments[0];
            const createdAt = new Date(enrollment.get("created_at"));
            const now = new Date();
            const diffMinutes = (now - createdAt) / (1000 * 60);
            
            // If more than 10 minutes have passed and payment still pending, revert schedule
            if (diffMinutes >= 10) {
              currentSchedule.set("availability_status", "Disponível");
              $app.save(currentSchedule);
              console.log("Schedule " + scheduleId + " reverted from Reservado to Disponível due to payment timeout");
            }
          }
        }
      } catch (err) {
        console.error("Error in schedule reservation timeout: " + err.message);
      }
    }, 600000); // 10 minutes in milliseconds
  }
  
  e.next();
}, "schedules");

// Alternative hook: Monitor enrollment payment status changes
// If an enrollment payment is completed, keep the schedule as 'Reservado'
// If payment fails/is cancelled, revert schedule to 'Disponível'

onRecordAfterUpdateSuccess((e) => {
  const paymentStatus = e.record.get("payment_status");
  const scheduleId = e.record.get("schedule_id");
  
  if (scheduleId && paymentStatus) {
    try {
      const schedule = $app.findRecordById("schedules", scheduleId);
      
      if (paymentStatus === "approved") {
        // Payment successful - keep schedule as Reservado (or mark as Ocupado if needed)
        if (schedule.get("availability_status") === "Reservado") {
          // Schedule remains Reservado - payment is confirmed
          console.log("Schedule " + scheduleId + " payment approved");
        }
      } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
        // Payment failed/cancelled - revert schedule to available
        if (schedule.get("availability_status") === "Reservado") {
          schedule.set("availability_status", "Disponível");
          $app.save(schedule);
          console.log("Schedule " + scheduleId + " reverted to Disponível due to payment " + paymentStatus);
        }
      }
    } catch (err) {
      console.error("Error updating schedule status: " + err.message);
    }
  }
  
  e.next();
}, "enrollments");