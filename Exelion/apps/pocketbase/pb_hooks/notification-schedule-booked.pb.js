/// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  const original = e.record.original();
  const currentStatus = e.record.get("availability_status");
  const previousStatus = original.get("availability_status");
  
  if (previousStatus !== "Ocupado" && currentStatus === "Ocupado") {
    const teacherId = e.record.get("teacher_id");
    const scheduleId = e.record.id;
    
    const notification = new Record("notifications", {
      teacher_id: teacherId,
      type: "schedule_booked",
      title: "Schedule Booked",
      message: "A schedule slot has been booked",
      related_data: JSON.stringify({
        schedule_id: scheduleId
      }),
      read: false
    });
    
    $app.save(notification);
  }
  e.next();
}, "schedules");