/// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  const original = e.record.original();
  const currentStatus = e.record.get("payment_status");
  const previousStatus = original.get("payment_status");
  
  if (previousStatus !== "cancelled" && currentStatus === "cancelled") {
    const teacherId = e.record.get("teacher_id");
    const enrollmentId = e.record.id;
    const studentId = e.record.get("student_id");
    
    const notification = new Record("notifications", {
      teacher_id: teacherId,
      type: "student_cancelled",
      title: "Student Cancelled",
      message: "A student has cancelled their enrollment",
      related_data: JSON.stringify({
        student_id: studentId,
        enrollment_id: enrollmentId
      }),
      read: false
    });
    
    $app.save(notification);
  }
  e.next();
}, "enrollments");